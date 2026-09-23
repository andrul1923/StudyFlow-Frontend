import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, tokens, setOnAuthExpired } from './api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMe = useCallback(async () => {
    if (!tokens.access) { setUser(null); setLoading(false); return }
    try {
      const me = await api.me()
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Si el refresh expira definitivamente, cerramos sesión.
    setOnAuthExpired(() => setUser(null))
    loadMe()
  }, [loadMe])

  const login = async (username, password) => {
    const data = await api.login({ username, password })
    tokens.set({ access: data.access, refresh: data.refresh })
    const me = await api.me()
    setUser(me)
    return me
  }

  const logout = () => {
    tokens.clear()
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, logout, reload: loadMe }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}
