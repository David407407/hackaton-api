import { api } from './apiClient'

export function list() {
  return api.get('/tasks')
}

export function create(payload) {
  return api.post('/tasks', payload)
}

export function next() {
  return api.get('/tasks/next')
}
