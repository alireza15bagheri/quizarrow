import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifier } from '../context/NotificationContext';
import { getChatRooms, createChatRoom, adminDeleteChatRoom } from '../lib/api/chat';
import { useNavigate } from 'react-router-dom';
import { useConfirm } from '../context/ConfirmationContext';

function CreateRoomForm({ onRoomCreated }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useNotifier();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      notify.error('Room name cannot be empty.');
      return;
    }
    setSubmitting(true);
    try {
      await createChatRoom(name.trim());
      notify.success(`Chat room "${name.trim()}" created!`);
      setName('');
      onRoomCreated(); // Callback to refresh the list
    } catch (err) {
      notify.error(err.message || 'Failed to create room.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card bg-base-200 p-4 mb-8">
      <h2 className="text-xl font-semibold mb-3">Create a New Chat Room</h2>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter room name..."
          className="input input-bordered w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
        />
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
}

export default function ChatroomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { notify } = useNotifier();
  const { confirmAction } = useConfirm();
  const navigate = useNavigate();

  const canCreate = user?.role === 'admin' || user?.role === 'host';

  const fetchRooms = async () => {
    try {
      const data = await getChatRooms();
      setRooms(data);
    } catch (err) {
      setError(err.message || 'Failed to load chat rooms.');
      notify.error(err.message || 'Failed to load chat rooms.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (room) => {
    const confirmed = await confirmAction({
      title: 'Delete Chat Room?',
      message: `Are you sure you want to permanently delete the room "${room.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmButtonClass: 'btn-error',
    });

    if (confirmed) {
      try {
        await adminDeleteChatRoom(room.id);
        notify.success(`Chat room "${room.name}" deleted.`);
        fetchRooms(); // Refresh the list
      } catch (err) {
        notify.error(err.message || 'Failed to delete room.');
      }
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  if (loading) {
    return <div>Loading chat rooms...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Chatrooms</h1>

      {canCreate && <CreateRoomForm onRoomCreated={fetchRooms} />}

      <div className="space-y-3">
        {rooms.length > 0 ? (
          rooms.map((room) => {
            const canDelete = user?.role === 'admin' || user?.username === room.created_by_username;
            return (
              <div key={room.id} className="card bg-base-100 shadow-md">
                <div className="card-body flex-row items-center justify-between p-4">
                  <div>
                    <h3 className="card-title text-lg">{room.name}</h3>
                    <span className="text-xs text-base-content/60">
                      Created by {room.created_by_username || 'system'}
                    </span>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/chatrooms/${room.id}`)}
                    >
                      Join Room
                    </button>
                    {canDelete && (
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleDeleteRoom(room)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-base-content/70 p-8">No chat rooms available yet.</p>
        )}
      </div>
    </div>
  );
}