import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export default function useMultiplayer({
  playMode,
  gameId,
  backendUrl,
  gameRef,
  wsRef,
  setPlayerColor,
  setFen,
  setMoveHistory,
  setGameStatus,
  setAvailableGames,
  setChatMessages, // Add to handle chat
}) {
  useEffect(() => {
    if (playMode !== "multiplayer" || !gameId) return;

    const clientId = uuidv4();
    const ws = new WebSocket(`${backendUrl.replace("http", "ws")}/ws/chess/${gameId}?client_id=${clientId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`Connected to game ${gameId} as client ${clientId}`);
      // Fetch available games
      fetch(`${backendUrl}/waiting-games/`)
        .then((res) => res.json())
        .then((data) => setAvailableGames(data.games))
        .catch((err) => console.error("Error fetching games:", err));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received:", data);

      if (data.type === "init") {
        setPlayerColor(data.color);
        setFen(data.fen);
        setMoveHistory(data.move_history);
        setGameStatus(data.status);
        setChatMessages(data.chat_messages || []); // Initialize chat
      } else if (data.type === "move") {
        try {
          const move = gameRef.current.move({
            from: data.from,
            to: data.to,
            promotion: data.promotion || "q",
          });
          if (move) {
            setFen(gameRef.current.fen());
            setMoveHistory((prev) => [...prev, move.san]);
            setGameStatus(data.status);
          }
        } catch (err) {
          console.error("Error processing move:", err);
        }
      } else if (data.type === "chat") {
        setChatMessages((prev) => [...prev, data.message]); // Add new chat message
      } else if (data.type === "error") {
        console.error("WebSocket error:", data.message);
      }
    };

    ws.onclose = () => {
      console.log(`Disconnected from game ${gameId}`);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
  }, [playMode, gameId, backendUrl, gameRef, setPlayerColor, setFen, setMoveHistory, setGameStatus, setAvailableGames, setChatMessages]);
}