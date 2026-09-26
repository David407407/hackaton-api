import { CRITICAL_STOCK, LOW_STOCK_RATIO } from '../constants/inventory'
import { COMPARTMENT_IDS } from '../constants/medications'
import { patientShortName } from './labels'
import { appliesOn, pillsLabel } from './schedule'

/** @typedef {import('../data/inventory').DoseSlot} DoseSlot */
/** @typedef {DoseSlot & { dispensed: number }} DoseSlotState */
/** @typedef {'ok' | 'low' | 'critical'} StockLevel */

/**
 * Compartimento cargado, tal como lo muestra Inventario. Se arma a partir del
 * medicamento que tiene `compartmentId` (ver selectors.compartmentView).
 *
 * @typedef {object} Compartment
 * @property {number} id 1–6.
 * @property {string} medicationId
 * @property {string} medication Nombre ("Metformina").
 * @property {string} dose Concentración ("850 mg").
 * @property {number} left Pastillas restantes (medidas por el sensor infrarrojo).
 * @property {number} capacity
 * @property {import('../services/patientsService').Patient[]} patients Pacientes a los que se les entrega.
 */

/**
 * @param {import('./selectors').CompartmentView} view Con `medication` distinto de null.
 * @returns {Compartment}
 */
export function toInventoryCompartment({ id, medication, patients }) {
  return {
    id,
    medicationId: medication.id,
    medication: medication.name,
    dose: `${medication.strength} ${medication.unit}`,
    left: medication.stock,
    capacity: medication.capacity,
    patients,
  }
}

/* ---------- Compartimentos ---------- */

/** @param {Compartment} compartment */
export const stockPct = (compartment) => Math.round((compartment.left / compartment.capacity) * 100)

/** @param {Compartment} compartment */
export const isLow = (compartment) => compartment.left / compartment.capacity <= LOW_STOCK_RATIO

/** @param {Compartment} compartment */
export const isCritical = (compartment) => compartment.left <= CRITICAL_STOCK

/**
 * @param {Compartment} compartment
 * @returns {StockLevel}
 */
export function stockLevel(compartment) {
  if (!isLow(compartment)) return 'ok'
  return isCritical(compartment) ? 'critical' : 'low'
}

/**
 * Nivel de la barra de stock: ≤ 25% low, < 60% medium, el resto high.
 *
 * @param {number} pct 0–100.
 * @returns {keyof typeof import('../constants/inventory').STOCK_FILL}
 */
export function stockFillLevel(pct) {
  if (pct <= 25) return 'low'
  if (pct < 60) return 'medium'
  return 'high'
}

/** @param {Compartment[]} compartments */
export const lowCompartments = (compartments) => compartments.filter(isLow)

/**
 * "Ernesto S.", "Ernesto S. +2" o "Sin pacientes".
 *
 * @param {import('../services/patientsService').Patient[]} patients
 */
export function patientsLabel(patients) {
  if (!patients.length) return 'Sin pacientes'
  const first = patientShortName(patients[0])
  return patients.length === 1 ? first : `${first} +${patients.length - 1}`
}

/**
 * Tomas que el dispensador puede entregar ahora: asignaciones que aplican hoy
 * cuyo medicamento está cargado y conserva al menos una pastilla después de
 * la toma (para que la demo no vacíe compartimentos).
 *
 * @param {import('../services/assignmentsService').Assignment[]} assignments
 * @param {Compartment[]} compartments Solo los cargados.
 * @param {import('../services/patientsService').Patient[]} patients
 * @param {Date} date
 * @returns {import('../services/dispenserSimulator').DispenseCandidate[]}
 */
export function dispenseCandidates(assignments, compartments, patients, date) {
  const compartmentByMedication = new Map(compartments.map((compartment) => [compartment.medicationId, compartment]))
  const patientById = new Map(patients.map((patient) => [patient.id, patient]))

  return assignments.flatMap((assignment) => {
    const compartment = compartmentByMedication.get(assignment.medicationId)
    const patient = patientById.get(assignment.patientId)
    if (!compartment || !patient || compartment.left <= assignment.quantity || !appliesOn(assignment, date)) return []
    return [{ card: patient.card, compartmentId: compartment.id, quantity: assignment.quantity }]
  })
}

/* ---------- Horarios de dosis ---------- */

/**
 * Índice del horario actual: el último con `hour <= hora`, acotado al primero
 * y al último (antes de las 06 cuenta como 06; después de las 22, como 22).
 *
 * @param {DoseSlot[]} slots
 * @param {Date | number} date
 */
export function currentSlotIndex(slots, date) {
  const hour = new Date(date).getHours()
  return Math.max(0, slots.findLastIndex((slot) => slot.hour <= hour))
}

/**
 * Horario al que se le suma una dosis nueva: el actual o, si ya está completo,
 * el siguiente con lugar. -1 si ya no queda ninguno.
 *
 * @param {DoseSlotState[]} slots
 * @param {number} fromIndex
 */
export function nextOpenSlotIndex(slots, fromIndex) {
  return slots.findIndex((slot, index) => index >= fromIndex && slot.dispensed < slot.planned)
}

/** @param {number} hour */
export const formatSlotHour = (hour) => `${String(hour).padStart(2, '0')}:00`

/* ---------- Totales ---------- */

/**
 * @param {DoseSlotState[]} slots
 * @param {Compartment[]} compartments Solo los cargados.
 */
export function inventoryTotals(slots, compartments) {
  const dispensed = slots.reduce((sum, slot) => sum + slot.dispensed, 0)
  const planned = slots.reduce((sum, slot) => sum + slot.planned, 0)
  return {
    dispensed,
    planned,
    pending: Math.max(0, planned - dispensed),
    progressPct: planned ? Math.min(100, Math.round((dispensed / planned) * 100)) : 0,
    stock: compartments.reduce((sum, compartment) => sum + compartment.left, 0),
    capacity: compartments.reduce((sum, compartment) => sum + compartment.capacity, 0),
    activeCompartments: compartments.filter((compartment) => compartment.left > 0).length,
    totalCompartments: COMPARTMENT_IDS.length,
  }
}

/** Mensaje del toast al recargar: "Metformina recargado · 30 pastillas". */
export const refillMessage = (compartment) => `${compartment.medication} recargado · ${pillsLabel(compartment.capacity)}`
