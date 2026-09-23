import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Alert } from '../components/ui'

export default function Register() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      await api.register(form)
      // La API de registro no devuelve tokens: iniciamos sesión a continuación.
      await login(form.username, form.password)
      nav('/')
    } catch (ex) {
      setErr(ex.message || 'No se pudo crear la cuenta.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <h1>Crear cuenta</h1>
        <Alert onClose={() => setErr('')}>{err}</Alert>
        <form onSubmit={submit}>
          <label>Usuario
            <input value={form.username} onChange={set('username')} autoFocus required />
          </label>
          <label>Email
            <input type="email" value={form.email} onChange={set('email')} required />
          </label>
          <label>Contraseña
            <input type="password" value={form.password} onChange={set('password')} required />
          </label>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Creando…' : 'Registrarme'}</button>
        </form>
        <p className="muted small">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  )
}
