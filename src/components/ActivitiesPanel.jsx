import { useEffect, useState } from 'react'
import { api } from '../api'
import { Alert, Spinner, fmtDate } from './ui'

const ICONS = {
  PROJECT_CREATED: '📁', PROJECT_UPDATED: '✏️', PROJECT_ARCHIVED: '📦',
  MEMBER_ADDED: '➕', MEMBER_ROLE_CHANGED: '🔑', MEMBER_REMOVED: '➖',
  TASK_CREATED: '📌', TASK_UPDATED: '🔄', TASK_ARCHIVED: '🗃️',
  COMMENT_CREATED: '💬', COMMENT_UPDATED: '📝', COMMENT_DELETED: '🗑️',
}

export default function ActivitiesPanel({ projectId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    (async () => {
      setLoading(true); setErr('')
      try { setItems(await api.listActivities(projectId)) }
      catch (ex) { setErr(ex.message) }
      finally { setLoading(false) }
    })()
  }, [projectId])

  if (loading) return <Spinner />
  return (
    <div>
      <div className="panel-head"><h2>Historial de actividad</h2></div>
      <Alert onClose={() => setErr('')}>{err}</Alert>
      {items.length === 0 ? (
        <div className="empty">Todavía no hay actividad en este proyecto.</div>
      ) : (
        <ul className="timeline">
          {items.map((a) => (
            <li key={a.id} className="tl-item">
              <span className="tl-icon">{ICONS[a.action] || '•'}</span>
              <div className="tl-body">
                <span className="tl-desc">{a.description}</span>
                <span className="muted small">
                  {a.actor ? a.actor.username : 'Usuario eliminado'} · {fmtDate(a.created_at)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
