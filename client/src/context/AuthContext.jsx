import { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount — verify stored token
  useEffect(() => {
    const token = localStorage.getItem('et_token')
    if (!token) { setLoading(false); return }

    getMe()
      .then(r => setUser(r.data))
      .catch(() => localStorage.removeItem('et_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('et_token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('et_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
