// components/useMultiplayer.jsx
import { useEffect } from 'react';
import { Chess } from 'chess.js';

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
}) {
  useEffect(() => {
    if (playMode !== 'multiplayer') {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setPlayerColor(null);
      setAvailableGames([]);
      setGameStatus('');
      setFen(gameRef.current.fen());
      setMoveHistory([]);
      return;
    }

    let interval;
    if (!gameId) {
      const fetchGames = async () => {
        try {
          const res = await fetch(`${backendUrl}/waiting-games/`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setAvailableGames(data.games || []);
        } catch (err) {
          console.error('Failed to fetch games:', err);
        }
      };
      fetchGames();
      interval = setInterval(fetchGames, 10000);
    }

    if (gameId) {
      const initGameState = async () => {
        try {
          const res = await fetch(`${backendUrl}/join-game/${gameId}`);
          if (!res.ok) throw new Error('Failed to join game. Try another ID.');
          const data = await res.json();
          gameRef.current = new Chess(data.fen);
          setFen(data.fen);
          setMoveHistory(data.move_history || []);
          setGameStatus(data.status || 'ongoing');
          console.log('Loaded game state:', data);
        } catch (err) {
          console.error('Failed to join game:', err);
          setGameStatus(err.message);
        }
      };
      initGameState();

      let clientId = localStorage.getItem('clientId');
      if (!clientId) {
        clientId = crypto.randomUUID();
        localStorage.setItem('clientId', clientId);
      }

      const wsBaseUrl = backendUrl.includes('localhost')
        ? 'ws://localhost:8000'
        : 'wss://sp-14-green-chess-ai.onrender.com';
      wsRef.current = new WebSocket(`${wsBaseUrl}/ws/chess/${gameId}?client_id=${clientId}`);

      wsRef.current.onopen = () => {
        console.log(`Connected to WebSocket for game ${gameId} as client ${clientId}`);
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);

        if (data.type === 'error') {
          console.error('Server error:', data.message);
          setGameStatus(`Failed to join game: ${data.message}`);
          wsRef.current.close();
          return;
        }

        if (data.type === 'init') {
          try {
            gameRef.current = new Chess(data.fen);
            setFen(data.fen);
            setMoveHistory(data.move_history || []);
            setGameStatus(data.status || 'ongoing');
            setPlayerColor(data.color);
            console.log(`Initialized game ${gameId}: FEN=${data.fen}, Color=${data.color}`);
          } catch (err) {
            console.error('Invalid FEN:', err);
            initGameState();
          }
        }

        if (data.type === 'move') {
          try {
            const move = gameRef.current.move({
              from: data.from,
              to: data.to,
              promotion: data.promotion || 'q',
            });
            if (move) {
              setFen(gameRef.current.fen());
              setMoveHistory((prev) => [...prev, move.san]);
              setGameStatus(data.status || 'ongoing');
              console.log(`Applied move: ${move.san}`);
            }
          } catch (err) {
            console.error('Move error:', err);
            initGameState();
          }
        }
      };

      wsRef.current.onclose = (event) => {
        console.log(`WebSocket closed for game ${gameId}: code=${event.code}, reason=${event.reason}`);
        setPlayerColor(null);
        setGameStatus('Disconnected');
      };

      wsRef.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setGameStatus('Failed to connect to game server');
      };
    }

    return () => {
      if (interval) clearInterval(interval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [
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
  ]);
}