import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { ConfirmationProvider } from './context/ConfirmationContext'
import { WebSocketProvider } from './context/WebSocketContext'
import AppRoutes from './routing/AppRoutes'

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ConfirmationProvider>
          <WebSocketProvider>
            <AppRoutes />
          </WebSocketProvider>
        </ConfirmationProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}