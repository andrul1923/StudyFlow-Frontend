import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { IconHome, IconFolder, IconClipboard, IconSearch, IconUser, IconChevronDown, IconLogOut } from './ui'

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
        <NavLink to="/search" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
          <IconSearch size={18} /> Buscar proyectos
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}>
          <IconUser size={18} /> Mi perfil
        </NavLink>
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
