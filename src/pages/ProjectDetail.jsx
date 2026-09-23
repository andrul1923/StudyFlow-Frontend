import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Alert, Modal, Spinner, StatusBadge, fmtDay } from '../components/ui'
import TasksPanel from '../components/TasksPanel'
import MembersPanel from '../components/MembersPanel'
import ActivitiesPanel from '../components/ActivitiesPanel'

export default function ProjectDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [tab, setTab] = useState('tasks')
  const [showEdit, setShowEdit] = useState(false)

  const myRole = (() => {
    const m = members.find((mm) => mm.user && mm.user.id === (user && user.id))
    return m ? m.role : null
  })()
  const isAdmin = myRole === 'ADMIN'

  const loadMembers = useCallback(async () => {
    try { setMembers(await api.listMembers(id)) } catch { /* ignore */ }
  }, [id])

  const load = useCallback(async () => {
    setLoading(true); setErr('')
    try {
      setProject(await api.getProject(id))
      await loadMembers()
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setLoading(false)
    }
  }, [id, loadMembers])

  useEffect(() => { load() }, [load])

  const archive = async () => {
    if (!confirm('¿Archivar este proyecto? Dejará de aparecer en tu listado.')) return
    try {
      await api.archiveProject(id)
      nav('/')
    } catch (ex) {
      setErr(ex.message)
    }
  }

  if (loading) return <Spinner />
  if (!project) return (
    <div>
      <Alert>{err || 'No se encontró el proyecto.'}</Alert>
      <Link to="/" className="btn btn-ghost">← Volver</Link>
    </div>
  )

  return (
    <div>
      <Link to="/" className="back-link">← Mis proyectos</Link>
      <div className="page-head">
        <div>
          <div className="title-row">
            <h1>{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="muted">{project.description || 'Sin descripción'}</p>
          <p className="muted small">Fecha límite: {fmtDay(project.deadline)}</p>
        </div>
        {isAdmin && (
          <div className="head-actions">
            <button className="btn btn-ghost" onClick={() => setShowEdit(true)}>Editar</button>
            <button className="btn btn-danger" onClick={archive}>Archivar</button>
          </div>
        )}
      </div>

      <Alert onClose={() => setErr('')}>{err}</Alert>

      <div className="tabs">
        <button className={tab === 'tasks' ? 'tab active' : 'tab'} onClick={() => setTab('tasks')}>Tareas</button>
        <button className={tab === 'members' ? 'tab active' : 'tab'} onClick={() => setTab('members')}>Miembros</button>
        <button className={tab === 'activity' ? 'tab active' : 'tab'} onClick={() => setTab('activity')}>Actividad</button>
      </div>

      {tab === 'tasks' && <TasksPanel projectId={id} members={members} />}
      {tab === 'members' && <MembersPanel projectId={id} members={members} isAdmin={isAdmin} currentUser={user} onChange={loadMembers} />}
      {tab === 'activity' && <ActivitiesPanel projectId={id} />}

      {showEdit && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEdit(false)}
          onSaved={(p) => { setProject(p); setShowEdit(false) }}
        />
      )}
    </div>
  )
}

function EditProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'ACTIVE',
    deadline: project.deadline || '',
  })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        status: form.status,
        deadline: form.deadline || null,
      }
      const updated = await api.updateProject(project.id, payload)
      onSaved(updated)
    } catch (ex) {
      setErr(ex.message); setBusy(false)
    }
  }

  return (
    <Modal title="Editar proyecto" onClose={onClose}>
      <Alert onClose={() => setErr('')}>{err}</Alert>
      <form onSubmit={submit}>
        <label>Nombre
          <input value={form.name} onChange={set('name')} required />
        </label>
        <label>Descripción
          <textarea value={form.description} onChange={set('description')} rows={3} />
        </label>
        <label>Estado
          <select value={form.status} onChange={set('status')}>
            <option value="ACTIVE">Activo</option>
            <option value="COMPLETED">Completado</option>
            <option value="ARCHIVED">Archivado</option>
          </select>
        </label>
        <label>Fecha límite
          <input type="date" value={form.deadline || ''} onChange={set('deadline')} />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  )
}
