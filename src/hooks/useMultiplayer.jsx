import { useEffect } from "react";

/**
 * Custom React Hook for multiplayer logic (rooms + WebSocket)
 */
export default function useMultiplayer({
  playMode,
  selectedRoom,
  backendUrl,
  gameRef,
  wsRef,
  setAvailableRooms,
  setPlayerColor,
  setFen,
  setMoveHistory,
}) {
  useEffect(() => {
    if (playMode !== "multiplayer") return;

    // --- Fetch Waiting Rooms ---
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${backendUrl}/waiting-rooms/`);
        const data = await res.json();
        setAvailableRooms(data.rooms);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };

    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);

    // --- Setup WebSocket (use Render URL) ---
    let ws;
    if (selectedRoom) {
      // 👇 Auto-pick WebSocket URL depending on backend
      const wsBaseUrl = backendUrl.includes("localhost")
        ? "ws://localhost:8000"
        : "wss://sp-14-green-chess-ai.onrender.com";

      ws = new WebSocket(`${wsBaseUrl}/ws/chess/${selectedRoom}`);
      wsRef.current = ws;

      ws.onopen = () => console.log("✅ Connected to WebSocket server");

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.error === "Game is full") {
          alert("This room is full. Try another.");
          ws.close();
          return;
        }

        if (data.type === "color_assignment") {
          setPlayerColor(data.color);
          console.log(`🎨 You are playing as ${data.color}`);
          return;
        }

        if (data.from && data.to) {
          const move = gameRef.current.move({
            from: data.from,
            to: data.to,
            promotion: "q",
          });
          if (move) {
            setFen(gameRef.current.fen());
            setMoveHistory((prev) => [...prev, move.san]);
          }
        }
      };

      ws.onclose = () => {
        console.log("❌ Disconnected from WebSocket");
        setPlayerColor(null);
      };
    }

    // --- Cleanup ---
    return () => {
      clearInterval(interval);
      if (ws) ws.close();
    };
  }, [playMode, selectedRoom]);
}
