import { CARD_COLORS } from '../constants/cardColors'
import { api } from './apiClient'

/**
 * Toma programada para el dispensador (la genera el backend a partir de las
 * asignaciones activas cuya pastilla está en un compartimento).
 *
 * @typedef {object} DispenserTask
 * @property {string} id
 * @property {string | null} patientId
 * @property {string | null} patientName null si el paciente ya no existe.
 * @property {keyof typeof CARD_COLORS | null} card
 * @property {string | null} medicationId
 * @property {string} medication
 * @property {string} dose "850 mg"
 * @property {number} compartmentId Motor que gira (1–6).
 * @property {number} quantity Pastillas por toma.
 * @property {'pending' | 'completed' | 'missed'} status
 * @property {number} scheduledAt Timestamp (ms).
 * @property {number | null} dispensedAt Timestamp (ms).
 */

/** Tarea de Mongo (con paciente y pastilla populados) → DispenserTask. */
export function fromApi(row) {
  const patient = row.pacienteId && typeof row.pacienteId === 'object' ? row.pacienteId : null
  const pill = row.pastillaId && typeof row.pastillaId === 'object' ? row.pastillaId : null
  const card = patient?.colorTarjeta?.toLowerCase()
  return {
    id: String(row._id),
    patientId: patient ? String(patient._id) : null,
    patientName: patient?.nombre ?? null,
    card: CARD_COLORS[card] ? card : null,
    medicationId: pill ? String(pill._id) : null,
    medication: pill?.nombre ?? 'Medicamento eliminado',
    dose: pill?.dosis ?? '',
    compartmentId: row.slotMotor,
    quantity: row.cantidad ?? 1,
    status: row.status,
    scheduledAt: new Date(row.scheduledTime).getTime(),
    dispensedAt: row.dispensedAt ? new Date(row.dispensedAt).getTime() : null,
  }
}

export function list() {
  return api.get('/tasks')
}

/**
 * Tomas programadas entre dos fechas (por hora programada).
 *
 * @param {Date} from
 * @param {Date} to
 * @returns {Promise<DispenserTask[]>}
 */
export async function listBetween(from, to) {
  const query = new URLSearchParams({ desde: from.toISOString(), hasta: to.toISOString() })
  const data = await api.get(`/tasks?${query}`)
  return Array.isArray(data) ? data.map(fromApi) : []
}

/** @returns {Promise<{ lastSeenAt: number | null }>} Última vez que el Arduino pidió una tarea. */
export async function dispenserStatus() {
  const data = await api.get('/tasks/estado')
  return { lastSeenAt: data?.ultimaConexion ? new Date(data.ultimaConexion).getTime() : null }
}

export function create(payload) {
  return api.post('/tasks', payload)
}

export function next() {
  return api.get('/tasks/next')
}
