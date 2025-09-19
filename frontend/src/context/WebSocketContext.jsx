import { createContext, useContext, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useNotifier } from './NotificationContext'

const WebSocketContext = createContext(null)

// Helper to construct WebSocket URL from browser location
function getWebSocketURL() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const { host } = window.location
  // Use the Vite proxy path
  return `${protocol}//${host}/ws/notifications/`
}


export function WebSocketProvider({ children }) {
  const { user, loading } = useAuth() // <-- Get loading state
  const { notify } = useNotifier()
  const socketRef = useRef(null)

  useEffect(() => {
    // Wait until the initial authentication check is complete
    if (loading) {
      return
    }

    if (!user) {
      // If user logs out or is not authenticated, ensure connection is closed
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
      return
    }

    // Connect only if there is a user, auth is loaded, and no existing connection
    if (user && !socketRef.current) {
      const url = getWebSocketURL()
      const ws = new WebSocket(url)
      socketRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'quiz.published') {
          const { title, publisher_username } = data.payload
          const message = `New quiz "${title}" by ${publisher_username} is available!`
          notify.info(message, 10000) // Show for 10 seconds
        }
      }

      ws.onclose = (event) => {
        // Don't log expected closures (e.g., logout)
        if (event.code !== 1000) {
            console.log('WebSocket disconnected. Attempting to reconnect...')
        }
        socketRef.current = null
        // Simple reconnection logic will be handled by this effect re-running
      }

      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
        ws.close() // This will trigger the onclose handler
      }
    }

    // Cleanup on component unmount or when user/loading state changes
    return () => {
      if (socketRef.current) {
        socketRef.current.close(1000, "Component unmounting")
        socketRef.current = null
      }
    }
  }, [user, loading, notify]) // <-- Re-run effect if user or loading state changes

  return (
    <WebSocketContext.Provider value={null}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  return useContext(WebSocketContext)
}