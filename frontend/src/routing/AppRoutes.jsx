import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import LobbyPage from '../pages/LobbyPage'
import AppLayout from '../components/AppLayout'
import CreateQuizPage from '../pages/CreateQuizPage'
import MyQuizzesPage from '../pages/MyQuizzesPage'
import EditQuizQuestionsPage from '../pages/EditQuizQuestionsPage'
import MySessionsPage from '../pages/MySessionsPage'
import QuizTakingPage from '../pages/QuizTakingPage'
import ParticipationHistoryPage from '../pages/ParticipationHistoryPage'
import QuizResultPage from '../pages/QuizResultPage'
import AdminPage from '../pages/AdminPage'
import SettingsPage from '../pages/SettingsPage'
import ChatroomsPage from '../pages/ChatroomsPage'
import ChatRoomPage from '../pages/ChatRoomPage'
import { ProtectedRoute, RedirectIfAuthed } from './RouteUtils'

export default function AppRoutes() {
  return (
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
          <ProtectedRoute allowedRoles={['host', 'admin']}>
            <AppLayout>
              <CreateQuizPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes/mine"
        element={
          <ProtectedRoute allowedRoles={['host', 'admin']}>
            <AppLayout>
              <MyQuizzesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['host', 'admin']}>
            <AppLayout>
              <EditQuizQuestionsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute allowedRoles={['host', 'admin']}>
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
        path="/chatrooms"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ChatroomsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chatrooms/:roomId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ChatRoomPage />
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
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
              <AdminPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}