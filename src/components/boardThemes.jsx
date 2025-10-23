// src/components/boardThemes.js
import React from "react";
import { Bishop, Rook, Knight, Queen, King, Pawn } from "./Pieces";
import { DefaultBishop, DefaultRook, DefaultKnight, DefaultQueen, DefaultKing, DefaultPawn } from "./DefaultPieces";

export const boardThemes = {
  Sand: { light: "#f0d9b5", dark: "#b58863" },
  Gray: { light: "#e6e6e6", dark: "#4a4a4a" },
  Pink: { light: "#fceefc", dark: "#c8a2c8" },
  Olive: { light: "#f5f5dc", dark: "#808000" },
  Ivory: { light: "#fffff0", dark: "#333333" },
  Teal: { light: "#e0f7fa", dark: "#607d8b" },
  Coral: { light: "#ffe5e0", dark: "#ffab91" },
  Pastel: { light: "#f9fbe7", dark: "#c5cae9" },
};

// Dynamic custom pieces based on theme selection
export function getCustomPieces(useDefaultPieces, selectedPieceTheme, themes) {
  if (useDefaultPieces) {
    return {
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
    };
  } else {
    return {
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
  }
}
