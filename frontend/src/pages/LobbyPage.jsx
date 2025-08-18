import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LobbyPage() {
  const { user } = useAuth()

  // Placeholders for future integration
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [message, setMessage] = useState(null)

  const onCreate = (e) => {
    e.preventDefault()
    // Later: POST /api/lobbies/ to create a room, then navigate to /lobby/:code and open WS
    setMessage('Creating lobbies will be available soon.')
  }

  const onJoin = (e) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    // Later: validate code via /api/lobbies/:code, then navigate and open WS
    setMessage(`Joining lobby "${joinCode.trim().toUpperCase()}" coming soon.`)
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Lobby</h1>
        <p className="text-base-content/70 mt-1">
          Signed in as <span className="font-semibold">{user?.username}</span>
        </p>
      </div>

      {message && (
        <div className="alert alert-info mb-4">
          <span>{message}</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Create lobby */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Create a lobby</h2>
            <p className="text-sm text-base-content/70">
              Host a room and share the code with players.
            </p>
            <form onSubmit={onCreate} className="space-y-3 mt-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Lobby name</span>
                </label>
                <input
                  className="input input-bordered"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., Friday Night Trivia"
                />
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Private lobby</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </label>
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled>
                Coming soon
              </button>
            </form>
          </div>
        </div>

        {/* Join lobby */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Join a lobby</h2>
            <p className="text-sm text-base-content/70">
              Enter the code shared by your host.
            </p>
            <form onSubmit={onJoin} className="space-y-3 mt-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Lobby code</span>
                </label>
                <input
                  className="input input-bordered uppercase tracking-widest"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="ABCD1234"
                />
              </div>
              <button type="submit" className="btn w-full" disabled={!joinCode.trim()}>
                Join (placeholder)
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Future presence area */}
      <div className="card bg-base-100 shadow mt-6">
        <div className="card-body">
          <h3 className="card-title">Players</h3>
          <p className="text-sm text-base-content/70">
            Once connected, you’ll see joined players here in real-time.
          </p>
          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <div className="skeleton h-10"></div>
            <div className="skeleton h-10"></div>
            <div className="skeleton h-10"></div>
            <div className="skeleton h-10"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
