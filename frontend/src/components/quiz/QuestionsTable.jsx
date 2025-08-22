import { useState } from 'react'

export default function QuestionsTable({ questions, onDelete }) {
  const [deletingId, setDeletingId] = useState(null)

  if (!questions || questions.length === 0) {
    return <p>No questions added yet.</p>
  }

  const sorted = [...questions].sort((a, b) => a.order - b.order)

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
            <th>Timer</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((q) => (
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
                  onClick={() => handleDelete(q.id)}
                  disabled={deletingId === q.id}
                >
                  {deletingId === q.id ? 'Deleting…' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
