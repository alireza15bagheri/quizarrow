import { useState } from 'react'
import { useEditingState } from './useEditingState'

export default function QuestionsTable({ questions, onDelete, onUpdate, disableActions = false }) {
  const { editing, updateField, clear } = useEditingState()
  const [savingId, setSavingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  if (!questions || questions.length === 0) {
    return <p>No questions added yet.</p>
  }

  const sorted = [...questions].sort((a, b) => a.order - b.order)

  const handleSave = async (id) => {
    const data = editing[id]
    if (!data) return
    setSavingId(id)
    try {
      await onUpdate(id, {
        points: data.points,
        timer_seconds: data.timer_seconds,
      })
      clear(id)
    } catch (err) {
      alert(err.message || 'Failed to save')
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Text</th>
            <th>Points</th>
            <th>Timer (s)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((q) => {
            const row = editing[q.id] ?? {}
            const pointsValue =
              row.points ?? (q.points ?? q.effective_points ?? '')
            const timerValue =
              row.timer_seconds ?? (q.timer_seconds ?? q.effective_timer ?? '')

            return (
              <tr key={q.id}>
                <td>{q.order}</td>
                <td className="text-left">
                  {q.question?.text?.length > 120
                    ? q.question.text.slice(0, 120) + '…'
                    : q.question?.text || '(no text)'}
                </td>
                <td>
                  <input
                    type="number"
                    className="input input-sm input-bordered w-24"
                    placeholder={String(q.effective_points)}
                    value={pointsValue}
                    onChange={(e) =>
                      updateField(q.id, 'points', e.target.value)
                    }
                    disabled={disableActions}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="input input-sm input-bordered w-24"
                    placeholder={String(q.effective_timer)}
                    value={timerValue}
                    onChange={(e) =>
                      updateField(q.id, 'timer_seconds', e.target.value)
                    }
                    disabled={disableActions}
                  />
                </td>
                <td className="flex gap-2">
                  <button
                    className="btn btn-success btn-xs"
                    onClick={() => handleSave(q.id)}
                    disabled={savingId === q.id || disableActions}
                    title="Save changes"
                  >
                    {savingId === q.id ? 'Saving' : 'Save'}
                  </button>
                  <button
                    className="btn btn-error btn-xs"
                    onClick={() => handleDelete(q.id)}
                    disabled={deletingId === q.id || disableActions}
                    title="Delete question"
                  >
                    {deletingId === q.id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-xs text-base-content/60 mt-2">
        Tip: Leave a field blank and Save to reset to the question’s default.
      </p>
    </div>
  )
}