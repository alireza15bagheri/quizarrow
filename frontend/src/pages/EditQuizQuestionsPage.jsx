import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { addQuizQuestion } from '../lib/api'

// NEW helper to fetch quiz detail
async function getQuizDetail(id) {
  const res = await fetch(`/api/game/quizzes/${id}/`, {
    method: 'GET',
    credentials: 'include',
  })
  if (!res.ok) {
    throw new Error('Failed to fetch quiz details')
  }
  return res.json()
}

export default function EditQuizQuestionsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [choices, setChoices] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // NEW: track current max order from existing quiz_questions
  const [maxOrder, setMaxOrder] = useState(-1)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    // Fetch quiz detail on mount
    async function fetchQuiz() {
      try {
        const quiz = await getQuizDetail(id)
        const currentMax = quiz.quiz_questions?.length
          ? Math.max(...quiz.quiz_questions.map(q => q.order))
          : -1
        setMaxOrder(currentMax)
      } catch (err) {
        setError(err.message)
      } finally {
        setInitialLoading(false)
      }
    }
    fetchQuiz()
  }, [id])

  const onChoiceChange = (i, value) => {
    const newChoices = [...choices]
    newChoices[i] = value
    setChoices(newChoices)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      quiz_questions: [
        {
          order: maxOrder + 1, // FIX: assign next available order
          question: {
            type: 'mcq',
            difficulty: 'medium',
            text,
            content: { choices },
            answer_key: { correct_index: correctIndex },
            default_timer_seconds: 20,
            default_points: 100,
          },
        },
      ],
    }

    try {
      await addQuizQuestion(id, payload)
      navigate('/quizzes/mine')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return <div>Loading quiz info…</div>
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Edit Quiz Questions</h1>
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Question text</label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </div>
        {choices.map((choice, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className="input input-bordered w-full"
              value={choice}
              onChange={(e) => onChoiceChange(i, e.target.value)}
              placeholder={`Choice ${i + 1}`}
              required
            />
            <input
              type="radio"
              name="correct"
              checked={correctIndex === i}
              onChange={() => setCorrectIndex(i)}
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Question'}
        </button>
      </form>
    </div>
  )
}
