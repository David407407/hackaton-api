import { CARD_COLORS } from '../constants/cardColors'
import { api } from './apiClient'

/** `colorTarjeta: "Azul"` → `card: "azul"` (keys de CARD_COLORS). */
function cardFromApi(colorTarjeta) {
  if (typeof colorTarjeta !== 'string') return undefined
  const key = colorTarjeta.toLowerCase()
  return CARD_COLORS[key] ? key : undefined
}

/** Shape de Mongo → shape que ya usa PatientCard / PatientGrid. */
export function fromApi(row) {
  if (!row) return row
  return {
    ...row,
    id: String(row._id ?? row.id ?? ''),
    name: row.nombre ?? row.name,
    age: row.edad ?? row.age,
    card: cardFromApi(row.colorTarjeta) ?? row.card,
    adherence: row.porcentajeAdherencia ?? row.adherence,
  }
}

export async function list() {
  const data = await api.get('/patients')
  return Array.isArray(data) ? data.map(fromApi) : []
}

export function create(payload) {
  return api.post('/patients', payload)
}

export function update(id, payload) {
  return api.put(`/patients/${id}`, payload)
}

export function remove(id) {
  return api.delete(`/patients/${id}`)
}
