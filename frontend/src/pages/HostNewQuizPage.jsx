import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hostNewQuiz } from '../lib/api'

export default function HostNewQuizPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [choices, setChoices] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        title,
        description,
        quiz_questions: [
          {
            order: 1,
            question: {
              type: 'mcq',
              difficulty: 'medium',
              text: questionText,
              content: { choices },
              answer_key: { correct_index: correctIndex },
              default_timer_seconds: 20,
              default_points: 100
            }
          }
        ]
      }
      await hostNewQuiz(payload)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Host New Quiz</h1>
      {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Question</label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />
        </div>
        {choices.map((choice, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct"
              checked={correctIndex === idx}
              onChange={() => setCorrectIndex(idx)}
            />
            <input
              className="input input-bordered w-full"
              value={choice}
              onChange={(e) => {
                const newChoices = [...choices]
                newChoices[idx] = e.target.value
                setChoices(newChoices)
              }}
              placeholder={`Choice ${idx + 1}`}
              required
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create Quiz'}
        </button>
      </form>
    </div>
  )
}
