import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPublishedQuizzes } from '../lib/api/quizzes'
import { joinLobby } from '../lib/api/game'
import { useNavigate } from 'react-router-dom'

function Icon({ name, className = 'w-4 h-4' }) {
  switch (name) {
    case 'user':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z" />
        </svg>
      )
    case 'calendarStart':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
           <path d="M7 2v2H5c-1.1 0-2 .9-2 2v2h18V6c0-1.1-.9-2-2-2h-2V2h-2v2H9V2H7zm14 8H3v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10z" />
        </svg>
      )
    case 'calendarEnd':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 2v2H5c-1.1 0-2 .9-2 2v2h18V6c0-1.1-.9-2-2-2h-2V2h-2v2H9V2H7zm-4 8v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10H3zm7 8h4v-2h-4v2z" />
        </svg>
      )
    default:
      return null
  }
}

export default function LobbyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [allQuizzes, setAllQuizzes] = useState([])
  const [loadingQuizzes, setLoadingQuizzes] = useState(true)
  const [quizzesError, setQuizzesError] = useState(null)
  const [joiningId, setJoiningId] = useState(null)
  const [searchId, setSearchId] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await getPublishedQuizzes()
        if (mounted) setAllQuizzes(Array.isArray(data) ? data : [])
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

  const filteredQuizzes = useMemo(() => {
    if (!searchId.trim()) {
      return allQuizzes
    }
    return allQuizzes.filter((quiz) => String(quiz.id) === searchId.trim())
  }, [allQuizzes, searchId])

  const handleTakeQuiz = async (quizId) => {
    setJoiningId(quizId)
    try {
       const { lobby_id } = await joinLobby(quizId)
      navigate(`/quiz/take/${lobby_id}`)
    } catch (err) {
      setQuizzesError(err.message || 'Could not start quiz session.')
    } finally {
      setJoiningId(null)
    }
  }

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

        <div className="form-control mb-4">
          <label htmlFor="quiz-id-search" className="label">
            <span className="label-text">Quiz ID</span>
          </label>
          <div className="flex gap-2">
            <input
              id="quiz-id-search"
              type="text"
              placeholder="Enter Quiz ID to find a specific quiz"
              className="input input-bordered w-full"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            <button
              className="btn btn-neutral"
              onClick={() => setSearchId('')}
              disabled={!searchId}
            >
              Clear
            </button>
          </div>
        </div>

        {loadingQuizzes && <p>Loading quizzes…</p>}

        {quizzesError && (
          <div className="alert alert-error mb-4">
            <span>{quizzesError}</span>
          </div>
        )}

        {!loadingQuizzes && !quizzesError && filteredQuizzes.length === 0 && (
          <p>
            {searchId.trim()
              ? 'No quiz found with that ID.'
              : 'No quizzes are currently published.'}
          </p>
        )}

        <div className="grid gap-4">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="card bg-base-100/90 border border-base-200 shadow-sm hover:shadow-md hover:border-base-300 transition"
            >
               {/* Accent header stripe */}
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-secondary rounded-t-box" />

              <div className="card-body">
                {/* Title + status pill */}
                <div className="flex items-start justify-between gap-3">
                   <h3 className="card-title text-left">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                      {quiz.title}
                    </span>
                  </h3>
                   <span className="badge badge-success badge-sm mt-1">Published</span>
                </div>

                {/* Optional description */}
                {quiz.description && (
                  <p className="text-sm text-base-content/70">
                     {quiz.description}
                  </p>
                )}

                {/* Info chips */}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5  py-1 rounded-full bg-base-200 text-xs text-base-content/80">
                    <span className="font-medium">ID</span>
                    <span className="font-semibold">#{quiz.id}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-200 text-xs text-base-content/80">
                     <Icon name="user" />
                    <span className="font-medium">by</span>
                    <span className="font-semibold">{quiz.publisher_username || 'Unknown'}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-200 text-xs text-base-content/80">
                    <Icon name="calendarStart" />
                    <span className="font-medium">Published</span>
                     <span className="font-semibold">{formatDate(quiz.publish_date)}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-200 text-xs text-base-content/80">
                    <Icon name="calendarEnd" />
                    <span className="font-medium">Available Until</span>
                     <span className="font-semibold">{formatDate(quiz.available_to_date)}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-3 flex justify-end">
                   <button
                    className="btn btn-primary"
                    onClick={() => handleTakeQuiz(quiz.id)}
                    disabled={joiningId === quiz.id}
                  >
                     {joiningId === quiz.id ? 'Starting…' : 'Take Quiz'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}