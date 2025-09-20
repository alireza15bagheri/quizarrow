import { useNotifier } from '../context/NotificationContext'

function Notification({ notification, onRemove }) {
  const { id, message, type } = notification
  const typeClasses = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
  }

  return (
    <div
      className={`alert ${typeClasses[type] || 'alert-info'} shadow-lg animate-fade-in-right`}
    >
      <div>
        <span>{message}</span>
      </div>
      <div className="flex-none">
        <button
          onClick={() => onRemove(id)}
          className="btn btn-sm btn-ghost"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotifier()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="toast toast-bottom toast-start z-[100]">
      {notifications.map((n) => (
        <Notification
          key={n.id}
          notification={n}
          onRemove={removeNotification}
        />
      ))}
    </div>
  )
}