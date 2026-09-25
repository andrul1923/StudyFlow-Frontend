import { useEffect, useState } from 'react'
import { api } from '../api'
import { Alert, Modal, RoleBadge, fmtDate } from './ui'

export default function MembersPanel({ projectId, members, isAdmin, currentUser, onChange }) {
  const [err, setErr] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const changeRole = async (m, role) => {
    setErr(''); setBusyId(m.user.id)
    try { await api.changeRole(projectId, m.user.id, role); await onChange() }
    catch (ex) { setErr(ex.message) }
    finally { setBusyId(null) }
  }

  const remove = async (m) => {
    if (!confirm(`¿Quitar a ${m.user.username} del proyecto?`)) return
    setErr(''); setBusyId(m.user.id)
    try { await api.removeMember(projectId, m.user.id); await onChange() }
    catch (ex) { setErr(ex.message) }
    finally { setBusyId(null) }
  }

  return (
    <div>
      {isAdmin && <JoinRequests projectId={projectId} onApproved={onChange} />}
      <div className="panel-head">
        <h2>Miembros</h2>
        {isAdmin && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Agregar miembro</button>}
      </div>
      <Alert onClose={() => setErr('')}>{err}</Alert>
      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Se unió</th>{isAdmin && <th></th>}</tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>{m.user.username}{currentUser && m.user.id === currentUser.id && <span className="muted small"> (tú)</span>}</td>
                <td className="muted">{m.user.email}</td>
                <td><RoleBadge role={m.role} /></td>
                <td className="muted small">{fmtDate(m.joined_at)}</td>
                {isAdmin && (
                  <td className="row-actions">
                    {m.role === 'MEMBER' ? (
                      <button className="btn btn-mini" disabled={busyId === m.user.id} onClick={() => changeRole(m, 'ADMIN')}>Hacer admin</button>
                    ) : (
                      <button className="btn btn-mini" disabled={busyId === m.user.id} onClick={() => changeRole(m, 'MEMBER')}>Quitar admin</button>
                    )}
                    <button className="btn btn-mini btn-danger" disabled={busyId === m.user.id} onClick={() => remove(m)}>Quitar</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showAdd && (
        <AddMemberModal
          projectId={projectId}
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); onChange() }}
        />
      )}
    </div>
  )
}

function AddMemberModal({ projectId, onClose, onAdded }) {
  const [email, setEmail] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try { await api.addMember(projectId, email); onAdded() }
    catch (ex) { setErr(ex.message); setBusy(false) }
  }

  return (
    <Modal title="Agregar miembro" onClose={onClose}>
      <Alert onClose={() => setErr('')}>{err}</Alert>
      <form onSubmit={submit}>
        <label>Email del usuario
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
        </label>
        <p className="muted small">Se agrega con rol Miembro. Puedes promoverlo a admin después.</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Agregando…' : 'Agregar'}</button>
        </div>
      </form>
    </Modal>
  )
}

// Solicitudes pendientes de unión, visible solo para ADMIN. Aprobar crea el
// ProjectMember en el backend; por eso también refresca la lista de miembros.
function JoinRequests({ projectId, onApproved }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true); setErr('')
    try {
      const all = await api.listJoinRequests(projectId)
      setRequests(all.filter((r) => r.status === 'PENDING'))
    } catch (ex) { setErr(ex.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [projectId])

  const review = async (r, decision) => {
    setErr(''); setBusyId(r.id)
    try {
      await api.reviewJoinRequest(projectId, r.id, decision)
      setRequests((rs) => rs.filter((x) => x.id !== r.id))
      if (decision === 'APPROVED') await onApproved()
    } catch (ex) { setErr(ex.message) }
    finally { setBusyId(null) }
  }

  if (loading || requests.length === 0) return null

  return (
    <div className="join-requests">
      <h2>Solicitudes pendientes</h2>
      <Alert onClose={() => setErr('')}>{err}</Alert>
      <div className="card">
        <table className="table">
          <thead><tr><th>Usuario</th><th>Email</th><th>Solicitado</th><th></th></tr></thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.user.username}</td>
                <td className="muted">{r.user.email}</td>
                <td className="muted small">{fmtDate(r.created_at)}</td>
                <td className="row-actions">
                  <button className="btn btn-mini btn-primary" disabled={busyId === r.id} onClick={() => review(r, 'APPROVED')}>Aprobar</button>
                  <button className="btn btn-mini btn-danger" disabled={busyId === r.id} onClick={() => review(r, 'REJECTED')}>Rechazar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
