import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Alert, Modal, Spinner, StatusBadge, PriorityBadge, IconClipboard, fmtDay } from './ui'

const FILTERS = [
  { key: 'ALL', label: 'Todas' },
  { key: 'TODO', label: 'Pendientes', dot: '#ef4444' },
  { key: 'IN_PROGRESS', label: 'En progreso', dot: '#16a34a' },
  { key: 'DONE', label: 'Completadas', dot: '#eab308' },
  { key: 'ARCHIVED', label: 'Archivadas', dot: '#6d28d9' },
]

// Lista de tareas de un proyecto con filtros por estado. La usan tanto la
// pestaña "Tareas" dentro de un proyecto como la página global /tasks.
export default function TaskFilterList({ projectId, members }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [showNew, setShowNew] = useState(false)

  const load = async () => {
    setLoading(true); setErr('')
    try { setTasks(await api.listTasks(projectId, { includeArchived: true })) }
    catch (ex) { setErr(ex.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [projectId])

  const visible = filter === 'ALL' ? tasks : tasks.filter((t) => t.status === filter)

  return (
    <div>
      <div className="panel-head">
        <div className="task-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={filter === f.key ? 'chip chip-active' : 'chip'}
              onClick={() => setFilter(f.key)}
            >
              {f.dot && <span className="chip-dot" style={{ background: f.dot }} />}
              {f.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Nueva tarea</button>
      </div>
      <Alert onClose={() => setErr('')}>{err}</Alert>

      {loading ? <Spinner /> : visible.length === 0 ? (
        <div className="empty empty-lg">
          <IconClipboard size={40} className="empty-icon" />
          <p className="empty-title">
            {filter === 'ALL' ? 'No hay tareas activas en este proyecto.' : 'No hay tareas con este filtro.'}
          </p>
          <p className="muted small">Crea una nueva tarea o selecciona otro proyecto.</p>
        </div>
      ) : (
        <div className="task-list">
          {visible.map((t) => (
            <Link key={t.id} to={`/tasks/${t.id}`} className="card task-row">
              <div className="task-main">
                <span className="task-title">{t.title}</span>
                {t.description && <span className="muted clamp small">{t.description}</span>}
              </div>
              <div className="task-meta">
                <PriorityBadge priority={t.priority} />
                <StatusBadge status={t.status} />
                <span className="muted small">{t.assigned_to ? t.assigned_to.username : 'Sin asignar'}</span>
                <span className="muted small">{fmtDay(t.deadline)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showNew && (
        <NewTaskModal
          projectId={projectId}
          members={members}
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); load() }}
        />
      )}
    </div>
  )
}

function NewTaskModal({ projectId, members, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', deadline: '', assigned_to: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      const payload = { title: form.title, priority: form.priority, status: form.status }
      if (form.description) payload.description = form.description
      if (form.deadline) payload.deadline = form.deadline
      if (form.assigned_to) payload.assigned_to = Number(form.assigned_to)
      await api.createTask(projectId, payload)
      onCreated()
    } catch (ex) { setErr(ex.message); setBusy(false) }
  }

  return (
    <Modal title="Nueva tarea" onClose={onClose}>
      <Alert onClose={() => setErr('')}>{err}</Alert>
      <form onSubmit={submit}>
        <label>Título
          <input value={form.title} onChange={set('title')} autoFocus required />
        </label>
        <label>Descripción
          <textarea value={form.description} onChange={set('description')} rows={3} />
        </label>
        <div className="row2">
          <label>Prioridad
            <select value={form.priority} onChange={set('priority')}>
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
            </select>
          </label>
          <label>Estado
            <select value={form.status} onChange={set('status')}>
              <option value="TODO">Por hacer</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="DONE">Hecho</option>
            </select>
          </label>
        </div>
        <div className="row2">
          <label>Fecha límite
            <input type="date" value={form.deadline} onChange={set('deadline')} />
          </label>
          <label>Asignar a
            <select value={form.assigned_to} onChange={set('assigned_to')}>
              <option value="">Sin asignar</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.username}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Creando…' : 'Crear'}</button>
        </div>
      </form>
    </Modal>
  )
}
