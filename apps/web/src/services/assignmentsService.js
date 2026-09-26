import { ConflictError, NotFoundError, ValidationError } from '../lib/errors'
import { clone, newId, nowISO, simulateLatency, throwIfErrors } from '../lib/mockApi'
import { loadDb, saveDb } from '../lib/storage'
import { medicationLabel } from '../utils/labels'
import { normalizeAssignment, validateAssignment } from '../validation/assignment'

// TODO: reemplazar por fetch a la API (GET /api/patients/:id/assignments,
// POST/PATCH/DELETE /api/assignments).

/**
 * @typedef {object} Assignment
 * @property {string} id
 * @property {string} patientId
 * @property {string} medicationId
 * @property {number} quantity Pastillas por toma, 1–4.
 * @property {string[]} times 'HH:mm', 1–6, sin repetidos y ordenados.
 * @property {'daily' | number[]} days 'daily' o días ISO (1 = lunes … 7 = domingo).
 * @property {string} startDate 'YYYY-MM-DD'
 * @property {string | null} endDate 'YYYY-MM-DD'
 * @property {string} instructions
 * @property {boolean} active
 * @property {string} createdAt
 * @property {string} updatedAt
 */

function parseAssignment(input) {
  const data = normalizeAssignment(input)
  throwIfErrors(validateAssignment(data), (fields) => new ValidationError(fields))
  const { patientId, medicationId, quantity, times, days, startDate, endDate, instructions, active } = data
  return { patientId, medicationId, quantity, times, days, startDate, endDate, instructions, active: Boolean(active) }
}

/**
 * Reglas que dependen de otros registros: el paciente y el medicamento
 * existen, y el paciente no tiene otra asignación activa del mismo
 * medicamento.
 *
 * @param {import('../lib/storage').Database} db
 * @param {ReturnType<typeof parseAssignment>} data
 * @param {string} [exceptId] Asignación que se está editando.
 */
function assertRelations(db, data, exceptId) {
  const patient = db.patients.find((item) => item.id === data.patientId)
  if (!patient) throw new ValidationError({ patientId: 'Ese paciente ya no existe.' })

  const medication = db.medications.find((item) => item.id === data.medicationId)
  if (!medication) throw new ValidationError({ medicationId: 'Ese medicamento ya no existe.' })

  if (!data.active) return
  const duplicate = db.assignments.some(
    (item) =>
      item.id !== exceptId && item.active && item.patientId === data.patientId && item.medicationId === data.medicationId,
  )
  if (duplicate) {
    throw new ConflictError({ medicationId: `${patient.name} ya tiene ${medicationLabel(medication)} activo.` })
  }
}

function findAssignment(db, id) {
  const assignment = db.assignments.find((item) => item.id === id)
  if (!assignment) throw new NotFoundError('Esa asignación ya no existe.')
  return assignment
}

/** Todas las asignaciones (para los derivados de la app). @returns {Promise<Assignment[]>} */
export async function list() {
  await simulateLatency()
  return clone(loadDb().assignments)
}

/** @param {string} patientId @returns {Promise<Assignment[]>} */
export async function listByPatient(patientId) {
  await simulateLatency()
  return clone(loadDb().assignments.filter((assignment) => assignment.patientId === patientId))
}

/** @returns {Promise<Assignment>} */
export async function create(input) {
  await simulateLatency()
  const db = loadDb()
  const data = parseAssignment({ active: true, ...input })
  assertRelations(db, data)

  const timestamp = nowISO()
  const assignment = { id: newId(), ...data, createdAt: timestamp, updatedAt: timestamp }
  saveDb({ ...db, assignments: [...db.assignments, assignment] })
  return clone(assignment)
}

/** @param {string} id @returns {Promise<Assignment>} */
export async function update(id, patch) {
  await simulateLatency()
  const db = loadDb()
  const current = findAssignment(db, id)
  // El paciente de una asignación no cambia.
  const data = parseAssignment({ ...current, ...patch, patientId: current.patientId })
  assertRelations(db, data, id)

  const assignment = { ...current, ...data, updatedAt: nowISO() }
  saveDb({ ...db, assignments: db.assignments.map((item) => (item.id === id ? assignment : item)) })
  return clone(assignment)
}

/** @param {string} id @returns {Promise<Assignment>} La asignación borrada. */
export async function remove(id) {
  await simulateLatency()
  const db = loadDb()
  const assignment = findAssignment(db, id)
  saveDb({ ...db, assignments: db.assignments.filter((item) => item.id !== id) })
  return clone(assignment)
}

/**
 * Deshace `remove` con el mismo id. Vuelve a revisar las reglas por si
 * mientras tanto se asignó el mismo medicamento.
 *
 * @param {Assignment} assignment
 * @returns {Promise<Assignment>}
 */
export async function restore(assignment) {
  await simulateLatency()
  const db = loadDb()
  if (db.assignments.some((item) => item.id === assignment.id)) return clone(assignment)
  assertRelations(db, parseAssignment(assignment))
  saveDb({ ...db, assignments: [...db.assignments, assignment] })
  return clone(assignment)
}
