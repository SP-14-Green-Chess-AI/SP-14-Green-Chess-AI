import { King, Queen, Rook, Bishop, Knight, Pawn } from "./components/Pieces";
import { DefaultKing, DefaultQueen, DefaultRook, DefaultBishop, DefaultKnight, DefaultPawn, } from "./components/DefaultPieces";

export const pieceThemes = {
  Classic: { King, Queen, Rook, Bishop, Knight, Pawn },
  Default: {
    King: DefaultKing,
    Queen: DefaultQueen,
    Rook: DefaultRook,
    Bishop: DefaultBishop,
    Knight: DefaultKnight,
    Pawn: DefaultPawn,
  },
};
