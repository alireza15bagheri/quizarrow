import { useEffect, useState } from 'react'
import { getMyQuizzes, deleteQuiz } from '../lib/api'

export default function MyQuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyQuizzes()
      setQuizzes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return
    try {
      await deleteQuiz(id)
      setQuizzes(quizzes.filter(q => q.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) return <div>Loading…</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">My Quizzes</h1>
      {quizzes.length === 0 ? (
        <p>You have not created any quizzes yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td>{quiz.title}</td>
                  <td>{new Date(quiz.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => onDelete(quiz.id)}
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
