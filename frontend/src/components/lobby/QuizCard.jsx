import { Icon } from './LobbyIcons'

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  let hours = date.getHours()
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours === 0 ? 12 : hours
  const hoursStr = String(hours).padStart(2, '0')
  return `${year}-${month}-${day} ${hoursStr}:${minutes} ${ampm}`
}

export default function QuizCard({ quiz, onTakeQuiz, joiningId }) {
  return (
    <div
      key={quiz.id}
      className="card bg-base-100/90 border border-base-200 shadow-sm hover:shadow-md hover:border-base-300 transition"
    >
      {/* Accent header stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-secondary rounded-t-box" />

      <div className="card-body">
        {/* Title + status pill */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title text-left">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              {quiz.title}
            </span>
          </h3>
          <span className="badge badge-success badge-sm mt-1">Published</span>
        </div>

        {/* Tags Display */}
        {quiz.tags && quiz.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 my-2">
            {quiz.tags.map((tag) => (
              <div
                key={tag.id}
                className="badge bg-neutral/70 text-neutral-content text-xs font-semibold p-3"
              >
                {tag.name}
              </div>
            ))}
          </div>
        )}

        {/* Optional description */}
        {quiz.description && (
          <p className="text-sm text-base-content/70">{quiz.description}</p>
        )}

        {/* Info chips */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5  py-1 rounded-full bg-base-200 text-xs text-base-content/80">
            <span className="font-medium">ID</span>
            <span className="font-semibold">#{quiz.id}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-200 text-xs text-base-content/80">
            <Icon name="user" />
            <span className="font-medium">by</span>
            <span className="font-semibold">
              {quiz.publisher_username || 'Unknown'}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-200 text-xs text-base-content/80">
            <Icon name="calendarStart" />
            <span className="font-medium">Published</span>
            <span className="font-semibold">{formatDate(quiz.publish_date)}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-200 text-xs text-base-content/80">
            <Icon name="calendarEnd" />
            <span className="font-medium">Available Until</span>
            <span className="font-semibold">
              {formatDate(quiz.available_to_date)}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-3 flex justify-end">
          <button
            className="btn btn-primary"
            onClick={() => onTakeQuiz(quiz.id)}
            disabled={joiningId === quiz.id}
          >
            {joiningId === quiz.id ? 'Starting…' : 'Take Quiz'}
          </button>
        </div>
      </div>
    </div>
  )
}