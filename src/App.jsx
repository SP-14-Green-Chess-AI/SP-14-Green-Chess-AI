// App.jsx
import React, { useState, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import useMultiplayer from "./components/useMultiplayer";
import { themes } from "./themes";
import { boardThemes, getCustomPieces } from "./components/boardThemes";
import { Bishop, Rook, Knight, Queen, King, Pawn } from "./components/Pieces";
import { DefaultKing, DefaultQueen, DefaultRook, DefaultBishop, DefaultKnight, DefaultPawn } from "./components/DefaultPieces";

export default function App() {
  // Use production backend URL from the second file
  const backendUrl = "httpss://localhost:8000";
  const gameRef = useRef(new Chess());
  const wsRef = useRef(null);
  const [fen, setFen] = useState(gameRef.current.fen());
  const [moveHistory, setMoveHistory] = useState([]);
  const [playMode, setPlayMode] = useState("local");
  const [gamemode, setGamemode] = useState("engine");
  const [gameId, setGameId] = useState("");
  const [gameIdInput, setGameIdInput] = useState("");
  const [playerColor, setPlayerColor] = useState(null);
  const [gameStatus, setGameStatus] = useState("");
  const [availableGames, setAvailableGames] = useState([]);
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [selectedPieceTheme, setSelectedPieceTheme] = useState("Classic");
  const [selectedBoardTheme, setSelectedBoardTheme] = useState("Sand");
  const [useDefaultPieces, setUseDefaultPieces] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  // Memoize custom pieces for performance
  const customPieces = React.useMemo(
    () => getCustomPieces(useDefaultPieces, selectedPieceTheme, themes),
    [useDefaultPieces, selectedPieceTheme]
  );

  // Pass all necessary multiplayer props, using gameId instead of selectedRoom for consistency
  useMultiplayer({
    playMode,
    gameId,
    backendUrl,
    gameRef,
    wsRef,
    setPlayerColor,
    setFen,
    setMoveHistory,
    setGameStatus,
    setAvailableGames,
  });

  // Fetch evaluation for engine mode
  useEffect(() => {
    const fetchEval = async () => {
      try {
        const res = await fetch(`${backendUrl}/evalbar/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fen }),
        });
        const data = await res.json();
        setEvaluation(data.evaluation);
      } catch (err) {
        console.error("Error fetching evaluation:", err);
        setEvaluation(null);
      }
    };

    if (playMode === "engine") {
      fetchEval();
    }
  }, [fen, playMode, backendUrl]);

  function onDrop(source, target) {
    // Check game status and player turn for multiplayer
    if (gameStatus !== "ongoing" && playMode === "multiplayer") {
      console.log("Game over:", gameStatus);
      return false;
    }

    if (playMode === "multiplayer" && !playerColor) {
      console.log("No player color assigned");
      return false;
    }

    if (playMode === "multiplayer") {
      const turn = gameRef.current.turn();
      if ((turn === "w" && playerColor !== "white") || (turn === "b" && playerColor !== "black")) {
        console.log("Not your turn");
        return false;
      }
    }

    try {
      const move = gameRef.current.move({ from: source, to: target, promotion: "q" });
      if (!move) return false;
      setFen(gameRef.current.fen());
      setMoveHistory((prev) => [...prev, move.san]);
      if (playMode === "multiplayer" && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "move", from: source, to: target }));
      }
      return true;
    } catch (err) {
      console.error("Invalid move:", err);
      return false;
    }
  }

  function resetGame() {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setMoveHistory([]);
    setGameStatus("");
    if (playMode === "multiplayer" && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "reset" }));
    }
  }

  function undoMove() {
    gameRef.current.undo();
    setFen(gameRef.current.fen());
    setMoveHistory((prev) => prev.slice(0, -1));
  }

  function flipBoard() {
    setBoardOrientation((prev) => (prev === "white" ? "black" : "white"));
  }

  function makeEngineMove() {
    fetch(`${backendUrl}/best-move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen: gameRef.current.fen(), game_mode: gamemode }),
    })
      .then((res) => res.json())
      .then((data) => {
        const move = gameRef.current.move(data.best_move);
        if (move) {
          setFen(gameRef.current.fen());
          setMoveHistory((prev) => [...prev, move.san]);
        }
      })
      .catch((err) => console.error("Error making engine move:", err));
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "50px auto", textAlign: "center" }}>
      <h1>React Chess App</h1>

      {/* Play Mode Selection */}
      <div style={{ marginBottom: "20px" }}>
        <label><strong>Play Mode: </strong></label>
        <select value={playMode} onChange={(e) => setPlayMode(e.target.value)}>
          <option value="local">Local (2 Players)</option>
          <option value="engine">vs Engine</option>
          <option value="multiplayer">Multiplayer</option>
        </select>
      </div>

      {/* Multiplayer Room Selection */}
      {playMode === "multiplayer" && (
        <div style={{ marginBottom: "20px" }}>
          {gameStatus && (
            <div style={{ color: "red", marginBottom: "10px" }}>
              {gameStatus.charAt(0).toUpperCase() + gameStatus.slice(1)}
            </div>
          )}
          {playerColor && (
            <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
              You are: <strong>{playerColor.toUpperCase()}</strong>
            </div>
          )}
          <div>
            <label><strong>Join Game: </strong></label>
            <select value={gameId} onChange={(e) => setGameId(e.target.value)}>
              <option value="">Select a game</option>
              {availableGames.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: "10px" }}>
            <label><strong>Or enter Game ID: </strong></label>
            <input
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
              placeholder="e.g., game123"
              style={{ marginLeft: "10px" }}
            />
            <button
              onClick={() => {
                if (gameIdInput.trim()) {
                  setGameId(gameIdInput.trim());
                  setGameIdInput("");
                }
              }}
              style={{ marginLeft: "10px" }}
            >
              Join
            </button>
          </div>
          <button
            onClick={() => setGameId(crypto.randomUUID())}
            style={{ marginTop: "10px" }}
          >
            Create New Game
          </button>
          {gameId && (
            <div style={{ marginTop: "10px", fontWeight: "bold" }}>
              Game ID: <strong>{gameId}</strong>
            </div>
          )}
        </div>
      )}

      {/* Theme Selectors */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", gap: "30px" }}>
        <div>
          <label>Piece Style: </label>
          <select
            value={useDefaultPieces ? "Default" : "Custom"}
            onChange={(e) => setUseDefaultPieces(e.target.value === "Default")}
          >
            <option value="Custom">Custom</option>
            <option value="Default">Default</option>
          </select>
        </div>
        <div>
          <label>Piece Theme: </label>
          <select
            value={selectedPieceTheme}
            onChange={(e) => setSelectedPieceTheme(e.target.value)}
          >
            {Object.keys(themes).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Board Theme: </label>
          <select
            value={selectedBoardTheme}
            onChange={(e) => setSelectedBoardTheme(e.target.value)}
          >
            {Object.keys(boardThemes).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Evaluation Bar for Engine Mode */}
      {playMode === "engine" && (
        <div style={{ marginBottom: "20px" }}>
          <strong>Evaluation: </strong>
          {evaluation !== null ? evaluation : "Loading..."}
        </div>
      )}

      {/* Chessboard and Controls */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "40px" }}>
        <div>
          <Chessboard
            id="chessboard"
            boardWidth={600}
            position={fen}
            boardOrientation={boardOrientation}
            onPieceDrop={onDrop}
            customPieces={customPieces}
            customDarkSquareStyle={{ backgroundColor: boardThemes[selectedBoardTheme]?.dark }}
            customLightSquareStyle={{ backgroundColor: boardThemes[selectedBoardTheme]?.light }}
          />
          <button onClick={flipBoard} style={{ marginTop: "10px", height: "40px" }}>
            Flip Board
          </button>
        </div>
        <div style={{ textAlign: "left" }}>
          <h2>Move History</h2>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              height: "400px",
              overflowY: "scroll",
              width: "250px",
            }}
          >
            {moveHistory.length ? (
            <ol>
              {moveHistory.reduce((acc, move, i) => {
                if (i % 2 === 0) acc.push([move]);
                else acc[acc.length - 1].push(move);
                return acc;
              }, []).map((pair, i) => (
                <li key={i}>{`${pair[0]} ${pair[1] || ""}`}</li>  // remove i + 1.
                // or just <li key={i}>{pair.join(" ")}</li>
              ))}
            </ol>
          ) : (
            <p>No moves yet.</p>
          )}
          </div>
          <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={resetGame}>Reset Game</button>
            <button onClick={undoMove} disabled={!moveHistory.length}>
              Undo Move
            </button>
            {playMode === "engine" && (
              <>
                <button onClick={makeEngineMove}>Make Engine Move</button>
                <div style={{ marginTop: "10px" }}>
                  <label><strong>Engine Mode: </strong></label>
                  <select value={gamemode} onChange={(e) => setGamemode(e.target.value)}>
                    <option value="engine">Stockfish Engine</option>
                    <option value="minimax">Minimax</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}