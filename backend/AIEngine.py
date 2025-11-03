import os
import sys
import json
import random
import platform
import chess
import chess.engine

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Platform-specific LCZero binary
if platform.system() == "Windows":
    LC0_PATH = os.path.join(BASE_DIR, "engine", "Leela", "lc0.exe")
else:
    LC0_PATH = os.path.join(BASE_DIR, "engine", "Leela", "lc0-v0.32.0-macos_12.6.1")

WEIGHTS_PATH = os.path.join(BASE_DIR, "engine", "Leela", "t1-256x10-distilled-swa-2432500.pb.gz")

# Ensure executable permissions (Unix/macOS only)
if platform.system() != "Windows" and not os.access(LC0_PATH, os.X_OK):
    os.chmod(LC0_PATH, 0o755)

# Load LCZero engine
def load_lc0_engine():
    return chess.engine.SimpleEngine.popen_uci([LC0_PATH, f"--weights={WEIGHTS_PATH}"])

# Load opening book
BOOK_PATH = os.path.join(BASE_DIR, "ecoA.json")
with open(BOOK_PATH, 'r') as f:
    OPENING_BOOK = json.load(f)

def get_opening_move(board: chess.Board):
    fen = board.board_fen()
    if fen in OPENING_BOOK:
        legal_moves = [chess.Move.from_uci(m) for m in OPENING_BOOK[fen]]
        legal_moves = [m for m in legal_moves if m in board.legal_moves]
        if legal_moves:
            return random.choice(legal_moves)
    return None

def lc0_best_move(board: chess.Board, time_limit=1.5):
    engine = load_lc0_engine()
    result = engine.play(board, chess.engine.Limit(time=time_limit))
    engine.quit()
    return result.move

def get_best_move(board: chess.Board) -> chess.Move:
    if platform.system() == "Windows":
        engine_path = os.path.join(BASE_DIR, "engine", "stockfish-windows-x86-64.exe")
    elif platform.system() == "Linux":
        engine_path = os.path.join(BASE_DIR, "engine", "stockfish-ubuntu-x86-64-avx2")
    else:
        engine_path = os.path.join(BASE_DIR, "engine", "stockfish-macos-m1-apple-silicon")

    engine = chess.engine.SimpleEngine.popen_uci(engine_path)
    result = engine.play(board, chess.engine.Limit(time=0.1))
    engine.quit()
    return result.move
def is_endgame(board: chess.Board) -> bool:
    non_kings = sum(1 for p in board.piece_map().values() if p.piece_type != chess.KING)
    return non_kings <= 5 and board.castling_rights == 0
from chess.syzygy import open_tablebase

TB = open_tablebase("https://tablebase.lichess.org")


def minimax(board: chess.Board, depth: int, alpha=float('-inf'), beta=float('inf')) -> float:
    if board.is_checkmate(): 
        return -9999 if board.turn == chess.WHITE else 9999
    if board.is_stalemate() or board.is_insufficient_material() or board.can_claim_fifty_moves() or board.can_claim_threefold_repetition():
        return 0
    
    if is_endgame(board):
            try:
                wdl = TB.probe_wdl(board)    # use cached TB handle
                return wdl * 10000           # win/loss dominates
            except KeyError:
                pass 
    if depth == 0:
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

# Piece-square tables
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
    ]
}

# Material values
MATERIAL_VALUES = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 0
}

def evaluate_board(board: chess.Board) -> float:
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
    return value / 100.0