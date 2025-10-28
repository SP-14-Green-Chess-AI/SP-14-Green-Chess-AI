import React, { useState, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import useMultiplayer from "./components/useMultiplayer";
import { themes } from "./themes";
import { boardThemes, getCustomPieces } from "./components/boardThemes";
import { Bishop, Rook, Knight, Queen, King, Pawn } from "./components/Pieces";
import { DefaultKing, DefaultQueen, DefaultRook, DefaultBishop, DefaultKnight, DefaultPawn } from "./components/DefaultPieces";

export default function App() {
  const backendUrl = "http://localhost:8000"; // Fixed typo
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
  const [chatMessages, setChatMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [username, setUsername] = useState(() => localStorage.getItem("chessUsername") || "Anonymous");
  const [chatError, setChatError] = useState("");
  const [isEngineThinking, setIsEngineThinking] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Save username to localStorage
  useEffect(() => {
    localStorage.setItem("chessUsername", username);
  }, [username]);

  // Memoize custom pieces
  const customPieces = React.useMemo(
    () => getCustomPieces(useDefaultPieces, selectedPieceTheme, themes),
    [useDefaultPieces, selectedPieceTheme]
  );

  // Multiplayer hook
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
    setChatMessages,
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

   useEffect(() => {
    if (playMode === "multiplayer" && !gameId) {
      // Fetch immediately
      fetch(`${backendUrl}/waiting-games/`)
        .then(res => res.json())
        .then(data => {
          console.log("Fetched games:", data.games);
          setAvailableGames(data.games);
        })
        .catch(err => console.error("Error fetching games:", err));

      // Poll every 3 seconds
      const interval = setInterval(() => {
        fetch(`${backendUrl}/waiting-games/`)
          .then(res => res.json())
          .then(data => setAvailableGames(data.games))
          .catch(err => console.error("Error fetching games:", err));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [playMode, gameId, backendUrl]);

  function onDrop(source, target) {
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
    setChatMessages([]);
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
  if (isEngineThinking) return; // Add this line

  setIsEngineThinking(true); // Add this line

  fetch(`${backendUrl}/best-move/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fen: gameRef.current.fen(), game_mode: gamemode }),
  })
    .then((res) => res.json())
    .then((data) => {
      const uciMove = data.best_move;
      const from = uciMove.substring(0, 2);
      const to = uciMove.substring(2, 4);
      const promotion = uciMove.length > 4 ? uciMove.substring(4) : undefined;

      const move = gameRef.current.move({ from, to, promotion });
      if (move) {
        setFen(gameRef.current.fen());
        setMoveHistory((prev) => [...prev, move.san]);
      } else {
        console.error("Invalid move from engine:", uciMove);
      }
    })
    .catch((err) => console.error("Error making engine move:", err))
    .finally(() => setIsEngineThinking(false)); // Add this line
}

  function sendChatMessage() {
    if (!messageText.trim()) {
      setChatError("Message cannot be empty");
      setTimeout(() => setChatError(""), 3000);
      return;
    }
    if (playMode !== "multiplayer") {
      setChatError("Chat available in multiplayer mode only");
      setTimeout(() => setChatError(""), 3000);
      return;
    }
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      setChatError("Not connected to game");
      setTimeout(() => setChatError(""), 3000);
      return;
    }
    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        username: username || "Anonymous",
        message: messageText,
      })
    );
    setMessageText("");
    setChatError("");
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "20px auto", textAlign: "center" }}>
      <h1>React Chess App</h1>

      {/* Play Mode Selection */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          <strong>Play Mode: </strong>
        </label>
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
            <label>
              <strong>Join Game: </strong>
            </label>
            <select value={gameId} onChange={(e) => setGameId(e.target.value)}>
              <option value="">Select a game</option>
              {availableGames.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: "10px" }}>
            <label>
              <strong>Or enter Game ID: </strong>
            </label>
            <input
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
              placeholder="e.g., game123"
              style={{ marginLeft: "10px", padding: "5px" }}
            />
            <button
              onClick={() => {
                if (gameIdInput.trim()) {
                  setGameId(gameIdInput.trim());
                  setGameIdInput("");
                }
              }}
              style={{ marginLeft: "10px", padding: "5px 10px" }}
            >
              Join
            </button>
          </div>
          <button
            onClick={() => setGameId(crypto.randomUUID())}
            style={{ marginTop: "10px", padding: "5px 10px" }}
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
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", gap: "20px" }}>
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

      {/* Main Layout */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>

        {/* Chessboard */}
        <div>
          <Chessboard
            id="chessboard"
            boardWidth={500} // Reduced to fit chat
            position={fen}
            boardOrientation={boardOrientation}
            onPieceDrop={onDrop}
            customPieces={customPieces}
            customDarkSquareStyle={{ backgroundColor: boardThemes[selectedBoardTheme]?.dark }}
            customLightSquareStyle={{ backgroundColor: boardThemes[selectedBoardTheme]?.light }}
          />
          <button onClick={flipBoard} style={{ marginTop: "10px", padding: "5px 10px" }}>
            Flip Board
          </button>
        </div>

        {/* Move History and Controls */}
        <div style={{ width: "200px" }}>
          <h3>Move History</h3>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              height: "150px",
              overflowY: "scroll",
              marginBottom: "10px",
            }}
          >
            {moveHistory.length ? (
              <ol style={{ margin: 0, paddingLeft: "20px" }}>
                {moveHistory.reduce((acc, move, i) => {
                  if (i % 2 === 0) acc.push([move]);
                  else acc[acc.length - 1].push(move);
                  return acc;
                }, []).map((pair, i) => (
                  <li key={i} style={{ marginBottom: "5px" }}>{pair.join(" ")}</li>
                ))}
              </ol>
            ) : (
              <p>No moves yet.</p>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button onClick={resetGame} style={{ padding: "5px 10px" }}>
              Reset Game
            </button>
            <button
              onClick={undoMove}
              disabled={!moveHistory.length}
              style={{ padding: "5px 10px" }}
            >
              Undo Move
            </button>

            {playMode === "engine" && (
                <>
                    <button onClick={makeEngineMove} disabled={isEngineThinking} style={{ padding: "5px 10px" }}>
                        {isEngineThinking ? "Thinking..." : "Make Engine Move"}
                    </button>
                    <select
                        value={gamemode}
                        onChange={(e) => setGamemode(e.target.value)}
                        style={{ padding: "5px", marginTop: "8px" }}
                    >
                        <option value="engine">Stockfish Engine</option>
                        <option value="minimax">Minimax</option>
                    </select>
                </>
            )}
          </div>
        </div>
        {/* Chat Section */}
        {playMode === "multiplayer" && (
          <div style={{ width: "200px" }}>
            <h3>Chat</h3>
            <input
              type="text"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%", padding: "5px", marginBottom: "10px" }}
            />
            <div
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                height: "150px",
                overflowY: "scroll",
                marginBottom: "10px",
              }}
            >
              {chatMessages.length ? (
                chatMessages.map((msg, index) => (
                  <div key={index} style={{ marginBottom: "8px", fontSize: "14px" }}>
                    <strong>{msg.username}:</strong> {msg.message}
                    <small style={{ color: "gray", display: "block" }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </small>
                  </div>
                ))
              ) : (
                <p>No messages yet.</p>
              )}
              <div ref={messagesEndRef} />
            </div>
            {chatError && (
              <div style={{ color: "red", fontSize: "12px", marginBottom: "8px" }}>
                {chatError}
              </div>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                style={{ flex: 1, padding: "5px" }}
              />
              <button onClick={sendChatMessage} style={{ padding: "5px 10px" }}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}