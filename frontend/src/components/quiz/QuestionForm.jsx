import { useState } from 'react'
import { useNotifier } from '../../context/NotificationContext'

export default function QuestionForm({ onAdd, className = '', disabled = false }) {
  const [text, setText] = useState('')
  const [choices, setChoices] = useState(['', '', '', ''])
  const [correctIndex, setCorrectIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { notify } = useNotifier()

  const onChoiceChange = (i, value) => {
    const next = [...choices]
    next[i] = value
    setChoices(next)
  }

  const canSubmit =
    text.trim().length > 0 &&
    choices.every((c) => c.trim().length > 0) &&
    correctIndex >= 0 &&
    correctIndex < choices.length &&
    !disabled

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      await onAdd(text.trim(), choices.map((c) => c.trim()), correctIndex)
      notify.success('Question added successfully!')
      // reset form
      setText('')
      setChoices(['', '', '', ''])
      setCorrectIndex(0)
    } catch (err) {
      notify.error(err.message || 'Failed to add question')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label className="label">Question text</label>
        <textarea
          className="textarea textarea-bordered w-full"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          disabled={disabled}
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
            disabled={disabled}
          />
          <input
            type="radio"
            name="correct"
            checked={correctIndex === i}
            onChange={() => setCorrectIndex(i)}
            aria-label={`Mark choice ${i + 1} as correct`}
            disabled={disabled}
          />
        </div>
      ))}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={!canSubmit || submitting || disabled}
      >
        {submitting ? 'Saving…' : 'Save question'}
      </button>
    </form>
  )
}