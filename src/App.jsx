import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { useAuth } from './auth'
import { Spinner } from './components/ui'
import Login from './pages/Login'
import Register from './pages/Register'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import TaskDetail from './pages/TaskDetail'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function Header() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  if (!user) return null
  return (
    <header className="topbar">
      <Link to="/" className="brand">StudyFlow</Link>
      <div className="topbar-right">
        <span className="who">{user.username}</span>
        <button className="btn btn-ghost" onClick={() => { logout(); nav('/login') }}>Salir</button>
      </div>
    </header>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  return (
    <div className="app">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/login" element={user && !loading ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user && !loading ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/" element={<Protected><Projects /></Protected>} />
          <Route path="/projects/:id" element={<Protected><ProjectDetail /></Protected>} />
          <Route path="/tasks/:id" element={<Protected><TaskDetail /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
