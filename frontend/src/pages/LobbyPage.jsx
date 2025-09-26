import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { getPublishedQuizzes } from '../lib/api/quizzes'
import { joinLobby } from '../lib/api/game'
import { useNavigate } from 'react-router-dom'
import { getAllTags } from '../lib/api/tags'
import QuizFilter from '../components/lobby/QuizFilter'
import QuizCard from '../components/lobby/QuizCard'

export default function LobbyPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [allQuizzes, setAllQuizzes] = useState([])
  const [allTags, setAllTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joiningId, setJoiningId] = useState(null)
  const [searchId, setSearchId] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState(new Set())

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [quizzesData, tagsData] = await Promise.all([
          getPublishedQuizzes(),
          getAllTags(),
        ])
        if (mounted) {
          setAllQuizzes(Array.isArray(quizzesData) ? quizzesData : [])
          setAllTags(Array.isArray(tagsData) ? tagsData : [])
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load lobby data')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const filteredQuizzes = useMemo(() => {
    let quizzes = allQuizzes
    // Filter by search ID first
    if (searchId.trim()) {
      quizzes = quizzes.filter((quiz) => String(quiz.id) === searchId.trim())
    }
    // Then filter by selected tags
    if (selectedTagIds.size > 0) {
      quizzes = quizzes.filter((quiz) => {
        const quizTagIds = new Set(quiz.tags.map((t) => t.id))
        return Array.from(selectedTagIds).every((id) => quizTagIds.has(id))
      })
    }
    return quizzes
  }, [allQuizzes, searchId, selectedTagIds])

  const handleTakeQuiz = async (quizId) => {
    setJoiningId(quizId)
    try {
      const { lobby_id } = await joinLobby(quizId)
      navigate(`/quiz/take/${lobby_id}`)
    } catch (err) {
      setError(err.message || 'Could not start quiz session.')
    } finally {
      setJoiningId(null)
    }
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

        <QuizFilter
          searchId={searchId}
          onSearchIdChange={setSearchId}
          allTags={allTags}
          selectedTagIds={selectedTagIds}
          onTagChange={setSelectedTagIds}
        />

        {loading && <p>Loading quizzes…</p>}

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && filteredQuizzes.length === 0 && (
          <p>No quizzes match your selected filters.</p>
        )}

        <div className="grid gap-4">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onTakeQuiz={handleTakeQuiz}
              joiningId={joiningId}
            />
          ))}
        </div>
      </div>
    </div>
  )
}