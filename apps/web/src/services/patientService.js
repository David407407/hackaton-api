import { CARD_COLORS } from '../constants/cardColors'
import { normalizePatient } from '../validation/patient'
import { api } from './apiClient'
import * as assignmentService from './assignmentService'

/** Doña/Don del formulario ↔ `genero` del modelo Patient. */
const GENERO_BY_TITLE = { Doña: 'Femenino', Don: 'Masculino' }

/** `hairStyle` del frontend ↔ `avatar.peinado` del backend. */
const PEINADO_BY_HAIR = { bun: 'chongo', short: 'corto', bald: 'calvo' }
const HAIR_BY_PEINADO = Object.fromEntries(Object.entries(PEINADO_BY_HAIR).map(([hair, peinado]) => [peinado, hair]))

/** Campo del backend → campo del formulario, para los errores con `fields`. */
const FIELD_FROM_API = { nombre: 'name', edad: 'age', genero: 'title', colorTarjeta: 'card' }

/** `colorTarjeta: "Azul"` → `card: "azul"` (keys de CARD_COLORS). */
function cardFromApi(colorTarjeta) {
  if (typeof colorTarjeta !== 'string') return undefined
  const key = colorTarjeta.toLowerCase()
  return CARD_COLORS[key] ? key : undefined
}

/** @param {import('./patientsService').PatientAvatar | undefined} avatar */
function avatarToApi(avatar) {
  if (!avatar) return undefined
  return {
    peinado: PEINADO_BY_HAIR[avatar.hairStyle],
    lentes: avatar.glasses,
    barba: avatar.beard,
    bigote: avatar.mustache,
    colorPiel: avatar.skin,
    colorCabello: avatar.hair,
    colorRopa: avatar.shirt,
    colorFondo: avatar.bg,
  }
}

/** Sin avatar guardado (pacientes viejos) devuelve undefined y se pinta la inicial. */
function avatarFromApi(avatar) {
  if (!avatar) return undefined
  return {
    hairStyle: HAIR_BY_PEINADO[avatar.peinado],
    glasses: avatar.lentes,
    beard: avatar.barba,
    mustache: avatar.bigote,
    skin: avatar.colorPiel,
    hair: avatar.colorCabello,
    shirt: avatar.colorRopa,
    bg: avatar.colorFondo,
  }
}

/** Shape de Mongo → shape que ya usa PatientCard / PatientGrid. */
export function fromApi(row) {
  if (!row) return row
  return {
    ...row,
    id: String(row._id ?? row.id ?? ''),
    title: row.genero === 'Masculino' ? 'Don' : 'Doña',
    name: row.nombre ?? row.name,
    age: row.edad ?? row.age,
    card: cardFromApi(row.colorTarjeta) ?? row.card,
    avatar: avatarFromApi(row.avatar),
    adherence: row.porcentajeAdherencia ?? row.adherence,
  }
}

/** Valores de PatientFormDrawer → body de POST/PUT /api/patients. */
export function toApi(values) {
  const { title, name, age, card, avatar } = normalizePatient(values)
  return {
    nombre: name,
    edad: age,
    genero: GENERO_BY_TITLE[title],
    colorTarjeta: CARD_COLORS[card]?.label,
    avatar: avatarToApi(avatar),
  }
}

/** Renombra `fields` del backend a los campos del formulario. */
function withFormFields(error) {
  if (error?.fields) {
    error.fields = Object.fromEntries(
      Object.entries(error.fields).map(([field, message]) => [FIELD_FROM_API[field] ?? field, message]),
    )
  }
  return error
}

export async function list() {
  const data = await api.get('/patients')
  return Array.isArray(data) ? data.map(fromApi) : []
}

export async function create(values) {
  try {
    const data = await api.post('/patients', toApi(values))
    return fromApi(data.patient)
  } catch (error) {
    throw withFormFields(error)
  }
}

export async function update(id, values) {
  try {
    const data = await api.put(`/patients/${id}`, toApi(values))
    return fromApi(data.patient)
  } catch (error) {
    throw withFormFields(error)
  }
}

/**
 * Borra al paciente y, en cascada, sus asignaciones.
 *
 * @returns {Promise<import('./assignmentsService').Assignment[]>} Las asignaciones borradas.
 */
export async function remove(id) {
  const data = await api.delete(`/patients/${id}`)
  return (data?.asignaciones ?? []).map(assignmentService.fromApi)
}

/**
 * Deshace `remove`. La API no reusa ids, así que vuelve a crear al paciente
 * (con otro id) con sus datos y adherencia, y luego sus asignaciones.
 *
 * @param {object} patient
 * @param {import('./assignmentsService').Assignment[]} [assignments]
 */
export async function restore(patient, assignments = []) {
  const data = await api.post('/patients', {
    ...toApi(patient),
    porcentajeAdherencia: patient.adherence,
    pastillas: (patient.pastillas ?? []).map((pill) => pill._id ?? pill),
  })
  const restored = fromApi(data.patient)
  const restoredAssignments = await Promise.all(
    assignments.map((assignment) => assignmentService.create({ ...assignment, patientId: restored.id })),
  )
  return { patient: restored, assignments: restoredAssignments }
}
