import { useEffect, useMemo, useState } from 'react'
import { getMyQuizzes, updateQuizMeta } from '../lib/api/quizzes'
import { useNavigate } from 'react-router-dom'

function toInputLocal(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  // datetime-local expects YYYY-MM-DDTHH:MM (no seconds)
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function formatDisplay(dt) {
  if (!dt) return '—'
  const d = new Date(dt)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours === 0 ? 12 : hours
  const hoursStr = String(hours).padStart(2, '0')
  return `${year}-${month}-${day} ${hoursStr}:${minutes} ${ampm}`
}

export default function MySessionsPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [publishingId, setPublishingId] = useState(null)
  const [availables, setAvailables] = useState({})
  const navigate = useNavigate()

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyQuizzes()
      setQuizzes(data)
      // Prime input state with existing values (if any)
      const initial = {}
      for (const q of data) {
        initial[q.id] = toInputLocal(q.available_to_date)
      }
      setAvailables(initial)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onTogglePublish = async (quiz) => {
    const nextStatus = !quiz.is_published
    const confirmMsg = nextStatus
      ? 'Publish this quiz? Once published, it will be visible to others.'
      : 'Unpublish this quiz? It will no longer be visible to others.'
    if (!window.confirm(confirmMsg)) return

    setPublishingId(quiz.id)
    try {
      const payload = { is_published: nextStatus }
      // If publishing and a date is provided, include available_to_date
      if (nextStatus) {
        const inputVal = availables[quiz.id]
        if (inputVal && inputVal.trim()) {
          // Convert local input to ISO string
          const iso = new Date(inputVal).toISOString()
          payload.available_to_date = iso
        }
      }
      await updateQuizMeta(quiz.id, payload)
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quiz.id
            ? {
                ...q,
                is_published: nextStatus,
                // Update available_to_date locally if we sent it
                available_to_date:
                  nextStatus && payload.available_to_date
                    ? payload.available_to_date
                    : q.available_to_date,
                updated_at: new Date().toISOString(),
              }
            : q
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
        Manage your quizzes, publish/unpublish them, and set an availability end time.
      </p>
      {quizzes.length === 0 ? (
        <p>You have not created any quizzes yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Available until</th>
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
                      <span>{formatDisplay(quiz.available_to_date)}</span>
                    ) : (
                      <input
                        type="datetime-local"
                        className="input input-sm input-bordered"
                        value={availables[quiz.id] ?? ''}
                        onChange={(e) =>
                          setAvailables((prev) => ({ ...prev, [quiz.id]: e.target.value }))
                        }
                      />
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
