import { CARD_COLORS } from '../constants/cardColors'
import { ConflictError, NotFoundError, ValidationError } from '../lib/errors'
import { clone, newId, nowISO, simulateLatency, throwIfErrors } from '../lib/mockApi'
import { loadDb, saveDb } from '../lib/storage'
import { normalizePatient, validatePatient } from '../validation/patient'

// TODO: reemplazar por fetch a la API (GET/POST/PATCH/DELETE /api/patients).
// La API debe aplicar las mismas reglas y responder 422 (ValidationError) o
// 409 (ConflictError) con { fields: { campo: 'mensaje' } }.

/**
 * @typedef {object} PatientAvatar Rasgos del retrato ilustrado.
 * @property {'bun' | 'short' | 'bald'} hairStyle
 * @property {boolean} glasses
 * @property {boolean} beard
 * @property {boolean} mustache
 * @property {string} skin
 * @property {string} hair
 * @property {string} shirt
 * @property {string} bg
 */

/**
 * @typedef {object} Patient
 * @property {string} id
 * @property {'Don' | 'Doña'} title
 * @property {string} name
 * @property {number} age
 * @property {keyof typeof CARD_COLORS} card Tarjeta física (única por paciente).
 * @property {string | null} photoUrl dataURL de 256 px.
 * @property {PatientAvatar} avatar
 * @property {number | null} adherence Mock hasta tener historial de tomas.
 * @property {'ok' | 'pending' | 'alert'} status Mock hasta tener historial de tomas.
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {object} PatientSnapshot Lo que se borró, para poder deshacerlo.
 * @property {Patient} patient
 * @property {import('./assignmentsService').Assignment[]} assignments
 */

/** Normaliza, valida y deja solo los campos editables. */
function parsePatient(input) {
  const data = normalizePatient(input)
  throwIfErrors(validatePatient(data), (fields) => new ValidationError(fields))
  const { title, name, age, card, photoUrl, avatar } = data
  return { title, name, age, card, photoUrl, avatar: { ...avatar } }
}

/**
 * Regla: cada tarjeta física pertenece a un solo paciente.
 *
 * @param {import('../lib/storage').Database} db
 * @param {string} card
 * @param {string} [exceptId] Paciente que se está editando.
 */
function assertCardAvailable(db, card, exceptId) {
  const owner = db.patients.find((patient) => patient.card === card && patient.id !== exceptId)
  if (owner) {
    throw new ConflictError({ card: `La tarjeta ${CARD_COLORS[card].label} ya está asignada a ${owner.name}.` })
  }
}

function findPatient(db, id) {
  const patient = db.patients.find((item) => item.id === id)
  if (!patient) throw new NotFoundError('Ese paciente ya no existe.')
  return patient
}

/** @returns {Promise<Patient[]>} */
export async function list() {
  await simulateLatency()
  return clone(loadDb().patients)
}

/** @param {string} id @returns {Promise<Patient>} */
export async function get(id) {
  await simulateLatency()
  return clone(findPatient(loadDb(), id))
}

/** @returns {Promise<Patient>} */
export async function create(input) {
  await simulateLatency()
  const db = loadDb()
  const data = parsePatient(input)
  assertCardAvailable(db, data.card)

  const timestamp = nowISO()
  const patient = { id: newId(), ...data, adherence: null, status: 'pending', createdAt: timestamp, updatedAt: timestamp }
  saveDb({ ...db, patients: [...db.patients, patient] })
  return clone(patient)
}

/** @param {string} id @returns {Promise<Patient>} */
export async function update(id, patch) {
  await simulateLatency()
  const db = loadDb()
  const current = findPatient(db, id)
  const data = parsePatient({ ...current, ...patch })
  assertCardAvailable(db, data.card, id)

  const patient = { ...current, ...data, updatedAt: nowISO() }
  saveDb({ ...db, patients: db.patients.map((item) => (item.id === id ? patient : item)) })
  return clone(patient)
}

/**
 * Borra al paciente y, en cascada, sus asignaciones.
 *
 * @param {string} id
 * @returns {Promise<PatientSnapshot>}
 */
export async function remove(id) {
  await simulateLatency()
  const db = loadDb()
  const patient = findPatient(db, id)
  const assignments = db.assignments.filter((assignment) => assignment.patientId === id)

  saveDb({
    ...db,
    patients: db.patients.filter((item) => item.id !== id),
    assignments: db.assignments.filter((assignment) => assignment.patientId !== id),
  })
  return clone({ patient, assignments })
}

/**
 * Deshace `remove`: vuelve a crear al paciente con su mismo id y sus
 * asignaciones (las de medicamentos que ya no existen se omiten).
 *
 * @param {PatientSnapshot} snapshot
 * @returns {Promise<PatientSnapshot>} Lo que realmente se restauró.
 */
export async function restore(snapshot) {
  await simulateLatency()
  const db = loadDb()
  const { patient } = snapshot
  if (db.patients.some((item) => item.id === patient.id)) return clone(snapshot)
  assertCardAvailable(db, patient.card)

  const medicationIds = new Set(db.medications.map((medication) => medication.id))
  const assignments = snapshot.assignments.filter((assignment) => medicationIds.has(assignment.medicationId))

  saveDb({ ...db, patients: [...db.patients, patient], assignments: [...db.assignments, ...assignments] })
  return clone({ patient, assignments })
}
