from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List
import json
import os
import asyncio
import chess
from AIEngine import evaluate_board, get_best_move, get_opening_move, minimax

app = FastAPI()

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://sp-14-green-chess-ai.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

games: Dict[str, Dict] = {}  # {game_id: {"board": chess.Board, "move_history": List[str], "clients": List[WebSocket], "players": {client_id: color}}}

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
        depth = 3
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

def get_game(game_id: str) -> Dict:
    """Get or create a game."""
    if game_id not in games:
        games[game_id] = {
            "board": chess.Board(),
            "move_history": [],
            "players": {},
            "status": "ongoing",
            "clients": []
        }
        # Load saved state if it exists
        path = f"saved_games/{game_id}.json"
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    data = json.load(f)
                games[game_id]["board"].set_fen(data["fen"])
                games[game_id]["move_history"] = data["move_history"]
                games[game_id]["status"] = data.get("status", "ongoing")
                print(f"Loaded state for game {game_id}: {data['fen']}")
            except Exception as e:
                print(f"Error loading state for {game_id}: {e}")
    return games[game_id]

async def save_game_state(game_id: str):
    """Save game state to disk."""
    if game_id not in games:
        print(f"Cannot save state: game {game_id} not found")
        return
    game = games[game_id]
    os.makedirs("saved_games", exist_ok=True)
    path = f"saved_games/{game_id}.json"
    try:
        with open(path, "w") as f:
            json.dump({
                "fen": game["board"].fen(),
                "move_history": game["move_history"],
                "status": game["status"]
            }, f)
        print(f"Saved state for game {game_id}: {game['board'].fen()}")
    except Exception as e:
        print(f"Error saving state for {game_id}: {e}")

def get_game_status(game: Dict, game_id: str) -> str:
    """Update and return the game status."""
    board = game["board"]
    print(f"Updating game status for game {game_id}: FEN={board.fen()}")
    if board.is_checkmate():
        game["status"] = "checkmate"
    elif board.is_stalemate():
        game["status"] = "stalemate"
    elif board.is_insufficient_material():
        game["status"] = "draw_insufficient_material"
    elif board.can_claim_fifty_moves():
        game["status"] = "draw_fifty_moves"
    elif board.can_claim_threefold_repetition():
        game["status"] = "draw_threefold_repetition"
    elif board.is_check():
        game["status"] = "check"
    else:
        game["status"] = "ongoing"
    print(f"Game {game_id} status updated to: {game['status']}")
    return game["status"]

def validate_game_state(game: Dict, game_id: str):
    """Validate and fix game state to ensure one white and one black player max."""
    players = game["players"]
    white_count = sum(1 for color in players.values() if color == "white")
    black_count = sum(1 for color in players.values() if color == "black")
    
    if white_count > 1 or black_count > 1:
        print(f"Invalid state in game {game_id}: {white_count} white, {black_count} black. Resetting players.")
        # Keep only the first white and first black player
        new_players = {}
        white_added = False
        black_added = False
        for client_id, color in players.items():
            if color == "white" and not white_added:
                new_players[client_id] = "white"
                white_added = True
            elif color == "black" and not black_added:
                new_players[client_id] = "black"
                black_added = True
        game["players"] = new_players
        print(f"Fixed state for game {game_id}: {game['players']}")

@app.get("/join-game/{game_id}")
async def join_game(game_id: str):
    """Join a game and get its state."""
    game = get_game(game_id)
    validate_game_state(game, game_id)
    if len(game["players"]) >= 2:
        raise HTTPException(status_code=400, detail="Game is full")
    return {
        "fen": game["board"].fen(),
        "move_history": game["move_history"],
        "status": game["status"]
    }

@app.get("/game-state/{game_id}")
async def get_game_state(game_id: str):
    """Retrieve game state."""
    game = get_game(game_id)
    validate_game_state(game, game_id)
    return {
        "fen": game["board"].fen(),
        "move_history": game["move_history"],
        "status": game["status"]
    }

@app.get("/waiting-games/")
async def get_waiting_games():
    """List games with fewer than 2 players."""
    for game_id in games:
        validate_game_state(games[game_id], game_id)
    return {"games": [game_id for game_id, game in games.items() if len(game["players"]) < 2]}

