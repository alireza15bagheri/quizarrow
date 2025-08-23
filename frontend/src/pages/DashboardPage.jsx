import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom' 

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Quizarrow Dashboard</h1>
        <p className="text-base-content/70 mt-1">
          Welcome back, <span className="font-semibold">{user?.username}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Create quiz card */}
        <div className="card bg-base-100 shadow-xl flex flex-col justify-between">
          <div className="card-body flex flex-col">
            <h2 className="card-title">Create quiz</h2>
            <p className="mb-4">Start building a new quiz to host later.</p>
            <div className="flex justify-center mt-auto">
              <button
                className="btn btn-primary w-44"
                onClick={() => navigate('/quizzes/new')}
              >
                Create quiz
              </button>
            </div>
          </div>
        </div>

        {/* My quizzes card */}
        <div className="card bg-base-100 shadow-xl flex flex-col justify-between">
          <div className="card-body flex flex-col">
            <h2 className="card-title">My quizzes</h2>
            <p className="mb-4">Browse and manage your created quizzes.</p>
            <div className="flex justify-center mt-auto">
              <button
                className="btn btn-secondary w-44"
                onClick={() => navigate('/quizzes/mine')}
              >
                View quizzes
              </button>
            </div>
          </div>
        </div>

        {/* My sessions card */}
        <div className="card bg-base-100 shadow-xl flex flex-col justify-between md:col-span-2">
          <div className="card-body flex flex-col">
            <h2 className="card-title">My sessions</h2>
            <p className="mb-4">View and manage your published quizzes.</p>
            <div className="flex justify-center mt-auto">
              <button
                className="btn btn-accent w-44"
                onClick={() => navigate('/sessions')}
              >
                Go to My Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}