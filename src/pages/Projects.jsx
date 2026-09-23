import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Alert, Modal, Spinner, StatusBadge, fmtDay } from '../components/ui'

export default function Projects() {
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

  return (
    <div>
      <div className="page-head">
        <h1>Mis proyectos</h1>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Nuevo proyecto</button>
      </div>
      <Alert onClose={() => setErr('')}>{err}</Alert>

      {loading ? <Spinner /> : projects.length === 0 ? (
        <div className="empty">Aún no tienes proyectos. Crea el primero.</div>
      ) : (
        <div className="grid">
          {projects.map((p) => (
            <Link key={p.id} to={`/projects/${p.id}`} className="card proj-card">
              <div className="proj-top">
                <h3>{p.name}</h3>
                <StatusBadge status={p.status} />
              </div>
              <p className="muted clamp">{p.description || 'Sin descripción'}</p>
              <div className="proj-foot muted small">
                <span>Fecha límite: {fmtDay(p.deadline)}</span>
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
