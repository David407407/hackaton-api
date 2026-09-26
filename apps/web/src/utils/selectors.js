import { LOW_STOCK_RATIO } from '../constants/inventory'
import { COMPARTMENT_IDS } from '../constants/medications'
import { DOSE_BLOCK_HOURS } from '../constants/schedule'
import { appliesOn, findNextDose, formatNextDose, toTimeString } from './schedule'

/*
 * Datos derivados. Nada de esto se guarda: se calcula a partir de las tres
 * colecciones (pacientes, medicamentos, asignaciones). Todas son funciones
 * puras; los hooks las envuelven en useMemo.
 */

/** @typedef {import('../services/patientsService').Patient} Patient */
/** @typedef {import('../services/medicationsService').Medication} Medication */
/** @typedef {import('../services/assignmentsService').Assignment} Assignment */

/* ---------- Asignaciones ---------- */

/** @param {Assignment[]} assignments */
export const activeAssignments = (assignments) => assignments.filter((assignment) => assignment.active)

/** @param {Assignment[]} assignments @param {string} patientId */
export const assignmentsOf = (assignments, patientId) =>
  assignments.filter((assignment) => assignment.patientId === patientId)

/** Número de asignaciones activas del paciente. @param {Assignment[]} assignments @param {string} patientId */
export const medsCount = (assignments, patientId) => activeAssignments(assignmentsOf(assignments, patientId)).length

/**
 * Próxima toma del paciente entre sus asignaciones activas.
 *
 * @param {Assignment[]} assignments
 * @param {string} patientId
 * @param {Date} now
 */
export const nextDose = (assignments, patientId, now) => findNextDose(assignmentsOf(assignments, patientId), now)

/**
 * @typedef {object} PatientSummary
 * @property {number} medsCount
 * @property {import('./schedule').NextDose | null} nextDose
 * @property {string} nextDoseLabel "14:30", "Mañana 08:00"…
 */

/**
 * Resumen de cada paciente para las tarjetas y los KPIs.
 *
 * @param {Patient[]} patients
 * @param {Assignment[]} assignments
 * @param {Date} now
 * @returns {Map<string, PatientSummary>}
 */
export function patientSummaries(patients, assignments, now) {
  return new Map(
    patients.map((patient) => {
      const next = nextDose(assignments, patient.id, now)
      return [
        patient.id,
        { medsCount: medsCount(assignments, patient.id), nextDose: next, nextDoseLabel: formatNextDose(next) },
      ]
    }),
  )
}

/**
 * Pacientes con una asignación activa del medicamento, en el orden de la lista.
 *
 * @param {Assignment[]} assignments
 * @param {Patient[]} patients
 * @param {string} medicationId
 * @returns {Patient[]}
 */
export function patientsForMedication(assignments, patients, medicationId) {
  const ids = new Set(
    activeAssignments(assignments)
      .filter((assignment) => assignment.medicationId === medicationId)
      .map((assignment) => assignment.patientId),
  )
  return patients.filter((patient) => ids.has(patient.id))
}

/**
 * Lo mismo que patientsForMedication, para todos los medicamentos de una vez.
 *
 * @param {Assignment[]} assignments
 * @param {Patient[]} patients
 * @returns {Map<string, Patient[]>}
 */
export function patientsByMedication(assignments, patients) {
  const byMedication = new Map()
  for (const patient of patients) {
    const medicationIds = new Set(
      activeAssignments(assignmentsOf(assignments, patient.id)).map((assignment) => assignment.medicationId),
    )
    for (const medicationId of medicationIds) {
      byMedication.set(medicationId, [...(byMedication.get(medicationId) ?? []), patient])
    }
  }
  return byMedication
}

/* ---------- Tarjetas y compartimentos ---------- */

/** Dueño de cada tarjeta de color. @param {Patient[]} patients @returns {Map<string, Patient>} */
export const cardOwners = (patients) => new Map(patients.map((patient) => [patient.card, patient]))

/** Medicamento de cada compartimento. @param {Medication[]} medications @returns {Map<number, Medication>} */
export const compartmentOwners = (medications) =>
  new Map(
    medications
      .filter((medication) => medication.compartmentId !== null)
      .map((medication) => [medication.compartmentId, medication]),
  )

/**
 * @typedef {object} CompartmentView
 * @property {number} id 1–6.
 * @property {Medication | null} medication
 * @property {Patient[]} patients Con el medicamento asignado y activo.
 */

/**
 * Los 6 compartimentos del dispensador con su medicamento (si tiene) y los
 * pacientes a los que se les entrega.
 *
 * @param {Medication[]} medications
 * @param {Assignment[]} assignments
 * @param {Patient[]} patients
 * @returns {CompartmentView[]}
 */
export function compartmentView(medications, assignments, patients) {
  const owners = compartmentOwners(medications)
  return COMPARTMENT_IDS.map((id) => {
    const medication = owners.get(id) ?? null
    return { id, medication, patients: medication ? patientsForMedication(assignments, patients, medication.id) : [] }
  })
}

/** @param {Medication} medication */
export const isLowStock = (medication) => medication.stock / medication.capacity <= LOW_STOCK_RATIO

/* ---------- Dosis del día ---------- */

/**
 * Tomas de hoy que puede entregar el dispensador: asignaciones activas que
 * aplican hoy y cuyo medicamento está en un compartimento.
 *
 * @param {Assignment[]} assignments
 * @param {Medication[]} medications
 * @param {Date} date
 * @returns {{ assignment: Assignment, time: string }[]}
 */
export function dispensableDoses(assignments, medications, date) {
  const loaded = new Set(
    medications.filter((medication) => medication.compartmentId !== null).map((medication) => medication.id),
  )
  return assignments
    .filter((assignment) => loaded.has(assignment.medicationId) && appliesOn(assignment, date))
    .flatMap((assignment) => assignment.times.map((time) => ({ assignment, time })))
}

/** Bloque de 2 h al que pertenece una hora (antes de las 06 cuenta como 06). @param {string} time */
function blockHourOf(time) {
  const hour = Number(time.slice(0, 2))
  return DOSE_BLOCK_HOURS.findLast((blockHour) => blockHour <= hour) ?? DOSE_BLOCK_HOURS[0]
}

/**
 * Tomas programadas por bloque de 2 h para la gráfica del inventario.
 *
 * @param {Assignment[]} assignments
 * @param {Medication[]} medications
 * @param {Date} date
 * @returns {import('../data/inventory').DoseSlot[]}
 */
export function doseSlots(assignments, medications, date) {
  const counts = new Map(DOSE_BLOCK_HOURS.map((hour) => [hour, 0]))
  for (const { time } of dispensableDoses(assignments, medications, date)) {
    const hour = blockHourOf(time)
    counts.set(hour, counts.get(hour) + 1)
  }
  return DOSE_BLOCK_HOURS.map((hour) => ({ hour, planned: counts.get(hour) }))
}

/**
 * Tomas de hoy (todas las activas) y cuántas ya pasaron su hora. Mientras no
 * haya historial real, "pasaron su hora" cuenta como entregada.
 *
 * @param {Assignment[]} assignments
 * @param {Date} now
 */
export function todayDoseSummary(assignments, now) {
  const times = assignments.filter((assignment) => appliesOn(assignment, now)).flatMap((assignment) => assignment.times)
  const currentTime = toTimeString(now)
  const delivered = times.filter((time) => time < currentTime).length
  return { scheduled: times.length, delivered }
}
