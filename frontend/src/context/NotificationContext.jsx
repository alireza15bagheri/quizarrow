import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react'

const NotificationContext = createContext(null)

let idCounter = 0

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const lastNotificationTimestampRef = useRef(0)

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const addNotification = useCallback(
    (message, type = 'info', duration = 5000) => {
      const configuredDelay = parseInt(localStorage.getItem('notification_delay_ms') || '0', 10);
      
      if (configuredDelay > 0) {
        const now = Date.now();
        const timeSinceLast = now - lastNotificationTimestampRef.current;
        if (timeSinceLast < configuredDelay) {
          return; // Suppress notification
        }
      }

      // If we are showing a notification, update the timestamp
      lastNotificationTimestampRef.current = Date.now();

      const id = idCounter++
      setNotifications((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    },
    [removeNotification]
  )

  // Memoize the context value to prevent unnecessary re-renders of consumers
  // that don't depend on the `notifications` array itself.
  const value = useMemo(() => ({
    addNotification,
    removeNotification,
    notifications,
  }), [addNotification, removeNotification, notifications]);
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifier() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifier must be used within a NotificationProvider')
  }

  // Memoize the `notify` object to ensure it is stable across re-renders.
  const notify = useMemo(() => ({
    success: (message, duration) =>
      ctx.addNotification(message, 'success', duration),
    error: (message, duration) =>
      ctx.addNotification(message, 'error', duration),
    info: (message, duration) =>
      ctx.addNotification(message, 'info', duration),
  }), [ctx.addNotification]);
  return {
    notify,
    removeNotification: ctx.removeNotification,
    notifications: ctx.notifications,
  }
}