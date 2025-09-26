import { formatDisplay } from '../../lib/utils/dateUtils'

export default function SessionRow({ quiz, isPublishing, availableDate, onTogglePublish, onDateChange, onNavigateToEdit }) {
  return (
    <tr key={quiz.id}>
      <td>{quiz.title}</td>
      <td>
        {quiz.is_published ? (
          <span>{formatDisplay(quiz.available_to_date)}</span>
        ) : (
          <input
            type="datetime-local"
            className="input input-sm input-bordered"
            value={availableDate ?? ''}
            onChange={(e) => onDateChange(quiz.id, e.target.value)}
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
          onClick={() => onNavigateToEdit(quiz.id)}
        >
          ...
        </button>
      </td>
      <td>
        <button
          className={`btn btn-sm ${
            quiz.is_published ? 'btn-warning' : 'btn-primary'
          }`}
          onClick={() => onTogglePublish(quiz)}
          disabled={isPublishing}
        >
          {isPublishing
            ? quiz.is_published
              ? 'Unpublishing…'
              : 'Publishing…'
            : quiz.is_published
              ? 'Unpublish'
              : 'Publish'}
        </button>
      </td>
    </tr>
  )
}