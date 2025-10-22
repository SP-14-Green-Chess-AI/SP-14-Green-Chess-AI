from fastapi import FastAPI
from pydantic import BaseModel
import chess
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from AIEngine import get_best_move, minimax, evaluate_board, get_opening_move

app = FastAPI()
origins = ["https://sp-14-green-chess-ai.github.io","https://sp-14-green-chess-ai.github.io/SP-14-Green-Chess-AI/", "http://localhost:5173/SP-14-Green-Chess-AI",
           "http://localhost:5173" # React dev server

          ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class BoardState(BaseModel):
    fen: str
    game_mode: str = "engine"  # "engine" or "minimax"

@app.post("/evalbar/")
def eval_bar(board_state: BoardState):
    board = chess.Board(board_state.fen)
    eval = evaluate_board(board)
    return {"evaluation": eval}

@app.post("/best-move/")
def best_move(board_state: BoardState):
    board = chess.Board(board_state.fen)
    if board.board_fen() == chess.STARTING_FEN:
        opening_move = get_opening_move(board)
        if opening_move:
            return {"best_move": opening_move.uci()}
    if board_state.game_mode == "minimax":
        depth = 4  # You can adjust the depth as needed
        if board.turn == chess.WHITE:
            best_eval = float('-inf')
        else:
            best_eval = float('inf')
        best_move = None
        for move in board.legal_moves:
            board.push(move)
            eval = minimax(board, depth - 1)
            board.pop()
            if board.turn == chess.WHITE and eval > best_eval:
                best_eval = eval
                best_move = move
            elif board.turn == chess.BLACK and eval < best_eval:
                best_eval = eval
                best_move = move
        return {"best_move": best_move.uci()}

    elif board_state.game_mode == "engine":
        move = get_best_move(board)
        return {"best_move": move.uci()}

    else:
        return {"error": "Invalid game mode. Choose 'engine' or 'minimax'."}
@app.get("/")
def root():
    return {"message": "Chess Engine API is running!"}
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))  # 8000 fallback for local dev
    uvicorn.run(app, host="0.0.0.0", port=port)
