import chess
import chess.engine
import sys
import json
import random
BOOK_PATH = "ecoA.json"
with open(BOOK_PATH, 'r') as f:
    OPENING_BOOK = json.load(f) # Load the opening book

def get_opening_move(board):
    fen = board.board_fen()
    if fen in OPENING_BOOK:
        legal_moves = [chess.Move.from_uci(m) for m in OPENING_BOOK[fen]]
        legal_moves = [m for m in legal_moves if m in board.legal_moves]
        if legal_moves:
            return random.choice(legal_moves)
    return None

def get_best_move(board: chess.Board) -> chess.Move:
    if sys.platform == "win":
        engine_path = "engine/stockfish-windows-x86-64-avx2.exe"
    elif sys.platform == "linux":
        engine_path = "engine/stockfish-ubuntu-x86-64-avx2"
    else:
        engine_path = "engine/stockfish-macos-m1-apple-silicon"
    engine = chess.engine.SimpleEngine.popen_uci(engine_path)
    result = engine.play(board, chess.engine.Limit(time=0.1))
    engine.quit()
    return result.move


def minimax(board: chess.Board, depth: int, alpha=float('-inf'), beta=float('inf')) -> float:
    
    if board.is_checkmate() or board.is_stalemate() or depth == 0:
        return evaluate_board(board)

    if board.turn == chess.WHITE:
        max_eval = float('-inf')
        for move in board.legal_moves:
            board.push(move)
            eval = minimax(board, depth - 1, alpha, beta)
            board.pop()
            max_eval = max(max_eval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break
        return max_eval
    else:
        min_eval = float('inf')
        for move in board.legal_moves:
            board.push(move)
            eval = minimax(board, depth - 1, alpha, beta)
            board.pop()
            min_eval = min(min_eval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break
        return min_eval


import chess

# Piece-square tables: bonus for piece positions
PIECE_SQUARES = {
    chess.PAWN: [
        0, 0, 0, 0, 0, 0, 0, 0,
        5, 5, 5, -5, -5, 5, 5, 5,
        1, 1, 2, 3, 3, 2, 1, 1,
        0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5,
        0, 0, 0, 2, 2, 0, 0, 0,
        0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5,
        0.5, 1, 1, -2, -2, 1, 1, 0.5,
        0, 0, 0, 0, 0, 0, 0, 0
    ],
    chess.KNIGHT: [
        -5, -4, -3, -3, -3, -3, -4, -5,
        -4, -2, 0, 0.5, 0.5, 0, -2, -4,
        -3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3,
        -3, 0, 1.5, 2, 2, 1.5, 0, -3,
        -3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3,
        -3, 0, 1, 1.5, 1.5, 1, 0, -3,
        -4, -2, 0, 0, 0, 0, -2, -4,
        -5, -4, -3, -3, -3, -3, -4, -5
    ],}

# Base material values
MATERIAL_VALUES = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 0
}

def evaluate_board(board: chess.Board) -> float:
    """
    Positive: White is better
    Negative: Black is better
    Combines material and piece-square tables for position
    """
    value = 0

    for piece_type in MATERIAL_VALUES:
        for square in board.pieces(piece_type, chess.WHITE):
            value += MATERIAL_VALUES[piece_type]
            if piece_type in PIECE_SQUARES:
                value += PIECE_SQUARES[piece_type][square]

        for square in board.pieces(piece_type, chess.BLACK):
            value -= MATERIAL_VALUES[piece_type]
            if piece_type in PIECE_SQUARES:
                value -= PIECE_SQUARES[piece_type][chess.square_mirror(square)]

    return value / 100.0  # normalize to smaller scale
