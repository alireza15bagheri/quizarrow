import { useEffect, useState } from 'react'
import { getMyQuizzes, deleteQuiz } from '../lib/api/quizzes'
import { useNavigate } from 'react-router-dom'
import { useNotifier } from '../context/NotificationContext'
import { useConfirm } from '../context/ConfirmationContext'

export default function MyQuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { notify } = useNotifier()
  const { confirmAction } = useConfirm()

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
    const confirmed = await confirmAction({
      title: 'Delete Quiz?',
      message: 'Are you sure you want to permanently delete this quiz? This action cannot be undone.',
      confirmText: 'Delete Quiz',
      confirmButtonClass: 'btn-error',
    })
    if (!confirmed) return

    try {
      await deleteQuiz(id)
      setQuizzes(quizzes.filter((q) => q.id !== id))
      notify.success('Quiz deleted successfully.')
    } catch (err) {
      notify.error(err.message)
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
                <th colSpan={2}></th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td>{quiz.title}</td>
                  <td>{new Date(quiz.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => navigate(`/quizzes/${quiz.id}/edit`)}
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <div
                      className="tooltip"
                      data-tip={quiz.is_published ? 'Unpublish To Delete' : ''}
                    >
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => onDelete(quiz.id)}
                        disabled={quiz.is_published}
                      >
                        Delete
                      </button>
                    </div>
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