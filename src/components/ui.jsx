import { useEffect } from 'react'

// Íconos de línea (estilo Feather/Lucide), inline para no depender de una
// librería extra. Todos aceptan `size` y props de <svg> (className, etc).
function Icon({ size = 18, children, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {children}
    </svg>
  )
}
export const IconHome = (p) => <Icon {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></Icon>
export const IconFolder = (p) => <Icon {...p}><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" /></Icon>
export const IconClipboard = (p) => <Icon {...p}><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" /><path d="M9 11h6M9 15h6" /></Icon>
export const IconUsers = (p) => <Icon {...p}><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3-6 7-6s7 2.7 7 6" /><path d="M16 5.2a3 3 0 0 1 0 5.6" /><path d="M22 20c0-2.7-2-5-5-5.7" /></Icon>
export const IconActivity = (p) => <Icon {...p}><path d="M3 12h4l2 8 4-16 2 8h6" /></Icon>
export const IconSearch = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></Icon>
export const IconBell = (p) => <Icon {...p}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></Icon>
export const IconSun = (p) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>
export const IconArrowRight = (p) => <Icon {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Icon>
export const IconCalendar = (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></Icon>
export const IconChevronDown = (p) => <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>
export const IconLogOut = (p) => <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></Icon>

// Etiqueta de color para estados / roles / prioridades.
export function Badge({ children, kind }) {
  return <span className={`badge badge-${kind || 'default'}`}>{children}</span>
}

export function StatusBadge({ status }) {
  const map = {
    ACTIVE: 'green', COMPLETED: 'blue', ARCHIVED: 'gray',
    TODO: 'gray', IN_PROGRESS: 'amber', DONE: 'green',
  }
  const label = {
    ACTIVE: 'Activo', COMPLETED: 'Completado', ARCHIVED: 'Archivado',
    TODO: 'Por hacer', IN_PROGRESS: 'En progreso', DONE: 'Hecho',
  }
  return <Badge kind={map[status] || 'default'}>{label[status] || status}</Badge>
}

export function PriorityBadge({ priority }) {
  const map = { LOW: 'gray', MEDIUM: 'amber', HIGH: 'red' }
  const label = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta' }
  return <Badge kind={map[priority] || 'default'}>{label[priority] || priority}</Badge>
}

export function RoleBadge({ role }) {
  return <Badge kind={role === 'ADMIN' ? 'purple' : 'gray'}>{role === 'ADMIN' ? 'Admin' : 'Miembro'}</Badge>
}

// Mensaje de error / éxito.
export function Alert({ type = 'error', children, onClose }) {
  if (!children) return null
  return (
    <div className={`alert alert-${type}`}>
      <span>{children}</span>
      {onClose && <button className="alert-x" onClick={onClose}>×</button>}
    </div>
  )
}

// Modal simple centrado.
export function Modal({ title, children, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function Spinner({ label = 'Cargando…' }) {
  return <div className="spinner">{label}</div>
}

export function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d)) return iso
  return d.toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })
}

export function fmtDay(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d)) return iso
  return d.toLocaleDateString('es', { dateStyle: 'medium' })
}
