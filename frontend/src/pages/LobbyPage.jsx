import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPublishedQuizzes } from '../lib/api/quizzes'

export default function LobbyPage() {
  const { user } = useAuth()

  const [publishedQuizzes, setPublishedQuizzes] = useState([])
  const [loadingQuizzes, setLoadingQuizzes] = useState(true)
  const [quizzesError, setQuizzesError] = useState(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await getPublishedQuizzes()
        if (mounted) setPublishedQuizzes(Array.isArray(data) ? data : [])
      } catch (err) {
        if (mounted) setQuizzesError(err.message || 'Failed to load quizzes')
      } finally {
        if (mounted) setLoadingQuizzes(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours === 0 ? 12 : hours
    const hoursStr = String(hours).padStart(2, '0')
    return `${year}-${month}-${day} ${hoursStr}:${minutes} ${ampm}`
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Lobby</h1>
        <p className="text-base-content/70 mt-1">
          Signed in as <span className="font-semibold">{user?.username}</span>
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Available Quizzes</h2>
        {loadingQuizzes && <p>Loading quizzes…</p>}
        {quizzesError && (
          <div className="alert alert-error mb-4">
            <span>{quizzesError}</span>
          </div>
        )}
        {!loadingQuizzes && !quizzesError && publishedQuizzes.length === 0 && (
          <p>No quizzes are currently published.</p>
        )}
        <div className="grid gap-4">
          {publishedQuizzes.map((quiz) => (
            <div key={quiz.id} className="card bg-base-100 shadow">
              <div className="card-body">
                <h3 className="card-title">{quiz.title}</h3>
                {quiz.description && (
                  <p className="text-sm text-base-content/70 mb-2">{quiz.description}</p>
                )}
                <div className="text-sm text-base-content/60 space-y-1 mb-3">
                  <p><strong>Publisher:</strong> {quiz.publisher_username || 'Unknown'}</p>
                  <p><strong>Publish date:</strong> {formatDate(quiz.publish_date)}</p>
                  <p><strong>Available until:</strong> {formatDate(quiz.available_to_date)}</p>
                </div>
                <button className="btn btn-primary">
                  Take Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
