from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from AIEngine import get_best_move, minimax, evaluate_board, get_opening_move
import chess
app = FastAPI()

# CORS setup
origins = [
    "https://sp-14-green-chess-ai.github.io",
"https://sp-14-green-chess-ai.github.io/SP-14-Green-Chess-AI",
 "http://localhost:5173/SP-14-Green-Chess-AI",
    "http://localhost:5173",
    "http://localhost:5179"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# REST model
class BoardState(BaseModel):
    fen: str
    game_mode: str = "engine"  # "engine" or "minimax"

# GameRoom for two-player chess
class GameRoom:
    def __init__(self):
        self.players = {}
        self.available_colors = ['white', 'black']

    async def add_player(self, websocket: WebSocket):
        await websocket.accept()
        if len(self.players) >= 2:
            await websocket.send_json({"error": "Game is full"})
            await websocket.close()
            return False
        color = self.available_colors.pop(0)
        self.players[websocket] = color
        await websocket.send_json({"type": "color_assignment", "color": color})
        print(f"Player joined as {color}")
        return True

    def remove_player(self, websocket: WebSocket):
        if websocket in self.players:
            color = self.players[websocket]
            self.available_colors.append(color)
            del self.players[websocket]
            print(f"{color} player disconnected")

    async def broadcast_move(self, move_data, sender: WebSocket):
        for player_ws in self.players:
            if player_ws != sender:
                await player_ws.send_json(move_data)

# RoomManager for multiple rooms
class RoomManager:
    def __init__(self):
        self.rooms = {}  # room_id -> GameRoom

    def get_or_create_room(self, room_id: str) -> GameRoom:
        if room_id not in self.rooms:
            self.rooms[room_id] = GameRoom()
        return self.rooms[room_id]

    def remove_room_if_empty(self, room_id: str):
        room = self.rooms.get(room_id)
        if room and not room.players:
            del self.rooms[room_id]

    def get_waiting_rooms(self) -> list[str]:
        return [room_id for room_id, room in self.rooms.items() if len(room.players) == 1]

room_manager = RoomManager()

# Root endpoint
@app.get("/")
def root():
    return {"message": "Chess Engine API is running!"}

# Evaluation bar endpoint
@app.post("/evalbar/")
def eval_bar(board_state: BoardState):
    board = chess.Board(board_state.fen)
    eval = evaluate_board(board)
    return {"evaluation": eval}

# Best move endpoint
@app.post("/best-move/")
def best_move(board_state: BoardState):
    board = chess.Board(board_state.fen)
    if board.board_fen() == chess.STARTING_FEN:
        opening_move = get_opening_move(board)
        if opening_move:
            return {"best_move": opening_move.uci()}

    if board_state.game_mode == "minimax":
        depth = 4
        best_eval = float('-inf') if board.turn == chess.WHITE else float('inf')
        best_move_found = None
        for move in board.legal_moves:
            board.push(move)
            eval = minimax(board, depth - 1)
            board.pop()
            if board.turn == chess.WHITE and eval > best_eval:
                best_eval = eval
                best_move_found = move
            elif board.turn == chess.BLACK and eval < best_eval:
                best_eval = eval
                best_move_found = move
        return {"best_move": best_move_found.uci()}

    elif board_state.game_mode == "engine":
        move = get_best_move(board)
        return {"best_move": move.uci()}

    else:
        return {"error": "Invalid game mode. Choose 'engine' or 'minimax'."}

# WebSocket endpoint for multiplayer rooms
@app.websocket("/ws/chess/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    room = room_manager.get_or_create_room(room_id)
    if not await room.add_player(websocket):
        return
    try:
        while True:
            data = await websocket.receive_json()
            await room.broadcast_move(data, websocket)
    except WebSocketDisconnect:
        room.remove_player(websocket)
        room_manager.remove_room_if_empty(room_id)

# New endpoint: list rooms with one player waiting
@app.get("/waiting-rooms/")
def waiting_rooms():
    return {"rooms": room_manager.get_waiting_rooms()}