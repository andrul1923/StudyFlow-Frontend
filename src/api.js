// Cliente de la API de StudyFlow.
// Centraliza: base URL, header Authorization, refresco automático del access
// cuando expira, y normalización de los distintos formatos de error del backend.

// URL del backend: cada desarrollador la fija en su propio .env (VITE_API_BASE).
const BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

const TOKENS = { access: 'sf_access', refresh: 'sf_refresh' }

export const tokens = {
  get access() { return localStorage.getItem(TOKENS.access) },
  get refresh() { return localStorage.getItem(TOKENS.refresh) },
  set({ access, refresh }) {
    if (access) localStorage.setItem(TOKENS.access, access)
    if (refresh) localStorage.setItem(TOKENS.refresh, refresh)
  },
  clear() {
    localStorage.removeItem(TOKENS.access)
    localStorage.removeItem(TOKENS.refresh)
  },
}

// Error rico: guarda status y el cuerpo ya parseado para que la UI decida
// cómo mostrarlo (errores de campo vs. detail global).
export class ApiError extends Error {
  constructor(status, data) {
    super(data && data.detail ? data.detail : `HTTP ${status}`)
    this.status = status
    this.data = data || {}
  }
  // Devuelve un mensaje legible a partir de cualquier forma de error DRF.
  get message() {
    const d = this.data
    if (!d) return `HTTP ${this.status}`
    if (typeof d === 'string') return d
    if (d.detail) return d.detail
    // errores de validación por campo: { campo: ["msg", ...] }
    const parts = []
    for (const [k, v] of Object.entries(d)) {
      const val = Array.isArray(v) ? v.join(' ') : v
      parts.push(`${k}: ${val}`)
    }
    return parts.join(' • ') || `HTTP ${this.status}`
  }
}

// Notifica a la app cuando la sesión expiró de verdad (refresh inválido).
let onAuthExpired = () => {}
export function setOnAuthExpired(fn) { onAuthExpired = fn }

async function parse(res) {
  if (res.status === 204) return null
  const text = await res.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return text }
}

// Intenta renovar el access con el refresh guardado. Devuelve true si funcionó.
async function refreshAccess() {
  const refresh = tokens.refresh
  if (!refresh) return false
  const res = await fetch(`${BASE}/api/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!res.ok) return false
  const data = await parse(res)
  if (data && data.access) {
    tokens.set({ access: data.access })
    return true
  }
  return false
}

async function request(path, { method = 'GET', body, auth = true, _retry = false } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth && tokens.access) headers['Authorization'] = `Bearer ${tokens.access}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && auth && !_retry) {
    // Puede ser access expirado: intentamos refrescar una vez.
    const ok = await refreshAccess()
    if (ok) return request(path, { method, body, auth, _retry: true })
    // El refresh también falló -> sesión realmente expirada.
    tokens.clear()
    onAuthExpired()
    throw new ApiError(401, await parse(res))
  }

  const data = await parse(res)
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}

export const api = {
  // ---- Auth ----
  register: (payload) => request('/api/auth/register/', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/api/auth/login/', { method: 'POST', body: payload, auth: false }),
  me: () => request('/api/auth/me/'),

  // ---- Projects ----
  listProjects: () => request('/api/projects/'),
  createProject: (payload) => request('/api/projects/', { method: 'POST', body: payload }),
  getProject: (id) => request(`/api/projects/${id}/`),
  updateProject: (id, payload) => request(`/api/projects/${id}/`, { method: 'PATCH', body: payload }),
  archiveProject: (id) => request(`/api/projects/${id}/`, { method: 'DELETE' }),

  // ---- Members ----
  listMembers: (id) => request(`/api/projects/${id}/members/`),
  addMember: (id, email) => request(`/api/projects/${id}/members/`, { method: 'POST', body: { email } }),
  changeRole: (id, userId, role) => request(`/api/projects/${id}/members/${userId}/`, { method: 'PATCH', body: { role } }),
  removeMember: (id, userId) => request(`/api/projects/${id}/members/${userId}/`, { method: 'DELETE' }),

  // ---- Tasks ----
  listTasks: (projectId, { includeArchived = false } = {}) =>
    request(`/api/projects/${projectId}/tasks/${includeArchived ? '?include_archived=1' : ''}`),
  createTask: (projectId, payload) => request(`/api/projects/${projectId}/tasks/`, { method: 'POST', body: payload }),
  getTask: (id) => request(`/api/tasks/${id}/`),
  updateTask: (id, payload) => request(`/api/tasks/${id}/`, { method: 'PATCH', body: payload }),
  archiveTask: (id) => request(`/api/tasks/${id}/`, { method: 'DELETE' }),

  // ---- Comments ----
  listComments: (taskId) => request(`/api/tasks/${taskId}/comments/`),
  createComment: (taskId, content) => request(`/api/tasks/${taskId}/comments/`, { method: 'POST', body: { content } }),
  updateComment: (id, content) => request(`/api/comments/${id}/`, { method: 'PATCH', body: { content } }),
  deleteComment: (id) => request(`/api/comments/${id}/`, { method: 'DELETE' }),

  // ---- Activities ----
  listActivities: (projectId) => request(`/api/projects/${projectId}/activities/`),
}
