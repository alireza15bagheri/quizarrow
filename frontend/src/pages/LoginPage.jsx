import { useEffect, useState } from 'react'
import { ensureCsrf, login, me } from '../lib/api'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    (async () => {
      await ensureCsrf()
      const current = await me()
      if (current) setUser(current)
    })()
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const data = await login(username.trim(), password)
      setUser(data.user)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Quizarrow</h1>
          <p className="text-base-content/70 mt-1">Sign in to continue</p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            {user ? (
              <div className="space-y-2">
                <p className="text-success">
                  Logged in as <span className="font-medium">{user.username}</span>
                </p>
                <p className="text-sm text-base-content/70">
                  You’re ready to go. Build the lobby next!
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label mr-2">
                    <span className="label-text">Username</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    placeholder="yourname"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <div className="form-control">
                  <label className="label mr-3">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    className="input input-bordered"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="alert alert-error">
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className={`btn btn-primary w-full ${loading ? 'btn-disabled' : ''}`}
                >
                  {loading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-base-content/60 mt-4">
          Don’t have an account yet? Create via Django admin for now.
        </p>
      </div>
    </div>
  )
}
