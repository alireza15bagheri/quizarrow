import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { addQuizQuestion, deleteQuizQuestion } from '../lib/api/questions'

// helper to fetch quiz detail from backend
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

  // quiz meta
  const [quizTitle, setQuizTitle] = useState('')
  const [quizDescription, setQuizDescription] = useState('')

  // question form state
  const [text, setText] = useState('')
  const [choices, setChoices] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // current max order
  const [maxOrder, setMaxOrder] = useState(-1)
  const [initialLoading, setInitialLoading] = useState(true)

  // existing questions
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const quiz = await getQuizDetail(id)
        setQuizTitle(quiz.title)
        setQuizDescription(quiz.description)
        setQuestions(quiz.quiz_questions || [])
        const currentMax = quiz.quiz_questions?.length
          ? Math.max(...quiz.quiz_questions.map((q) => q.order))
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
          order: maxOrder + 1,
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
      // refresh list
      const quiz = await getQuizDetail(id)
      setQuestions(quiz.quiz_questions || [])
      setMaxOrder(
        quiz.quiz_questions?.length
          ? Math.max(...quiz.quiz_questions.map((q) => q.order))
          : -1
      )
      // reset form
      setText('')
      setChoices(['', '', '', ''])
      setCorrectIndex(0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onDeleteQuestion = async (qid) => {
    if (!window.confirm('Delete this question?')) return
    try {
      await deleteQuizQuestion(id, qid)
      setQuestions((prev) => prev.filter((q) => q.id !== qid))
    } catch (err) {
      alert(err.message)
    }
  }

  if (initialLoading) {
    return <div>Loading quiz info…</div>
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* quiz title + description */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{quizTitle}</h1>
        {quizDescription && (
          <p className="text-base-content/70 mt-1">{quizDescription}</p>
        )}
      </div>

      <h2 className="text-2xl font-semibold mb-4">Add a Question</h2>

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4 mb-8">
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
              aria-label={`Mark choice ${i + 1} as correct`}
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Question'}
        </button>
      </form>

      {/* Existing questions list */}
      <h2 className="text-2xl font-semibold mb-4">Existing Questions</h2>
      {questions.length === 0 ? (
        <p>No questions added yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Text</th>
                <th>Points</th>
                <th>Timer</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {questions
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((q) => (
                  <tr key={q.id}>
                    <td>{q.order}</td>
                    <td className="text-left">
                      {q.question?.text?.length > 120
                        ? q.question.text.slice(0, 120) + '…'
                        : q.question?.text || '(no text)'}
                    </td>
                    <td>{q.effective_points}</td>
                    <td>{q.effective_timer}s</td>
                    <td className="text-right">
                      <button
                        className="btn btn-error btn-xs"
                        onClick={() => onDeleteQuestion(q.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
