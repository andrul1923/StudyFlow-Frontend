import { useState } from 'react'
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