@app.websocket("/ws/chess/{game_id}")
async def websocket_endpoint(websocket: WebSocket, game_id: str, client_id: str = None):
    """WebSocket for real-time move updates."""
    if not client_id:
        await websocket.accept()
        await websocket.send_json({"type": "error", "message": "client_id is required"})
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        print(f"Rejected WebSocket connection for game {game_id}: missing client_id")
        return

    game = get_game(game_id)
    validate_game_state(game, game_id)

    # Allow rejoining if client_id is already a player
    if len(game["players"]) >= 2 and client_id not in game["players"]:
        await websocket.accept()
        await websocket.send_json({"type": "error", "message": "Game is full"})
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        print(f"Rejected client {client_id} in game {game_id}: game full")
        return

    await websocket.accept()
    if websocket not in game["clients"]:
        game["clients"].append(websocket)

    existing_colors = set(game["players"].values())
    if "white" not in existing_colors:
        player_color = "white"
    elif "black" not in existing_colors:
        player_color = "black"
    else:
        player_color = None  # game full

    if player_color:
        game["players"][client_id] = player_color

    print(f"Client {client_id} joined game {game_id} as {player_color}")

    # Send initial state
    await websocket.send_json({
        "type": "init",
        "color": player_color,
        "fen": game["board"].fen(),
        "move_history": game["move_history"],
        "status": game["status"]
    })

    try:
        while True:
            data = await websocket.receive_json()
            print(f"Received in game {game_id} from client {client_id}: {data}")

            if data.get("type") == "move":
                if game["players"].get(client_id) != ("white" if game["board"].turn == chess.WHITE else "black"):
                    print(f"Client {client_id} attempted move out of turn in game {game_id}")
                    await websocket.send_json({"type": "error", "message": "Not your turn"})
                    continue
                try:
                    move = chess.Move.from_uci(data["from"] + data["to"] + (data.get("promotion", "q") if data.get("promotion") else ""))
                    if move not in game["board"].legal_moves:
                        print(f"Invalid move by client {client_id} in game {game_id}: {data}")
                        await websocket.send_json({"type": "error", "message": "Invalid move"})
                        continue
                    move_san = game["board"].san(move)
                    game["board"].push(move)
                    game["move_history"].append(move_san)
                    get_game_status(game, game_id)
                    await save_game_state(game_id)
                    # Broadcast move
                    for ws in game["clients"]:
                        if ws != websocket:
                            await ws.send_json({
                                "type": "move",
                                "from": data["from"],
                                "to": data["to"],
                                "promotion": data.get("promotion", "q"),
                                "status": game["status"]
                            })
                    print(f"Move by client {client_id} in game {game_id}: {move_san}")
                except Exception as e:
                    print(f"Error handling move by client {client_id} in game {game_id}: {e}")
                    await websocket.send_json({"type": "error", "message": f"Move error: {str(e)}"})

            elif data.get("type") == "reset":
                game["board"] = chess.Board()
                game["move_history"] = []
                game["status"] = "ongoing"
                game["players"] = {}  # Clear players on reset
                game["players"][client_id] = "white"  # Reset initiator is white
                await save_game_state(game_id)
                for ws in game["clients"]:
                    await ws.send_json({
                        "type": "init",
                        "color": game["players"].get(client_id if ws == websocket else "", "spectator"),
                        "fen": game["board"].fen(),
                        "move_history": game["move_history"],
                        "status": game["status"]
                    })
                print(f"Game {game_id} reset by client {client_id}")

    except WebSocketDisconnect:
        if websocket in game["clients"]:
            game["clients"].remove(websocket)
        if client_id in game["players"]:
            del game["players"][client_id]
        print(f"Client {client_id} disconnected from game {game_id}")
        validate_game_state(game, game_id)
        if not game["clients"]:
            await save_game_state(game_id)
            await asyncio.sleep(300)
            if game_id in games and not games[game_id]["clients"]:
                del games[game_id]
                print(f"Deleted empty game {game_id}")
    except Exception as e:
        print(f"WebSocket error in game {game_id}: {e}")
        if websocket in game["clients"]:
            game["clients"].remove(websocket)
        if client_id in game["players"]:
            del game["players"][client_id]
        validate_game_state(game, game_id)

@app.get("/debug/games")
async def debug_games():
    """Debug endpoint to inspect game state."""
    for game_id in games:
        validate_game_state(games[game_id], game_id)
    return {"games": {k: {
        "fen": v["board"].fen(),
        "move_history": v["move_history"],
        "players": v["players"],
        "status": v["status"],
        "client_count": len(v["clients"])
    } for k, v in games.items()}}