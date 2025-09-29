import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import useChatRoom from '../hooks/useChatRoom';
import { useAuth } from '../context/AuthContext';

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const { room, messages, loadingHistory, error, isConnected, sendMessage, rateLimitError } = useChatRoom(roomId);
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
      
      <div className="p-4">
        {rateLimitError && (
            <div role="alert" className="alert alert-warning mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>{rateLimitError}</span>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
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
    </div>
  );
}