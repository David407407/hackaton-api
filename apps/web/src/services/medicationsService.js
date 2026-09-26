import { ConflictError, InUseError, NotFoundError, ValidationError } from '../lib/errors'
import { clone, newId, nowISO, simulateLatency, throwIfErrors } from '../lib/mockApi'
import { loadDb, saveDb } from '../lib/storage'
import { compartmentLabel, medicationLabel } from '../utils/labels'
import { normalizeMedication, validateMedication } from '../validation/medication'

// TODO: reemplazar por fetch a la API (GET/POST/PATCH/DELETE /api/medications).
// DELETE debe responder 409 con { patientIds } si el medicamento está en uso.

/**
 * @typedef {object} Medication
 * @property {string} id
 * @property {string} name
 * @property {number} strength
 * @property {'mg' | 'mcg' | 'g' | 'UI'} unit
 * @property {'Tableta' | 'Cápsula' | 'Gragea'} form
 * @property {number | null} compartmentId 1–6, o null si no está cargado en el dispensador.
 * @property {number} stock Pastillas restantes (0–capacity).
 * @property {number} capacity 1–60.
 * @property {string} notes
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {object} MedicationSnapshot
 * @property {Medication} medication
 * @property {import('./assignmentsService').Assignment[]} assignments Asignaciones inactivas que se borraron con él.
 */

function parseMedication(input) {
  const data = normalizeMedication(input)
  throwIfErrors(validateMedication(data), (fields) => new ValidationError(fields))
  const { name, strength, unit, form, compartmentId, stock, capacity, notes } = data
  return { name, strength, unit, form, compartmentId, stock, capacity, notes }
}

/**
 * Regla: cada compartimento guarda como máximo un medicamento.
 *
 * @param {import('../lib/storage').Database} db
 * @param {number | null} compartmentId
 * @param {string} [exceptId]
 */
function assertCompartmentAvailable(db, compartmentId, exceptId) {
  if (compartmentId === null) return
  const owner = db.medications.find((item) => item.compartmentId === compartmentId && item.id !== exceptId)
  if (owner) {
    throw new ConflictError({ compartmentId: `${compartmentLabel(compartmentId)} ya tiene ${medicationLabel(owner)}.` })
  }
}

function findMedication(db, id) {
  const medication = db.medications.find((item) => item.id === id)
  if (!medication) throw new NotFoundError('Ese medicamento ya no existe.')
  return medication
}

function replaceMedication(db, medication) {
  saveDb({ ...db, medications: db.medications.map((item) => (item.id === medication.id ? medication : item)) })
  return clone(medication)
}

/** @returns {Promise<Medication[]>} */
export async function list() {
  await simulateLatency()
  return clone(loadDb().medications)
}

/** @param {string} id @returns {Promise<Medication>} */
export async function get(id) {
  await simulateLatency()
  return clone(findMedication(loadDb(), id))
}

/** @returns {Promise<Medication>} */
export async function create(input) {
  await simulateLatency()
  const db = loadDb()
  const data = parseMedication(input)
  assertCompartmentAvailable(db, data.compartmentId)

  const timestamp = nowISO()
  const medication = { id: newId(), ...data, createdAt: timestamp, updatedAt: timestamp }
  saveDb({ ...db, medications: [...db.medications, medication] })
  return clone(medication)
}

/** @param {string} id @returns {Promise<Medication>} */
export async function update(id, patch) {
  await simulateLatency()
  const db = loadDb()
  const current = findMedication(db, id)
  const data = parseMedication({ ...current, ...patch })
  assertCompartmentAvailable(db, data.compartmentId, id)
  return replaceMedication(db, { ...current, ...data, updatedAt: nowISO() })
}

/**
 * Descuenta las pastillas que entregó el dispensador (nunca baja de 0).
 *
 * @param {string} id
 * @param {number} quantity
 * @returns {Promise<Medication>}
 */
export async function dispense(id, quantity) {
  await simulateLatency()
  const db = loadDb()
  const current = findMedication(db, id)
  return replaceMedication(db, { ...current, stock: Math.max(0, current.stock - quantity), updatedAt: nowISO() })
}

/**
 * Borra el medicamento. Si algún paciente lo tiene activo, lanza InUseError;
 * las asignaciones inactivas se borran en cascada.
 *
 * @param {string} id
 * @returns {Promise<MedicationSnapshot>}
 */
export async function remove(id) {
  await simulateLatency()
  const db = loadDb()
  const medication = findMedication(db, id)
  const related = db.assignments.filter((assignment) => assignment.medicationId === id)
  const activePatientIds = [...new Set(related.filter((item) => item.active).map((item) => item.patientId))]

  if (activePatientIds.length) {
    throw new InUseError(
      `${medicationLabel(medication)} está asignado a ${activePatientIds.length} ${activePatientIds.length === 1 ? 'paciente' : 'pacientes'}. Quita la asignación primero.`,
      activePatientIds,
    )
  }

  saveDb({
    ...db,
    medications: db.medications.filter((item) => item.id !== id),
    assignments: db.assignments.filter((assignment) => assignment.medicationId !== id),
  })
  return clone({ medication, assignments: related })
}

/**
 * Deshace `remove`. Falla con ConflictError si mientras tanto alguien ocupó
 * su compartimento.
 *
 * @param {MedicationSnapshot} snapshot
 * @returns {Promise<MedicationSnapshot>}
 */
export async function restore(snapshot) {
  await simulateLatency()
  const db = loadDb()
  const { medication } = snapshot
  if (db.medications.some((item) => item.id === medication.id)) return clone(snapshot)
  assertCompartmentAvailable(db, medication.compartmentId)

  const patientIds = new Set(db.patients.map((patient) => patient.id))
  const assignments = snapshot.assignments.filter((assignment) => patientIds.has(assignment.patientId))

  saveDb({ ...db, medications: [...db.medications, medication], assignments: [...db.assignments, ...assignments] })
  return clone({ medication, assignments })
}
