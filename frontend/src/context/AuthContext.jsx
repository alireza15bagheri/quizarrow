import { createContext, useContext, useEffect, useState } from 'react'
import { ensureCsrf, login as apiLogin, logout as apiLogout, me } from '../lib/api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Prime CSRF and restore session on refresh
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await ensureCsrf()
        const u = await me()
        if (mounted && u) setUser(u)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const login = async (username, password) => {
    const res = await apiLogin(username, password)
    setUser(res.user)
    return res.user
  }

  const logout = async () => {
    await apiLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
