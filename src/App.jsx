import React, { useState, useRef, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

export default function App() {
  const backendUrl = "http://127.0.0.1:8000";
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [moveHistory, setMoveHistory] = useState([]);
  const [gamemode, setGamemode] = useState("engine");
  const [evaluation, setEvaluation] = useState(null); // store evaluation

  // Fetch evaluation whenever FEN changes
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
      }
    };

    fetchEval();
  }, [fen]);

  function onDrop(sourceSquare, targetSquare) {
    const move = gameRef.current.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (!move) return false;
    setFen(gameRef.current.fen());
    setMoveHistory((prev) => [...prev, move.san]);
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
    setMoveHistory((prev) => prev.slice(0, -1));
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
      });
  }

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto", textAlign: "center" }}>
      <h1>React Chess App</h1>
      
      <div>
        <strong>Evaluation:</strong> {evaluation !== null ? evaluation : "Loading..."}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Chessboard
          id="ChessBoard"
          boardWidth={500}
          position={fen}
          onPieceDrop={onDrop}
        />

        <div style={{ marginLeft: "20px", textAlign: "left" }}>
          <h2>Move History</h2>
          <div style={{ border: "1px solid #ccc", padding: "10px", height: "300px", overflowY: "scroll" }}>
            {moveHistory.length > 0 ? (
              <ol>{moveHistory.map((m, i) => <li key={i}>{m}</li>)}</ol>
            ) : (
              <p>No moves yet.</p>
            )}
          </div>

          <button onClick={resetGame}>Reset Game</button>
          <button onClick={undoMove} disabled={moveHistory.length === 0}>Undo Move</button>
          <button onClick={makeEngineMove}>Make Engine Move</button>
          
            <div style={{ marginTop: "20px" }}>
              <h3>Select Game Mode:</h3>
              <select value={gamemode} onChange={(e) => setGamemode(e.target.value)}>
                <option value="engine">Engine</option>
                <option value="minimax">Minimax</option>
              </select>
            </div>
        </div>
      </div>
    </div>
  );
}
