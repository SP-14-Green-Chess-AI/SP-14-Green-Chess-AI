import React, { useState, useRef } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { themes } from "./themes";
import { boardThemes } from "./boardThemes";
import { Bishop, Rook, Knight, Queen, King, Pawn } from "./components/Pieces";
import { DefaultKing, DefaultQueen, DefaultRook, DefaultBishop, DefaultKnight, DefaultPawn } from "./components/DefaultPieces";

export default function App() {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [moveHistory, setMoveHistory] = useState([]);
  const [selectedPieceTheme, setSelectedPieceTheme] = useState("Classic");
  const [selectedBoardTheme, setSelectedBoardTheme] = useState("Sand");
  const [useDefaultPieces, setUseDefaultPieces] = useState(false); // New state for dropdown

  function onDrop(sourceSquare, targetSquare) {
    const move = gameRef.current.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    if (!move) return false;
    setFen(gameRef.current.fen());
    setMoveHistory(prev => [...prev, move.san]);
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

  // Generate customPieces object based on dropdown choice
  const customPieces = useDefaultPieces
    ? {
        wB: ({ squareWidth }) => <DefaultBishop color="white" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        bB: ({ squareWidth }) => <DefaultBishop color="black" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        wN: ({ squareWidth }) => <DefaultKnight color="white" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        bN: ({ squareWidth }) => <DefaultKnight color="black" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        wR: ({ squareWidth }) => <DefaultRook color="white" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        bR: ({ squareWidth }) => <DefaultRook color="black" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        wQ: ({ squareWidth }) => <DefaultQueen color="white" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        bQ: ({ squareWidth }) => <DefaultQueen color="black" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        wK: ({ squareWidth }) => <DefaultKing color="white" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        bK: ({ squareWidth }) => <DefaultKing color="black" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        wP: ({ squareWidth }) => <DefaultPawn color="white" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        bP: ({ squareWidth }) => <DefaultPawn color="black" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
      }
    : {
        wB: ({ squareWidth }) => <Bishop color="white" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        bB: ({ squareWidth }) => <Bishop color="black" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        wN: ({ squareWidth }) => <Knight color="white" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        bN: ({ squareWidth }) => <Knight color="black" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        wR: ({ squareWidth }) => <Rook color="white" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        bR: ({ squareWidth }) => <Rook color="black" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        wQ: ({ squareWidth }) => <Queen color="white" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        bQ: ({ squareWidth }) => <Queen color="black" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        wK: ({ squareWidth }) => <King color="white" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        bK: ({ squareWidth }) => <King color="black" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        wP: ({ squareWidth }) => <Pawn color="white" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
        bP: ({ squareWidth }) => <Pawn color="black" squareWidth={squareWidth} theme={themes[selectedPieceTheme]} />,
      };

  return (
    <div style={{ maxWidth: "1000px", margin: "50px auto", textAlign: "center" }}>
      <h1>React Chess App</h1>

      {/* Theme selectors */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", gap: "30px" }}>
        <div>
          <label>Piece Style: </label>
          <select value={useDefaultPieces ? "Default" : "Custom"} onChange={e => setUseDefaultPieces(e.target.value === "Default")}>
            <option value="Classic">Classic</option>
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

      {/* Board and Move History */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "40px" }}>
        <Chessboard
          id="ChessBoard"
          boardWidth={600}
          position={fen}
          onPieceDrop={onDrop}
          customPieces={customPieces}
          customDarkSquareStyle={{ backgroundColor: boardThemes[selectedBoardTheme]?.dark }}
          customLightSquareStyle={{ backgroundColor: boardThemes[selectedBoardTheme]?.light }}
        />

        <div style={{ textAlign: "left" }}>
          <h2>Move History</h2>
          <div style={{ border: "1px solid #ccc", padding: "10px", height: "500px", overflowY: "scroll", width: "200px" }}>
            {moveHistory.length ? <ol>{moveHistory.map((m, i) => <li key={i}>{m}</li>)}</ol> : <p>No moves yet.</p>}
          </div>
          <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={resetGame}>Reset Game</button>
            <button onClick={undoMove} disabled={!moveHistory.length}>Undo Move</button>
          </div>
        </div>
      </div>
    </div>
  );
}
