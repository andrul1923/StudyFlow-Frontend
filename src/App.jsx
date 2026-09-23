import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth'
import { Spinner } from './components/ui'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppShell() {
  const [search, setSearch] = useState('')
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-col">
        <Topbar search={search} onSearchChange={setSearch} searchPlaceholder="Buscar proyectos…" />
        <main className="container">
          <Routes>
            <Route path="/" element={<Projects search={search} />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/:id" element={<TaskDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user && !loading ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user && !loading ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/*" element={<Protected><AppShell /></Protected>} />
    </Routes>
  )
}
