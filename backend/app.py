from fastapi import FastAPI
from pydantic import BaseModel
import chess
import chess.engine
from AIEngine import get_best_move, minimax, evaluate_board, get_opening_move

app = FastAPI()

class BoardState(BaseModel):
    fen: str
    game_mode: str = "engine"  # "engine" or "minimax"

@app.post("/evalbar/")
def eval_bar(board_state: BoardState):
    board = chess.Board(board_state.fen)
    eval = chess.engine.SimpleEngine.popen_uci("/usr/local/bin/stockfish").analyse(
        board, chess.engine.Limit(time=0.1)
    )['score'].white().score(mate_score=10000)
    return {"evaluation": eval}

@app.post("/best-move/")
def best_move(board_state: BoardState):
    board = chess.Board(board_state.fen)
    if board_state.game_mode == "minimax":
        move = get_opening_move(board)
        if move:
            return {"best_move": move.uci()}
        best_move_result = None
        best_value = float('-inf') if board.turn == chess.WHITE else float('inf')
        for move in board.legal_moves:
            board.push(move)
            board_value = minimax(board, 3)
            board.pop()
            if (board.turn == chess.WHITE and board_value > best_value) or \
               (board.turn == chess.BLACK and board_value < best_value):
                best_value = board_value
                best_move_result = move
        return {"best_move": best_move_result.uci() if best_move_result else None}
    elif board_state.game_mode == "engine":
        move = get_best_move(board)
        return {"best_move": move.uci()}
    else:
        return {"error": "Invalid game mode. Choose 'engine' or 'minimax'."}
@app.get("/")
def root():
    return {"message": "Chess Engine API is running!"}
