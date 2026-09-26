import { api } from './apiClient'

export function list() {
  return api.get('/pills')
}

export function create(payload) {
  return api.post('/pills', payload)
}

export function updateStock(id, stockActual) {
  return api.put(`/pills/${id}/stock`, { stockActual })
}

export function remove(id) {
  return api.delete(`/pills/${id}`)
}
