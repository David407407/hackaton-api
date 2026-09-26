import { CRITICAL_STOCK, LOW_STOCK_RATIO, SENSOR_EVENT } from '../constants/inventory'
import { COMPARTMENT_IDS } from '../constants/medications'
import { DOSE_BLOCK_HOURS } from '../constants/schedule'
import { patientShortName } from './labels'
import { pillsLabel, toTimeString } from './schedule'
import { blockHourOf } from './selectors'

/**
 * @typedef {object} DoseSlot
 * @property {number} hour Hora de inicio del bloque de 2 h (0–23).
 * @property {number} planned Tomas programadas en ese bloque.
 */
/** @typedef {DoseSlot & { dispensed: number, missed?: number }} DoseSlotState */
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
 * @property {number} left Pastillas restantes (stock de la API; cada toma entregada lo descuenta).
 * @property {number} capacity
 * @property {number | undefined} lowStockAt stockMinimoAlerta de la pastilla.
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
    lowStockAt: medication.lowStockAt,
    patients,
  }
}

/* ---------- Compartimentos ---------- */

/** @param {Compartment} compartment */
export const stockPct = (compartment) => Math.round((compartment.left / compartment.capacity) * 100)

/** Con `lowStockAt` usa ese umbral; si no, el 25% de la capacidad. @param {Compartment} compartment */
export const isLow = (compartment) =>
  compartment.lowStockAt != null
    ? compartment.left <= compartment.lowStockAt
    : compartment.left / compartment.capacity <= LOW_STOCK_RATIO

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

/* ---------- Tareas del dispensador ---------- */

/**
 * Evento del feed "Actividad del sensor", armado a partir de una tarea ya
 * entregada o perdida.
 *
 * @typedef {object} FeedEvent
 * @property {string} id
 * @property {'DOSE_DISPENSED' | 'DOSE_MISSED'} type
 * @property {number} at Timestamp (ms).
 * @property {number} compartmentId
 * @property {string} medication
 * @property {string} dose
 * @property {string | null} patientName
 * @property {string | null} card
 */

/**
 * Tomas del día por bloque de 2 h: programadas (todas), dispensadas y perdidas.
 *
 * @param {import('../services/taskService').DispenserTask[]} tasks Las de hoy.
 * @returns {DoseSlotState[]}
 */
export function taskSlots(tasks) {
  const slots = new Map(DOSE_BLOCK_HOURS.map((hour) => [hour, { hour, planned: 0, dispensed: 0, missed: 0 }]))
  for (const task of tasks) {
    const slot = slots.get(blockHourOf(toTimeString(new Date(task.scheduledAt))))
    slot.planned += 1
    if (task.status === 'completed') slot.dispensed += 1
    if (task.status === 'missed') slot.missed += 1
  }
  return [...slots.values()]
}

/**
 * Últimas tomas entregadas o perdidas, de la más reciente a la más vieja.
 *
 * @param {import('../services/taskService').DispenserTask[]} tasks
 * @param {number} max
 * @returns {FeedEvent[]}
 */
export function taskFeed(tasks, max) {
  return tasks
    .filter((task) => task.status === 'completed' || task.status === 'missed')
    .map((task) => ({
      id: task.id,
      type: task.status === 'completed' ? SENSOR_EVENT.doseDispensed : SENSOR_EVENT.doseMissed,
      at: task.dispensedAt ?? task.scheduledAt,
      compartmentId: task.compartmentId,
      medication: task.medication,
      dose: task.dose,
      patientName: task.patientName,
      card: task.card,
    }))
    .sort((a, b) => b.at - a.at)
    .slice(0, max)
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
  // Las perdidas ya no se van a entregar: no cuentan como pendientes.
  const missed = slots.reduce((sum, slot) => sum + (slot.missed ?? 0), 0)
  return {
    dispensed,
    planned,
    missed,
    pending: Math.max(0, planned - dispensed - missed),
    progressPct: planned ? Math.min(100, Math.round((dispensed / planned) * 100)) : 0,
    stock: compartments.reduce((sum, compartment) => sum + compartment.left, 0),
    capacity: compartments.reduce((sum, compartment) => sum + compartment.capacity, 0),
    activeCompartments: compartments.filter((compartment) => compartment.left > 0).length,
    totalCompartments: COMPARTMENT_IDS.length,
  }
}

/** Mensaje del toast al recargar: "Metformina recargado · 30 pastillas". */
export const refillMessage = (compartment) => `${compartment.medication} recargado · ${pillsLabel(compartment.capacity)}`
