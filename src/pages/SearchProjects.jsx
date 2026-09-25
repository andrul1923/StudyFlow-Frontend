import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Alert, Spinner, StatusBadge, IconSearch, IconFolder, IconUsers } from '../components/ui'

export default function SearchProjects() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = async (query) => {
    setLoading(true); setErr('')
    try { setResults(await api.searchProjects(query)) }
    catch (ex) { setErr(ex.message) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const t = setTimeout(() => load(q), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const requestJoin = async (project) => {
    setErr(''); setBusyId(project.id)
    try {
      await api.createJoinRequest(project.id)
      setResults((rs) => rs.map((r) => r.id === project.id ? { ...r, my_status: 'PENDING' } : r))
    } catch (ex) { setErr(ex.message) }
    finally { setBusyId(null) }
  }

  return (
    <div>
      <div className="page-head">
        <div className="title-row">
          <span className="page-icon"><IconSearch size={22} /></span>
          <div>
            <h1>Buscar proyectos</h1>
            <p className="muted small">Encuentra proyectos existentes y solicita unirte.</p>
          </div>
        </div>
      </div>

      <div className="topbar2-search search-page-input">
        <IconSearch size={16} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre…" autoFocus />
      </div>

      <Alert onClose={() => setErr('')}>{err}</Alert>

      {loading ? <Spinner /> : results.length === 0 ? (
        <div className="empty">No hay proyectos que coincidan con la búsqueda.</div>
      ) : (
        <div className="grid">
          {results.map((p) => (
            <div key={p.id} className="card proj-card">
              <div className="proj-top">
                <div className="proj-title">
                  <span className="proj-icon"><IconFolder size={18} /></span>
                  <h3>{p.name}</h3>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <p className="muted clamp proj-desc">{p.description || 'Sin descripción'}</p>
              <div className="proj-foot">
                <div className="proj-stats">
                  <span className="proj-stat"><IconUsers size={14} /> {p.members_count} miembro{p.members_count === 1 ? '' : 's'}</span>
                </div>
                {p.my_status === 'MEMBER' ? (
                  <Link to={`/projects/${p.id}`} className="btn btn-mini">Abrir</Link>
                ) : p.my_status === 'PENDING' ? (
                  <button className="btn btn-mini" disabled>Solicitud pendiente</button>
                ) : (
                  <button className="btn btn-mini btn-primary" disabled={busyId === p.id} onClick={() => requestJoin(p)}>
                    {busyId === p.id ? 'Enviando…' : 'Solicitar unirme'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
