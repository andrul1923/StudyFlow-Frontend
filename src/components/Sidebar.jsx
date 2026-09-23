import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { IconHome, IconFolder, IconClipboard, IconUsers, IconActivity, IconChevronDown, IconLogOut } from './ui'

// Ítems sin página propia todavía (viven como tabs dentro de un proyecto).
// Se muestran para reflejar el diseño, pero no navegan a nada por ahora.
const SOON = [
  { label: 'Miembros', icon: IconUsers },
  { label: 'Actividad', icon: IconActivity },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [openMenu, setOpenMenu] = useState(false)

  return (
    <aside className="sidebar">
      <NavLink to="/" className="sidebar-brand">
        <span className="sidebar-logo">📘</span>
        StudyFlow
      </NavLink>

      <nav className="sidebar-nav">
        <NavLink to="/" end className="sidebar-item">
          <IconHome size={18} /> Inicio
        </NavLink>
        <NavLink to="/" end className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
          <IconFolder size={18} /> Proyectos
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
          <IconClipboard size={18} /> Tareas
        </NavLink>
        {SOON.map(({ label, icon: I }) => (
          <span key={label} className="sidebar-item disabled" title="Próximamente">
            <I size={18} /> {label}
          </span>
        ))}
      </nav>

      <div className="sidebar-user">
        <button className="sidebar-user-btn" onClick={() => setOpenMenu((v) => !v)}>
          <span className="avatar">{(user?.username || '?')[0].toUpperCase()}</span>
          <span className="sidebar-user-name">{user?.username}</span>
          <IconChevronDown size={16} />
        </button>
        {openMenu && (
          <div className="sidebar-user-menu">
            <button className="sidebar-user-menu-item" onClick={() => { logout(); nav('/login') }}>
              <IconLogOut size={16} /> Salir
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
