import { useEffect, useState } from 'react'
import { getMyQuizzes, updateQuizMeta } from '../lib/api/quizzes'
import { useNavigate } from 'react-router-dom'
import { useNotifier } from '../context/NotificationContext'
import { useConfirm } from '../context/ConfirmationContext'
import { toInputLocal } from '../lib/utils/dateUtils'
import SessionsTable from '../components/sessions/SessionsTable'

export default function MySessionsPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [publishingId, setPublishingId] = useState(null)
  const [availables, setAvailables] = useState({})
  const navigate = useNavigate()
  const { notify } = useNotifier()
  const { confirmAction } = useConfirm()

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

    // Prevent publishing a quiz with no questions
    if (nextStatus && (!quiz.quiz_questions || quiz.quiz_questions.length === 0)) {
      notify.error('Cannot publish a quiz with no questions. Please add questions first.')
      return
    }

    const confirmMsg = nextStatus
      ? 'Once published, this quiz will be visible in the lobby for others to take.'
      : 'Unpublishing this quiz will remove it from the lobby.'
    const confirmed = await confirmAction({
      title: nextStatus ? `Publish "${quiz.title}"?` : `Unpublish "${quiz.title}"?`,
      message: confirmMsg,
      confirmText: nextStatus ? 'Publish' : 'Unpublish',
      confirmButtonClass: nextStatus ? 'btn-primary' : 'btn-warning',
    })

    if (!confirmed) return

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
      notify.success(
        nextStatus ? `Quiz "${quiz.title}" published!` : `Quiz "${quiz.title}" unpublished.`
      )
    } catch (err) {
      notify.error(err.message)
    } finally {
      setPublishingId(null)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])
  
  const handleDateChange = (quizId, value) => {
    setAvailables((prev) => ({ ...prev, [quizId]: value }))
  }

  const handleNavigateToEdit = (quizId) => {
    navigate(`/quizzes/${quizId}/edit`)
  }

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
        <SessionsTable
          quizzes={quizzes}
          publishingId={publishingId}
          availables={availables}
          onTogglePublish={onTogglePublish}
          onDateChange={handleDateChange}
          onNavigateToEdit={handleNavigateToEdit}
        />
      )}
    </div>
  )
}