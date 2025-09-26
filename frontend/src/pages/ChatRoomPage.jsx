import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import useChatRoom from '../hooks/useChatRoom';
import { useAuth } from '../context/AuthContext';

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { room, messages, loadingHistory, error, isConnected, sendMessage } = useChatRoom(roomId);
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTimestamp = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-2xl mx-auto">
      <div className="flex items-center justify-between p-2">
        <Link to="/chatrooms" className="btn btn-ghost">
          &larr; Back to Rooms
        </Link>
        <h1 className="text-xl font-bold">{room?.name || 'Chat Room'}</h1>
        <div className={`badge ${isConnected ? 'badge-success' : 'badge-error'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="flex-grow bg-base-200 rounded-lg p-4 overflow-y-auto space-y-4">
        {loadingHistory && <p>Loading message history...</p>}
        {error && <div className="alert alert-error">{error}</div>}
        {!loadingHistory && messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${msg.user_username === user.username ? 'chat-end' : 'chat-start'}`}
          >
            <div className="chat-header">
              {msg.user_username}
              <time className="text-xs opacity-50 ml-2">{formatTimestamp(msg.timestamp)}</time>
            </div>
            <div className="chat-bubble">{msg.message}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 p-4">
        <input
          type="text"
          className="input input-bordered flex-grow"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={!isConnected}
        />
        <button type="submit" className="btn btn-primary" disabled={!isConnected || !newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}