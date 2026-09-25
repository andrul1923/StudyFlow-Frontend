import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Alert, Modal, Spinner, StatusBadge, PriorityBadge, fmtDay, fmtDate } from '../components/ui'

export default function TaskDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()
  const [task, setTask] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [showEdit, setShowEdit] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setErr('')
    try {
      const t = await api.getTask(id)
      setTask(t)
      try { setMembers(await api.listMembers(t.project)) } catch { /* ignore */ }
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const archive = async () => {
    if (!confirm('¿Archivar esta tarea? Dejará de aparecer en el listado.')) return
    try { await api.archiveTask(id); await load() }
    catch (ex) { setErr(ex.message) }
  }

  if (loading) return <Spinner />
  if (!task) return (
    <div>
      <Alert>{err || 'No se encontró la tarea.'}</Alert>
      <Link to="/" className="btn btn-ghost">← Volver</Link>
    </div>
  )

  const archived = task.status === 'ARCHIVED'

  return (
    <div>
      <Link to={`/projects/${task.project}`} className="back-link">← Volver al proyecto</Link>
      <div className="page-head">
        <div>
          <div className="title-row">
            <h1>{task.title}</h1>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          <p className="muted">{task.description || 'Sin descripción'}</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-ghost" onClick={() => setShowEdit(true)}>Editar</button>
          {!archived && <button className="btn btn-danger" onClick={archive}>Archivar</button>}
        </div>
      </div>

      <Alert onClose={() => setErr('')}>{err}</Alert>

      <div className="card meta-grid">
        <div><span className="muted small">Asignada a</span><div>{task.assigned_to ? task.assigned_to.username : 'Sin asignar'}</div></div>
        <div><span className="muted small">Creada por</span><div>{task.created_by ? task.created_by.username : '—'}</div></div>
        <div><span className="muted small">Fecha límite</span><div>{fmtDay(task.deadline)}</div></div>
        <div><span className="muted small">Actualizada</span><div>{fmtDate(task.updated_at)}</div></div>
      </div>

      <Comments taskId={id} archived={archived} currentUser={user} />

      {showEdit && (
        <EditTaskModal
          task={task}
          members={members}
          onClose={() => setShowEdit(false)}
          onSaved={(t) => { setTask(t); setShowEdit(false) }}
        />
      )}
    </div>
  )
}

function EditTaskModal({ task, members, onClose, onSaved }) {
  const archived = task.status === 'ARCHIVED'
  const [form, setForm] = useState({
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'TODO',
    priority: task.priority || 'MEDIUM',
    deadline: task.deadline || '',
    assigned_to: task.assigned_to ? String(task.assigned_to.id) : '',
  })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        deadline: form.deadline || null,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      }
      // Una tarea archivada no se puede reactivar: no mandamos status en ese caso.
      if (!archived) payload.status = form.status
      const updated = await api.updateTask(task.id, payload)
      onSaved(updated)
    } catch (ex) { setErr(ex.message); setBusy(false) }
  }

  return (
    <Modal title="Editar tarea" onClose={onClose}>
      <Alert onClose={() => setErr('')}>{err}</Alert>
      {archived && <p className="muted small">Esta tarea está archivada: puedes editar sus datos, pero no reactivar su estado.</p>}
      <form onSubmit={submit}>
        <label>Título
          <input value={form.title} onChange={set('title')} required />
        </label>
        <label>Descripción
          <textarea value={form.description} onChange={set('description')} rows={3} />
        </label>
        <div className="row2">
          <label>Estado
            <select value={form.status} onChange={set('status')} disabled={archived}>
              <option value="TODO">Por hacer</option>
              <option value="IN_PROGRESS">En progreso</option>
              <option value="DONE">Hecho</option>
              {archived && <option value="ARCHIVED">Archivado</option>}
            </select>
          </label>
          <label>Prioridad
            <select value={form.priority} onChange={set('priority')}>
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
            </select>
          </label>
        </div>
        <div className="row2">
          <label>Fecha límite
            <input type="date" value={form.deadline || ''} onChange={set('deadline')} />
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
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  )
}

function Comments({ taskId, archived, currentUser }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editText, setEditText] = useState('')

  const reload = async () => {
    setLoading(true); setErr('')
    try { setItems(await api.listComments(taskId)) }
    catch (ex) { setErr(ex.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { reload() }, [taskId])

  const add = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setBusy(true); setErr('')
    try { await api.createComment(taskId, content); setContent(''); await reload() }
    catch (ex) { setErr(ex.message) }
    finally { setBusy(false) }
  }

  const saveEdit = async (c) => {
    setErr('')
    try { await api.updateComment(c.id, editText); setEditing(null); await reload() }
    catch (ex) { setErr(ex.message) }
  }

  const del = async (c) => {
    if (!confirm('¿Eliminar este comentario?')) return
    setErr('')
    try { await api.deleteComment(c.id); await reload() }
    catch (ex) { setErr(ex.message) }
  }

  return (
    <div className="comments">
      <h2>Comentarios</h2>
      <Alert onClose={() => setErr('')}>{err}</Alert>
      {loading ? <Spinner /> : items.length === 0 ? (
        <div className="empty">Todavía no hay comentarios.</div>
      ) : (
        <ul className="comment-list">
          {items.map((c) => {
            const mine = currentUser && c.author && c.author.id === currentUser.id
            return (
              <li key={c.id} className="card comment">
                <div className="comment-head">
                  <strong>{c.author ? c.author.username : '—'}</strong>
                  <span className="muted small">{fmtDate(c.created_at)}{new Date(c.updated_at) - new Date(c.created_at) > 1000 && ' (editado)'}</span>
                </div>
                {editing === c.id ? (
                  <div className="comment-edit">
                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} />
                    <div className="modal-actions">
                      <button className="btn btn-mini btn-ghost" onClick={() => setEditing(null)}>Cancelar</button>
                      <button className="btn btn-mini btn-primary" onClick={() => saveEdit(c)}>Guardar</button>
                    </div>
                  </div>
                ) : (
                  <p className="comment-body">{c.content}</p>
                )}
                {mine && editing !== c.id && (
                  <div className="row-actions">
                    <button className="btn btn-mini" onClick={() => { setEditing(c.id); setEditText(c.content) }}>Editar</button>
                    <button className="btn btn-mini btn-danger" onClick={() => del(c)}>Eliminar</button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {archived ? (
        <p className="muted small">La tarea está archivada: no se pueden agregar comentarios nuevos.</p>
      ) : (
        <form className="comment-form" onSubmit={add}>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} placeholder="Escribe un comentario…" />
          <button className="btn btn-primary" disabled={busy || !content.trim()}>{busy ? 'Enviando…' : 'Comentar'}</button>
        </form>
      )}
    </div>
  )
}
