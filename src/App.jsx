import React, { useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);

  function onDrop(sourceSquare, targetSquare) {
    const next = new Chess(game.fen());
    const move = next.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (move === null) return false; // illegal move
    setGame(next);
    setMoveHistory((prev) => [...prev, move.san]);
    return true;
  }

  function resetGame() {
    setGame(new Chess());
    setMoveHistory([]);
  }

  function undoMove() {
    const next = new Chess(game.fen());
    next.undo();
    setGame(next);
    setMoveHistory((prev) => prev.slice(0, -1));
  }

  return (
    <div style={{ maxWidth: "900px", margin: "50px auto", textAlign: "center" }}>
      <h1>React Chess App</h1>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Chessboard
          id="ChessBoard"
          boardWidth={500}
          position={game.fen()}
          onPieceDrop={onDrop}      // This must be the correct v2+ callback
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
