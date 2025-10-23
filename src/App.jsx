import React, { useState, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { themes } from "./themes";
import { boardThemes,getCustomPieces} from "./components/boardThemes";
import { Bishop, Rook, Knight, Queen, King, Pawn } from "./components/Pieces";
import { DefaultKing, DefaultQueen, DefaultRook, DefaultBishop, DefaultKnight, DefaultPawn } from "./components/DefaultPieces";
import useMultiplayer from "./components/useMultiplayer"; 

export default function App() {
  const backendUrl = "https://sp-14-green-chess-ai.onrender.com";
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [moveHistory, setMoveHistory] = useState([]);
  const [boardOrientation, setOrientation] = useState("white");
  const [selectedPieceTheme, setSelectedPieceTheme] = useState("Classic");
  const [selectedBoardTheme, setSelectedBoardTheme] = useState("Sand");
  const [useDefaultPieces, setUseDefaultPieces] = useState(false);
  const [playMode, setPlayMode] = useState("local");
  const [gamemode, setGamemode] = useState("engine");
  const [evaluation, setEvaluation] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const wsRef = useRef(null)
  const customPieces = React.useMemo(
    () => getCustomPieces(useDefaultPieces, selectedPieceTheme, themes),
    [useDefaultPieces, selectedPieceTheme]
  );

 useMultiplayer({
    playMode,
    selectedRoom,
    backendUrl,
    gameRef,
    wsRef,
    setAvailableRooms,
    setPlayerColor,
    setFen,
    setMoveHistory,
  });

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
  }, [fen, playMode]);

  function onDrop(sourceSquare, targetSquare) {
    if (playMode === "multiplayer") {
      const currentTurn = gameRef.current.turn();
      const myTurn = (currentTurn === 'w' && playerColor === 'white') ||
                     (currentTurn === 'b' && playerColor === 'black');
      if (!myTurn) {
        console.log("Not your turn!");
        return false;
      }
    }

    const move = gameRef.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q"
    });
    if (!move) return false;

    setFen(gameRef.current.fen());
    setMoveHistory(prev => [...prev, move.san]);

    if (playMode === "multiplayer" && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ from: sourceSquare, to: targetSquare }));
    }

    return true;
  }

  function resetGame() {
    gameRef.current.reset();
    setFen(gameRef.current.fen());
    setMoveHistory([]);
  }

  function undoMove() {
    gameRef.current.undo();
    setFen(gameRef.current.fen());
    setMoveHistory(prev => prev.slice(0, -1));
  }
  function flipBoard() {
    setOrientation(prev => (prev === "white" ? "black" : "white"));
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

        {playMode === "multiplayer" && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ marginBottom: "10px" }}>
              <label><strong>Join a Room: </strong></label>
              <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
                <option value="">Select a room</option>
                {availableRooms.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label><strong>Or enter a room name: </strong></label>
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="e.g. alpha123"
                style={{ marginLeft: "10px" }}
              />
              <button onClick={() => {
                if (roomInput.trim()) {
                  setSelectedRoom(roomInput.trim());
                }
              }} style={{ marginLeft: "10px" }}>
                Join
              </button>
            </div>

            <button onClick={() => {
              const newRoomId = crypto.randomUUID();
              setSelectedRoom(newRoomId);
            }}>
              Create New Room
            </button>

            {selectedRoom && (
              <div style={{ marginTop: "10px", fontWeight: "bold" }}>
                Room ID: {selectedRoom}
              </div>
            )}

            {playerColor && (
              <div style={{ marginTop: "10px", fontWeight: "bold", color: playerColor === "white" ? "#333" : "#000" }}>
                You are: {playerColor.toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Theme selectors */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", gap: "30px" }}>
        <div>
          <label>Piece Style: </label>
          <select value={useDefaultPieces ? "Default" : "Custom"} onChange={e => setUseDefaultPieces(e.target.value === "Default")}>
            <option value="Custom">Custom</option>
            <option value="Default">Default</option>
          </select>
        </div>
        <div>
          <label>Piece Theme: </label>
          <select value={selectedPieceTheme} onChange={e => setSelectedPieceTheme(e.target.value)}>
            {Object.keys(themes).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label>Board Theme: </label>
          <select value={selectedBoardTheme} onChange={e => setSelectedBoardTheme(e.target.value)}>
            {Object.keys(boardThemes).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Evaluation Bar (only for engine mode) */}
      {playMode === "engine" && (
        <div style={{ marginBottom: "20px" }}>
          <strong>Evaluation:</strong> {evaluation !== null ? evaluation : "Loading..."}
        </div>
      )}
       
        <button onClick={flipBoard} style={{ height: "40px", alignSelf: "center" }}>Flip Board</button>
        
      {/* Board and Move History */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "40px" }}>
        <Chessboard
          id="ChessBoard"
          boardWidth={600}
          position={fen}
          boardOrientation= {boardOrientation}
          onPieceDrop={onDrop}
          customPieces={customPieces}
          customDarkSquareStyle={{ backgroundColor: boardThemes[selectedBoardTheme]?.dark }}
          customLightSquareStyle={{ backgroundColor: boardThemes[selectedBoardTheme]?.light }}
        />
        <div style={{ textAlign: "left" }}>
          <h2>Move History</h2>
          <div style={{
            border: "1px solid #ccc",
            padding: "10px",
            height: "400px",
            overflowY: "scroll",
            width: "250px"
          }}>
            {moveHistory.length ? (
              <ol>{moveHistory.map((m, i) => <li key={i}>{m}</li>)}</ol>
            ) : (
              <p>No moves yet.</p>
            )}
          </div>

          <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={resetGame}>Reset Game</button>
            <button onClick={undoMove} disabled={!moveHistory.length}>Undo Move</button>

            {playMode === "engine" && (
              <>
                <button onClick={makeEngineMove}>Make Engine Move</button>
                <div style={{ marginTop: "10px" }}>
                  <label><strong>Engine Mode:</strong></label>
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
