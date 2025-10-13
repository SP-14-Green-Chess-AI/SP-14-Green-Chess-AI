from fastapi import FastAPI
from pydantic import BaseModel
import chess
from AI import get_best_move, minimax, evaluate_board
import chess.engine

app = FastAPI()

class BoardState(BaseModel):
    fen: str  # Board in FEN format
@app.post("/evalbar/")
def eval_bar(board_state: BoardState):
    board = chess.Board(board_state.fen)
    eval = chess.engine.SimpleEngine.popen_uci("/usr/local/bin/stockfish").analyse(board, chess.engine.Limit(time=0.1))['score'].white().score(mate_score=10000)
    return {"evaluation": eval}
@app.post("/best-move/")
def best_move(board_state: BoardState, game_mode: str = "engine"):
    if game_mode not in ["engine", "minimax"]:
        return {"error": "Invalid game mode. Choose 'engine' or 'minimax'."}
    elif game_mode == "minimax":
        board = chess.Board(board_state.fen)
        best_move = None
        best_value = float('-inf') if board.turn == chess.WHITE else float('inf')
        for move in board.legal_moves:
            board.push(move)
            board_value = minimax(board, 2)  # Depth can be adjusted
            board.pop()
            if (board.turn == chess.WHITE and board_value > best_value) or (board.turn == chess.BLACK and board_value < best_value):
                best_value = board_value
                best_move = move
        return {"best_move": best_move.uci() if best_move else None}
    elif game_mode == "engine":
        board = chess.Board(board_state.fen)
        move = get_best_move(board)
        return {"best_move": move.uci()}
    

