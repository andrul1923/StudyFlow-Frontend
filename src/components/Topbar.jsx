import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconSearch, IconBell, IconSun, IconMoon, fmtAgo } from './ui'
import { useTheme } from '../theme'
import { useNotifications } from '../notifications'

export default function Topbar({ search, onSearchChange, searchPlaceholder = 'Buscar…' }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <div className="topbar2">
      <div className="topbar2-search">
        <IconSearch size={16} />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
        />
      </div>
      <div className="topbar2-actions">
        <NotificationBell />
        <button
          className="icon-btn"
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <IconMoon size={18} /> : <IconSun size={18} />}
        </button>
      </div>
    </div>
  )
}

function NotificationBell() {
  const { data } = useNotifications()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const go = (item) => {
    setOpen(false)
    nav(`/projects/${item.project_id}?tab=${item.section}`)
  }

  return (
    <div className="notif" ref={ref}>
      <button className="icon-btn" title="Novedades" onClick={() => setOpen((v) => !v)}>
        <IconBell size={18} />
        {data.total > 0 && <span className="notif-badge">{data.total > 9 ? '9+' : data.total}</span>}
      </button>
      {open && (
        <div className="notif-menu">
          <div className="notif-head">Novedades</div>
          {data.items.length === 0 ? (
            <div className="notif-empty muted small">No tienes novedades sin leer.</div>
          ) : (
            <ul className="notif-list">
              {data.items.map((it) => (
                <li key={it.id}>
                  <button className="notif-item" onClick={() => go(it)}>
                    <span className="dot-new" />
                    <span className="notif-body">
                      <span className="notif-text">
                        <strong>{it.actor || 'Alguien'}</strong> · {it.description}
                      </span>
                      <span className="muted small">{it.project_name} · {fmtAgo(it.created_at)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
