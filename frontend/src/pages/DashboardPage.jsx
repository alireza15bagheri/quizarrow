import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Quizarrow Dashboard</h1>
        <p className="text-base-content/70 mt-1">
          Welcome back, <span className="font-semibold">{user?.username}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Create quiz</h2>
            <p>Start a new live quiz session for your players.</p>
            <div className="card-actions justify-end">
              <button className="btn btn-primary" disabled>
                Coming soon
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">My sessions</h2>
            <p>View previous games, stats, and leaderboards.</p>
            <div className="card-actions justify-end">
              <button className="btn" disabled>
                Coming soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
