import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { Alert } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      await login(username, password)
      nav('/')
    } catch (ex) {
      setErr(ex.message || 'No se pudo iniciar sesión.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>StudyFlow</h1>
        <p className="muted">Inicia sesión para gestionar tus proyectos de estudio.</p>
        <Alert onClose={() => setErr('')}>{err}</Alert>
        <form onSubmit={submit}>
          <label>Usuario
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
          </label>
          <label>Contraseña
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        </form>
        <p className="muted small">¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
      </div>
    </div>
  )
}
