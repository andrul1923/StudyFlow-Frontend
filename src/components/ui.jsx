import { useEffect } from 'react'

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
