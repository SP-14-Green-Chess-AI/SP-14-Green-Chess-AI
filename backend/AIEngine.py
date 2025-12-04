import os
import json
import random
import platform

import requests
import chess
import chess.engine
from typing import Optional
from urllib.parse import quote

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
    """Return True if the position has ≤7 non-king pieces."""
    non_kings = sum(1 for p in board.piece_map().values() if p.piece_type != chess.KING)
    return non_kings <= 7

def probe_wdl_tablebase(fen: str) -> Optional[int]:
    board = chess.Board(fen)
    if not board.is_valid():
        return None
    board.castling_rights = 0
    board.ep_square = None
    clean_fen = board.fen()

    if sum(1 for p in board.piece_map().values() if p.piece_type != chess.KING) > 7:
        return None

    url = f"https://tablebase.lichess.ovh/standard?fen={quote(clean_fen)}"
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        cat = r.json().get("category", "draw")
        return {"win": 1, "draw": 0, "loss": -1}.get(cat)
    except requests.RequestException:
        return None

def minimax(board: chess.Board, depth: int,
            alpha: float = float('-inf'), beta: float = float('inf')) -> float:
    if board.is_checkmate():
        return -9999 if board.turn == chess.WHITE else 9999
    if (board.is_stalemate() or board.is_insufficient_material() or
        board.can_claim_fifty_moves() or board.can_claim_threefold_repetition()):
        return 0

    if is_endgame(board):
        wdl = probe_wdl_tablebase(board.fen())  # FIXED: pass FEN string
        if wdl is not None:
            # Scale far beyond any static evaluation
            return wdl * 10000

    if depth == 0:
        return evaluate_board(board)

    if board.turn == chess.WHITE:  # maximising player
        best = float('-inf')
        for move in board.legal_moves:
            board.push(move)
            best = max(best, minimax(board, depth - 1, alpha, beta))
            board.pop()
            alpha = max(alpha, best)
            if beta <= alpha:
                break
        return best
    else:  # minimising player
        best = float('inf')
        for move in board.legal_moves:
            board.push(move)
            best = min(best, minimax(board, depth - 1, alpha, beta))
            board.pop()
            beta = min(beta, best)
            if beta <= alpha:
                break
        return best

MATERIAL_VALUES = {
    chess.PAWN:   100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK:   500,
    chess.QUEEN:  900,
    chess.KING:   0,
}

PIECE_SQUARES = {
    chess.PAWN: [
        0, 0, 0, 0, 0, 0, 0, 0,
        5, 5, 5, -5, -5, 5, 5, 5,
        1, 1, 2, 3, 3, 2, 1, 1,
        .5, .5, 1, 2.5, 2.5, 1, .5, .5,
        0, 0, 0, 2, 2, 0, 0, 0,
        .5, -.5, -1, 0, 0, -1, -.5, .5,
        .5, 1, 1, -2, -2, 1, 1, .5,
        0, 0, 0, 0, 0, 0, 0, 0,
    ],
    chess.KNIGHT: [
        -5, -4, -3, -3, -3, -3, -4, -5,
        -4, -2, 0, .5, .5, 0, -2, -4,
        -3, .5, 1, 1.5, 1.5, 1, .5, -3,
        -3, 0, 1.5, 2, 2, 1.5, 0, -3,
        -3, .5, 1.5, 2, 2, 1.5, .5, -3,
        -3, 0, 1, 1.5, 1.5, 1, 0, -3,
        -4, -2, 0, 0, 0, 0, -2, -4,
        -5, -4, -3, -3, -3, -3, -4, -5,
    ],
    # Add more piece-square tables here if you want a stronger eval
}

def evaluate_board(board: chess.Board) -> float:
    """Positive = advantage for White."""
    total = 0.0
    for pt, val in MATERIAL_VALUES.items():
        # White pieces
        for sq in board.pieces(pt, chess.WHITE):
            total += val
            if pt in PIECE_SQUARES:
                total += PIECE_SQUARES[pt][sq]
        # Black pieces (mirror the table)
        for sq in board.pieces(pt, chess.BLACK):
            total -= val
            if pt in PIECE_SQUARES:
                total -= PIECE_SQUARES[pt][chess.square_mirror(sq)]
    return total / 100.0