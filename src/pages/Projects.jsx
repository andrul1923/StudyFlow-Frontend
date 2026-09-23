import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import {
  Alert, Modal, Spinner, StatusBadge, fmtDay,
  IconFolder, IconCalendar, IconClipboard, IconUsers, IconArrowRight,
} from '../components/ui'

export default function Projects({ search = '' }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [showNew, setShowNew] = useState(false)

  const load = async () => {
    setLoading(true); setErr('')
    try {
      setProjects(await api.listProjects())
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const q = search.trim().toLowerCase()
  const visible = q ? projects.filter((p) => p.name.toLowerCase().includes(q)) : projects

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="title-row"><IconFolder size={22} /><h1>Mis proyectos</h1></div>
          <p className="muted small">Administra tus proyectos y accede a su información.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Nuevo proyecto</button>
      </div>
      <Alert onClose={() => setErr('')}>{err}</Alert>

      {loading ? <Spinner /> : visible.length === 0 ? (
        <div className="empty">{q ? 'Ningún proyecto coincide con la búsqueda.' : 'Aún no tienes proyectos. Crea el primero.'}</div>
      ) : (
        <div className="grid">
          {visible.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="card proj-card">
              <div className="proj-top">
                <div className="proj-title">
                  <span className="proj-icon"><IconFolder size={18} /></span>
                  <h3>{p.name}</h3>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <p className="muted clamp proj-desc">{p.description || 'Sin descripción'}</p>
              <div className="proj-date">
                <IconCalendar size={14} /> Fecha límite: {fmtDay(p.deadline)}
              </div>
              <div className="proj-foot">
                <div className="proj-stats">
                  <span className="proj-stat"><IconClipboard size={14} /> {p.tasks_count ?? 0} tareas</span>
                  <span className="proj-stat"><IconUsers size={14} /> {p.members_count ?? 0} miembro{p.members_count === 1 ? '' : 's'}</span>
                </div>
                <span className="proj-arrow"><IconArrowRight size={15} /></span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showNew && <NewProjectModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load() }} />}
    </div>
  )
}

function NewProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', deadline: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      const payload = { name: form.name }
      if (form.description) payload.description = form.description
      if (form.deadline) payload.deadline = form.deadline
      await api.createProject(payload)
      onCreated()
    } catch (ex) {
      setErr(ex.message); setBusy(false)
    }
  }

  return (
    <Modal title="Nuevo proyecto" onClose={onClose}>
      <Alert onClose={() => setErr('')}>{err}</Alert>
      <form onSubmit={submit}>
        <label>Nombre
          <input value={form.name} onChange={set('name')} autoFocus required />
        </label>
        <label>Descripción
          <textarea value={form.description} onChange={set('description')} rows={3} />
        </label>
        <label>Fecha límite
          <input type="date" value={form.deadline} onChange={set('deadline')} />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Creando…' : 'Crear'}</button>
        </div>
      </form>
    </Modal>
  )
}
