import { MEDICATION_UNITS } from '../constants/medications'
import { InUseError } from '../lib/errors'
import { normalizeMedication } from '../validation/medication'
import { api } from './apiClient'

/** "850 mg" → { strength: 850, unit: 'mg' }. */
const DOSIS_PATTERN = new RegExp(`^\\s*(\\d+(?:[.,]\\d+)?)\\s*(${MEDICATION_UNITS.join('|')})\\s*$`, 'i')

/** Campo del backend → campo del formulario, para los errores con `fields`. */
const FIELD_FROM_API = {
  nombre: 'name',
  dosis: 'strength',
  forma: 'form',
  slotCompartimento: 'compartmentId',
  stockActual: 'stock',
  capacidad: 'capacity',
  notas: 'notes',
}

function parseDosis(dosis) {
  const match = DOSIS_PATTERN.exec(dosis ?? '')
  if (!match) return { strength: dosis ?? '', unit: '' }
  const unit = MEDICATION_UNITS.find((item) => item.toLowerCase() === match[2].toLowerCase())
  return { strength: Number(match[1].replace(',', '.')), unit }
}

/**
 * Pastilla de Mongo → Medication (shape que usan MedicationCard y el formulario).
 *
 * @returns {import('./medicationsService').Medication & { lowStockAt: number }}
 */
export function fromApi(row) {
  return {
    id: String(row._id),
    name: row.nombre,
    ...parseDosis(row.dosis),
    form: row.forma,
    compartmentId: row.slotCompartimento ?? null,
    stock: row.stockActual,
    capacity: row.capacidad,
    lowStockAt: row.stockMinimoAlerta,
    notes: row.notas ?? '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

/** Valores de MedicationFormModal → body de POST/PUT /api/pills. */
export function toApi(values) {
  const { name, strength, unit, form, compartmentId, stock, capacity, notes } = normalizeMedication(values)
  return {
    nombre: name,
    dosis: `${strength} ${unit}`,
    forma: form,
    slotCompartimento: compartmentId,
    stockActual: stock,
    capacidad: capacity,
    notas: notes,
  }
}

/** Renombra `fields` del backend a los campos del formulario y convierte el 409 de "en uso". */
function toFormError(error) {
  if (error?.fields) {
    error.fields = Object.fromEntries(
      Object.entries(error.fields).map(([field, message]) => [FIELD_FROM_API[field] ?? field, message]),
    )
  }
  if (error?.patientIds) return new InUseError(error.message, error.patientIds.map(String))
  return error
}

async function withFormErrors(request) {
  try {
    return await request()
  } catch (error) {
    throw toFormError(error)
  }
}

/** Pastillas tal cual las guarda Mongo (las usa Inventario). */
export function list() {
  return api.get('/pills')
}

/** @returns {Promise<ReturnType<typeof fromApi>[]>} */
export async function listMedications() {
  const data = await api.get('/pills')
  return Array.isArray(data) ? data.map(fromApi) : []
}

export function createMedication(values) {
  return withFormErrors(async () => fromApi((await api.post('/pills', toApi(values))).pill))
}

export function updateMedication(id, values) {
  return withFormErrors(async () => fromApi((await api.put(`/pills/${id}`, toApi(values))).pill))
}

/** Lanza InUseError si algún paciente la tiene asignada. */
export function removeMedication(id) {
  return withFormErrors(() => api.delete(`/pills/${id}`))
}

/**
 * Deshace `removeMedication`. La API no reusa ids, así que la vuelve a crear
 * (con otro id) con sus datos y su umbral de stock bajo.
 */
export function restoreMedication(medication) {
  return withFormErrors(async () => {
    const data = await api.post('/pills', { ...toApi(medication), stockMinimoAlerta: medication.lowStockAt })
    return fromApi(data.pill)
  })
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
