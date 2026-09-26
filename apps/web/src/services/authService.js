import { api, setToken } from './apiClient'

/**
 * @typedef {object} Credentials
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {object} Session
 * @property {string} [token]
 * @property {{ email: string }} user
 */

/**
 * @param {Credentials} credentials
 * @returns {Promise<Session>}
 */
export async function login(credentials) {
  const data = await api.post('/auth/login', credentials)
  if (data?.token) setToken(data.token)
  return data
}

export function logout() {
  setToken(null)
}
