import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { MAX_EVENTS, SENSOR_EVENT } from '../constants/inventory'
import { INITIAL_SENSOR_EVENTS, INITIAL_TEMPERATURE } from '../data/inventory'
import { createDispenserSimulator } from '../services/dispenserSimulator'
import {
  currentSlotIndex,
  dispenseCandidates,
  inventoryTotals,
  isLow,
  lowCompartments,
  nextOpenSlotIndex,
  toInventoryCompartment,
} from '../utils/inventorySelectors'
import { compartmentView, doseSlots } from '../utils/selectors'
import useAssignments from './useAssignments'
import useMedications from './useMedications'
import useNow from './useNow'
import usePatients from './usePatients'

/**
 * Evento tal como se muestra en el feed. Guarda una copia del medicamento y
 * del paciente de ese momento, así el feed sigue igual aunque luego se editen
 * o se borren.
 *
 * @typedef {object} FeedEvent
 * @property {string} id
 * @property {'DOSE_DISPENSED' | 'LOW_STOCK'} type
 * @property {number} at Timestamp (ms).
 * @property {number} compartmentId
 * @property {string} medication
 * @property {string} dose
 * @property {string | null} patientName
 * @property {string | null} card
 */

/**
 * Un compartimento del panel: cargado (`compartment`) o vacío (null).
 *
 * @typedef {{ id: number, compartment: import('../utils/inventorySelectors').Compartment | null }} CompartmentTileData
 */

const MINUTE_MS = 60_000

/**
 * @param {{ id: string, type: FeedEvent['type'], at: number }} event
 * @param {import('../utils/inventorySelectors').Compartment} compartment
 * @param {import('../services/patientsService').Patient | undefined} patient
 * @returns {FeedEvent}
 */
function toFeedEvent({ id, type, at }, compartment, patient) {
  return {
    id,
    type,
    at,
    compartmentId: compartment.id,
    medication: compartment.medication,
    dose: compartment.dose,
    patientName: patient?.name ?? null,
    card: patient?.card ?? null,
  }
}

/** Horarios pasados completos, el actual a la mitad y los siguientes en 0. */
function initialDispensed(slot, index, current) {
  if (index < current) return slot.planned
  if (index === current) return Math.floor(slot.planned / 2)
  return 0
}

/**
 * @param {object} data
 * @param {number} data.now Timestamp (ms).
 * @param {import('../data/inventory').DoseSlot[]} data.plannedSlots
 * @param {import('../utils/inventorySelectors').Compartment[]} data.compartments
 */
function createInitialState({ now, plannedSlots, compartments }) {
  const currentSlot = currentSlotIndex(plannedSlots, now)
  const compartmentsById = new Map(compartments.map((compartment) => [compartment.id, compartment]))

  return {
    /** Dosis entregadas hoy por bloque (hora de inicio → cantidad). */
    dispensedByHour: Object.fromEntries(
      plannedSlots.map((slot, index) => [slot.hour, initialDispensed(slot, index, currentSlot)]),
    ),
    currentSlot,
    events: INITIAL_SENSOR_EVENTS.flatMap(({ minutesAgo, ...event }) => {
      const compartment = compartmentsById.get(event.compartmentId)
      if (!compartment) return []
      return [toFeedEvent({ ...event, at: now - minutesAgo * MINUTE_MS }, compartment, compartment.patients[0])]
    }),
    /** Id del evento más reciente que llegó en vivo (se resalta en el feed). */
    latestEventId: null,
    temperature: INITIAL_TEMPERATURE,
    lastSyncAt: now,
  }
}

/** @param {Record<number, number>} dispensedByHour */
const withDispensed = (plannedSlots, dispensedByHour) =>
  plannedSlots.map((slot) => ({ ...slot, dispensed: dispensedByHour[slot.hour] ?? 0 }))

function dispenseDose(state, { event, before, after, patient, plannedSlots }) {
  const slots = withDispensed(plannedSlots, state.dispensedByHour)
  const currentSlot = currentSlotIndex(plannedSlots, event.at)
  const slotIndex = nextOpenSlotIndex(slots, currentSlot)

  // Si la dosis deja el compartimento bajo, el sensor de nivel también avisa.
  const newEvents = [toFeedEvent(event, after, patient)]
  if (isLow(after) && !isLow(before)) {
    newEvents.unshift(toFeedEvent({ id: `${event.id}-low`, type: SENSOR_EVENT.lowStock, at: event.at }, after, patient))
  }

  // Con todos los horarios completos, la dosis se registra en el feed pero no suma al día.
  const hour = slotIndex === -1 ? null : plannedSlots[slotIndex].hour
  return {
    ...state,
    dispensedByHour:
      hour === null ? state.dispensedByHour : { ...state.dispensedByHour, [hour]: (state.dispensedByHour[hour] ?? 0) + 1 },
    currentSlot,
    events: [...newEvents, ...state.events].slice(0, MAX_EVENTS),
    latestEventId: newEvents[0].id,
    temperature: event.temperature ?? state.temperature,
    lastSyncAt: event.at,
  }
}

