import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './api'

const Ctx = createContext(null)
const EMPTY = { total: 0, projects: {}, items: [] }
const POLL_MS = 30000

// Novedades sin leer (ver GET /api/notifications/). Se refrescan cada 30 s
// mientras la pestaña está visible, y al volver a ella.
export function NotificationProvider({ children }) {
  const [data, setData] = useState(EMPTY)

  const refresh = useCallback(async () => {
    try { setData(await api.getNotifications()) } catch { /* sin red / sesión expirada: se ignora */ }
  }, [])

  useEffect(() => {
    refresh()
    const tick = () => { if (!document.hidden) refresh() }
    const timer = setInterval(tick, POLL_MS)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick) }
  }, [refresh])

  const markSeen = useCallback(async (projectId, section) => {
    try { await api.markSeen(projectId, section); await refresh() } catch { /* se reintenta en el próximo ciclo */ }
  }, [refresh])

  return <Ctx.Provider value={{ data, refresh, markSeen }}>{children}</Ctx.Provider>
}

export function useNotifications() {
  return useContext(Ctx)
}
