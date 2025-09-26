import SessionRow from './SessionRow'

export default function SessionsTable({ quizzes, publishingId, availables, onTogglePublish, onDateChange, onNavigateToEdit }) {
  return (
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
            <SessionRow
              key={quiz.id}
              quiz={quiz}
              isPublishing={publishingId === quiz.id}
              availableDate={availables[quiz.id]}
              onTogglePublish={onTogglePublish}
              onDateChange={onDateChange}
              onNavigateToEdit={onNavigateToEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}