import React, { useState, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

export default function App() {
  const gameRef = useRef(new Chess()); // persistent game instance
  const [fen, setFen] = useState(gameRef.current.fen());
  const [moveHistory, setMoveHistory] = useState([]);

  function onDrop(sourceSquare, targetSquare) {
    const move = gameRef.current.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });
    if (move === null) return false;
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

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto", textAlign: "center" }}>
      <h1>React Chess App</h1>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Chessboard
          id="ChessBoard"
          boardWidth={500}
          position={fen}
          onPieceDrop={onDrop} // This must be the correct v2 callback
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
        </div>
      </div>
    </div>
  );
}