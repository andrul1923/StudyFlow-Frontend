import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Spinner, IconClipboard } from '../components/ui'
import TaskFilterList from '../components/TaskFilterList'

const LAST_PROJECT_KEY = 'sf_last_project'

export default function Tasks() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [projectId, setProjectId] = useState(() => localStorage.getItem(LAST_PROJECT_KEY) || '')
  const [members, setMembers] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const list = await api.listProjects()
        setProjects(list)
        setProjectId((current) => (current && list.some((p) => p.id === current)) ? current : (list[0]?.id || ''))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!projectId) { setMembers([]); return }
    localStorage.setItem(LAST_PROJECT_KEY, projectId)
    api.listMembers(projectId).then(setMembers).catch(() => setMembers([]))
  }, [projectId])

  return (
    <div>
      <div className="page-head">
        <div className="title-row">
          <span className="page-icon"><IconClipboard size={22} /></span>
          <div>
            <h1>Tareas</h1>
            <p className="muted small">Gestiona y da seguimiento a las tareas de tus proyectos.</p>
          </div>
        </div>
      </div>

      {loading ? <Spinner /> : projects.length === 0 ? (
        <div className="empty">Aún no tienes proyectos. <Link to="/">Crea uno</Link> para empezar a agregar tareas.</div>
      ) : (
        <>
          <label className="project-picker">
            Proyecto
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          {projectId && <TaskFilterList projectId={projectId} members={members} />}
        </>
      )}
    </div>
  )
}