function dispenserReducer(state, action) {
  switch (action.type) {
    case 'DOSE_DISPENSED':
      return dispenseDose(state, action)
    case 'SYNC':
      return { ...state, lastSyncAt: action.at }
    default:
      return state
  }
}

/**
 * Estado del dispensador en tiempo real. Los compartimentos, su stock y las
 * tomas programadas salen del estado compartido (DataProvider): lo que se
 * edita en Medicamentos o en las asignaciones se ve aquí al instante, y cada
 * dosis entregada descuenta stock con una acción del provider.
 *
 * Se suscribe a una fuente de eventos (por ahora el simulador). Para usar el
 * hardware real basta pasar otra `createSource` con la misma interfaz
 * `subscribe(onEvent) → unsubscribe`; ningún componente cambia.
 *
 * Debe montarse cuando los datos ya cargaron (el estado inicial se arma con ellos).
 *
 * @param {object} [options]
 * @param {(options: { getCandidates: () => import('../services/dispenserSimulator').DispenseCandidate[] }) => import('../services/dispenserSimulator').DispenserSource} [options.createSource]
 *   Debe ser estable (definida fuera del componente).
 */
export default function useDispenser({ createSource = createDispenserSimulator } = {}) {
  const { patients } = usePatients()
  const { medications, dispenseMedication, updateMedication } = useMedications()
  const { assignments } = useAssignments()
  const now = useNow()

  /** @type {CompartmentTileData[]} */
  const tiles = useMemo(
    () =>
      compartmentView(medications, assignments, patients).map((view) => ({
        id: view.id,
        compartment: view.medication ? toInventoryCompartment(view) : null,
      })),
    [medications, assignments, patients],
  )
  const compartments = useMemo(() => tiles.flatMap((tile) => (tile.compartment ? [tile.compartment] : [])), [tiles])
  const plannedSlots = useMemo(() => doseSlots(assignments, medications, now), [assignments, medications, now])

  const [state, dispatch] = useReducer(dispenserReducer, undefined, () =>
    createInitialState({ now: Date.now(), plannedSlots, compartments }),
  )

  // El simulador y el manejador de eventos leen los datos más recientes de
  // aquí, sin tener que volver a suscribirse en cada cambio.
  const dataRef = useRef({ assignments, compartments, patients, plannedSlots })
  useEffect(() => {
    dataRef.current = { assignments, compartments, patients, plannedSlots }
  }, [assignments, compartments, patients, plannedSlots])

  useEffect(() => {
    const getCandidates = () => {
      const { assignments: current, compartments: loaded, patients: people } = dataRef.current
      return dispenseCandidates(current, loaded, people, new Date())
    }

    /** @param {import('../services/dispenserSimulator').DispenserEvent} event */
    const handleEvent = (event) => {
      const { compartments: loaded, patients: people, plannedSlots: planned } = dataRef.current
      const before = loaded.find((compartment) => compartment.id === event.compartmentId)
      if (!before) return
      const after = { ...before, left: Math.max(0, before.left - event.quantity) }
      const patient = people.find((person) => person.card === event.card)

      dispatch({ type: 'DOSE_DISPENSED', event, before, after, patient, plannedSlots: planned })
      dispenseMedication(before.medicationId, event.quantity).catch((error) => {
        console.warn('[dispenser] No se pudo descontar el stock.', error)
      })
    }

    const source = createSource({ getCandidates })
    return source.subscribe(handleEvent)
  }, [createSource, dispenseMedication])

  /** Marca el compartimento como lleno. Devuelve la promesa del servicio. */
  const refill = useCallback(
    (compartment) => updateMedication(compartment.medicationId, { stock: compartment.capacity }),
    [updateMedication],
  )
  const sync = useCallback(() => dispatch({ type: 'SYNC', at: Date.now() }), [])

  const slots = useMemo(() => withDispensed(plannedSlots, state.dispensedByHour), [plannedSlots, state.dispensedByHour])
  const totals = useMemo(() => inventoryTotals(slots, compartments), [slots, compartments])
  const lowStock = useMemo(() => lowCompartments(compartments), [compartments])

  return {
    tiles,
    compartments,
    slots,
    currentSlot: state.currentSlot,
    events: state.events,
    latestEventId: state.latestEventId,
    temperature: state.temperature,
    lastSyncAt: state.lastSyncAt,
    totals,
    lowCompartments: lowStock,
    refill,
    sync,
  }
}
