import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LobbyPage from './pages/LobbyPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './components/AppLayout'
import CreateQuizPage from './pages/CreateQuizPage'
import MyQuizzesPage from './pages/MyQuizzesPage'
import EditQuizQuestionsPage from './pages/EditQuizQuestionsPage'
import MySessionsPage from './pages/MySessionsPage'
import QuizTakingPage from './pages/QuizTakingPage'
import ParticipationHistoryPage from './pages/ParticipationHistoryPage'
import QuizResultPage from './pages/QuizResultPage'
import { NotificationProvider } from './context/NotificationContext'
import { ConfirmationProvider } from './context/ConfirmationContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ConfirmationProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <RedirectIfAuthed>
                  <LoginPage />
                </RedirectIfAuthed>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/lobby"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LobbyPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/new"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CreateQuizPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/mine"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MyQuizzesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quizzes/:id/edit"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <EditQuizQuestionsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/sessions"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MySessionsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/take/:lobbyId"
              element={
                <ProtectedRoute>
                  <QuizTakingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ParticipationHistoryPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quiz/results/:participationId"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuizResultPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ConfirmationProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}