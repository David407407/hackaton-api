import { DAILY } from '../constants/schedule'
import { normalizeAssignment } from '../validation/assignment'
import { api } from './apiClient'

/** Campo del backend → campo del formulario, para los errores con `fields`. */
const FIELD_FROM_API = {
  pastillaId: 'medicationId',
  cantidad: 'quantity',
  horas: 'times',
  dias: 'days',
  fechaInicio: 'startDate',
  fechaFin: 'endDate',
  indicaciones: 'instructions',
}

/**
 * Asignación de Mongo → Assignment (shape que usan AssignmentList y el formulario).
 *
 * @returns {import('./assignmentsService').Assignment}
 */
export function fromApi(row) {
  return {
    id: String(row._id),
    patientId: String(row.pacienteId),
    medicationId: String(row.pastillaId),
    quantity: row.cantidad,
    times: row.horas,
    days: row.frecuencia === 'dias_especificos' ? row.dias : DAILY,
    startDate: row.fechaInicio,
    endDate: row.fechaFin ?? null,
    instructions: row.indicaciones ?? '',
    active: row.activa,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

/** Valores de AssignmentFormModal → body de POST/PUT /api/assignments. */
export function toApi(values) {
  const { patientId, medicationId, quantity, times, days, startDate, endDate, instructions, active } =
    normalizeAssignment(values)
  return {
    pacienteId: patientId,
    pastillaId: medicationId,
    cantidad: quantity,
    horas: times,
    frecuencia: days === DAILY ? 'diaria' : 'dias_especificos',
    dias: days === DAILY ? [] : days,
    fechaInicio: startDate,
    fechaFin: endDate,
    indicaciones: instructions,
    activa: active,
  }
}

async function withFormErrors(request) {
  try {
    return await request()
  } catch (error) {
    if (error?.fields) {
      error.fields = Object.fromEntries(
        Object.entries(error.fields).map(([field, message]) => [FIELD_FROM_API[field] ?? field, message]),
      )
    }
    throw error
  }
}

/** @returns {Promise<import('./assignmentsService').Assignment[]>} */
export async function list() {
  const data = await api.get('/assignments')
  return Array.isArray(data) ? data.map(fromApi) : []
}

export function create(values) {
  return withFormErrors(async () => fromApi((await api.post('/assignments', toApi(values))).assignment))
}

export function update(id, values) {
  return withFormErrors(async () => fromApi((await api.put(`/assignments/${id}`, toApi(values))).assignment))
}

/** Activa o pausa una asignación. */
export function setActive(assignment, active) {
  return update(assignment.id, { ...assignment, active })
}

/** @returns {Promise<import('./assignmentsService').Assignment>} La asignación borrada. */
export async function remove(id) {
  const data = await api.delete(`/assignments/${id}`)
  return fromApi(data.assignment)
}

/** Deshace `remove`. La API no reusa ids, así que la vuelve a crear (con otro id). */
export function restore(assignment) {
  return create(assignment)
}
