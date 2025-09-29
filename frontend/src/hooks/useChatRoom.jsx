import { useState, useEffect, useRef, useCallback } from 'react';
import { getChatMessages, getChatRoomDetails } from '../lib/api/chat';
import { useAuth } from '../context/AuthContext';

function getWebSocketURL(roomId) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const { host } = window.location;
  return `${protocol}//${host}/ws/chat/${roomId}/`;
}

export default function useChatRoom(roomId) {
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState(null);
  const [rateLimitError, setRateLimitError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId || !user) return;

    // Fetch room details and historical messages
    Promise.all([
      getChatRoomDetails(roomId),
      getChatMessages(roomId)
    ])
      .then(([roomData, historyData]) => {
        setRoom(roomData);
        // history is newest-first, so reverse it for display
        setMessages(historyData.reverse());
      })
      .catch((err) => setError(err.message || 'Failed to load room data.'))
      .finally(() => setLoadingHistory(false));

    // Establish WebSocket connection
    const url = getWebSocketURL(roomId);
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log(`WebSocket connected to room ${roomId}`);
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error === 'rate_limit_exceeded') {
        setRateLimitError(data.message);
        // Clear the message after 5 seconds to avoid it being sticky
        const timer = setTimeout(() => setRateLimitError(null), 5000);
        return () => clearTimeout(timer);
      } else {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected from room ${roomId}`);
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('WebSocket connection error.');
      ws.close();
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [roomId, user]);

  const sendMessage = useCallback((message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message }));
    } else {
      console.error('WebSocket is not connected.');
      setError('Cannot send message. Not connected to the server.');
    }
  }, []);

  return { room, messages, loadingHistory, error, isConnected, sendMessage, rateLimitError };
}