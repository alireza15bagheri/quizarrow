import { useEffect, useState } from 'react'
import { getMyQuizzes, updateQuizMeta } from '../lib/api/quizzes'
import { useNavigate } from 'react-router-dom'

function formatPublishDate(quiz) {
  // If quiz is published, use updated_at (when published), else empty string
  // If you want the first publish time, you should store it in DB; for now use updated_at if published
  if (!quiz.is_published) return ''
  const date = new Date(quiz.updated_at)
  // Format: MM-DD HH:mm
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${min}`
}

export default function MySessionsPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [publishingId, setPublishingId] = useState(null)
  const navigate = useNavigate()

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

  const onTogglePublish = async (quiz) => {
    const nextStatus = !quiz.is_published
    const confirmMsg = nextStatus
      ? 'Are you sure you want to publish this quiz? Once published, others can see and join it.'
      : 'Are you sure you want to unpublish this quiz? It will no longer be visible to others.'
    if (!window.confirm(confirmMsg)) return
    setPublishingId(quiz.id)
    try {
      await updateQuizMeta(quiz.id, { is_published: nextStatus })
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quiz.id ? { ...q, is_published: nextStatus, updated_at: new Date().toISOString() } : q
        )
      )
    } catch (err) {
      alert(err.message)
    } finally {
      setPublishingId(null)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) return <div>Loading…</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">My Sessions</h1>
      <p className="mb-4 text-base-content/70">
        Here you can manage your quizzes and publish or unpublish them so others can participate.
      </p>
      {quizzes.length === 0 ? (
        <p>You have not created any quizzes yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Publish date</th>
                <th>Status</th>
                <th colSpan={2}></th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td>{quiz.title}</td>
                  <td>
                    {quiz.is_published ? (
                      <span>{formatPublishDate(quiz)}</span>
                    ) : (
                      <span className="text-base-content/40 italic">—</span>
                    )}
                  </td>
                  <td>
                    {quiz.is_published ? (
                      <span className="badge badge-success">Published</span>
                    ) : (
                      <span className="badge badge-ghost">Draft</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-accent btn-sm text-xl"
                      onClick={() => navigate(`/quizzes/${quiz.id}/edit`)}
                    >
                      ...
                    </button>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${quiz.is_published ? 'btn-warning' : 'btn-primary'}`}
                      onClick={() => onTogglePublish(quiz)}
                      disabled={publishingId === quiz.id}
                    >
                      {publishingId === quiz.id
                        ? (quiz.is_published ? 'Unpublishing…' : 'Publishing…')
                        : (quiz.is_published ? 'Unpublish' : 'Publish')}
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