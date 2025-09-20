import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import * as authApi from '../lib/api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Prime CSRF and restore session on refresh
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await authApi.ensureCsrf()
        const u = await authApi.me()
        if (mounted && u) setUser(u)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (username, password) => {
    const user = await authApi.login(username, password)
    setUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout
  }), [user, loading, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}