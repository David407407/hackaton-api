const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const TOKEN_KEY = 'token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(method, path, body) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    setToken(null)
    if (path !== '/auth/login') {
      window.location.assign('/')
    }
    const payload = await readBody(res)
    throw new Error(payload?.error || 'No autorizado')
  }

  const data = await readBody(res)
  if (!res.ok) {
    const error = new Error(data?.error || 'No se pudo completar la solicitud')
    // { campo: 'mensaje' } para que useForm pinte el error bajo su campo.
    if (data?.fields) error.fields = data.fields
    // Pacientes que bloquean un borrado (409 "en uso").
    if (data?.patientIds) error.patientIds = data.patientIds
    throw error
  }
  return data
}

async function readBody(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}
