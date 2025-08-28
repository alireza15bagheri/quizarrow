import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

let idCounter = 0

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const addNotification = useCallback(
    (message, type = 'info', duration = 5000) => {
      const id = idCounter++
      setNotifications((prev) => [...prev, { id, message, type }])
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    },
    [removeNotification]
  )

  const value = {
    addNotification,
    removeNotification,
    notifications,
  }

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

  return {
    notify: {
      success: (message, duration) =>
        ctx.addNotification(message, 'success', duration),
      error: (message, duration) =>
        ctx.addNotification(message, 'error', duration),
      info: (message, duration) =>
        ctx.addNotification(message, 'info', duration),
    },
    removeNotification: ctx.removeNotification,
    notifications: ctx.notifications,
  }
}