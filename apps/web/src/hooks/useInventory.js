import { useCallback, useEffect, useMemo, useState } from 'react'
import { DISPENSER_ONLINE_MS, INVENTORY_POLL_MS, MAX_EVENTS } from '../constants/inventory'
import * as assignmentService from '../services/assignmentService'
import * as patientService from '../services/patientService'
import * as pillService from '../services/pillService'
import * as taskService from '../services/taskService'
import {
  currentSlotIndex,
  inventoryTotals,
  lowCompartments,
  taskFeed,
  taskSlots,
  toInventoryCompartment,
} from '../utils/inventorySelectors'
import { compartmentView } from '../utils/selectors'
import useNow from './useNow'

/**
 * Un compartimento del panel: cargado (`compartment`) o vacío (null).
 *
 * @typedef {{ id: number, compartment: import('../utils/inventorySelectors').Compartment | null }} CompartmentTileData
 */

/** Tomas de hoy: de 00:00 a 23:59 en la hora local del navegador. */
function todayRange(now = new Date()) {
  return {
    from: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
  }
}

async function fetchInventory() {
  const { from, to } = todayRange()
  const [medications, patients, assignments, tasks, status] = await Promise.all([
    pillService.listMedications(),
    patientService.list(),
    assignmentService.list(),
    taskService.listBetween(from, to),
    taskService.dispenserStatus(),
  ])
  return { medications, patients, assignments, tasks, lastSeenAt: status.lastSeenAt, syncedAt: Date.now() }
}

/**
 * Inventario del dispensador con datos de la API: compartimentos y stock
 * (pastillas), pacientes de cada compartimento (asignaciones activas), tomas
 * del día y feed (tareas que generó el backend y que el Arduino entrega con
 * /tasks/next). Se vuelve a consultar cada INVENTORY_POLL_MS.
 */
export default function useInventory() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  /** Evento más reciente visto y el que llegó en vivo (se resalta en el feed). */
  const [feedTop, setFeedTop] = useState({ seenId: undefined, latestEventId: null })
const now = useNow()

  /** Consulta a demanda (botón Sincronizar, después de recargar). */
  const load = useCallback(
    () =>
      fetchInventory().then(
        (next) => {
          setData(next)
          setError(null)
        },
        (err) => setError(err),
      ),
    [],
  )

  useEffect(() => {
    let active = true
    const refresh = () =>
      fetchInventory().then(
        (next) => {
          if (!active) return
          setData(next)
          setError(null)
        },
        (err) => {
          if (active) setError(err)
        },
      )
    refresh()
    const intervalId = setInterval(refresh, INVENTORY_POLL_MS)
    return () => {
      active = false
      clearInterval(intervalId)
    }
  }, [])

  /** @type {CompartmentTileData[]} */
  const tiles = useMemo(
    () =>
      data
        ? compartmentView(data.medications, data.assignments, data.patients).map((view) => ({
            id: view.id,
            compartment: view.medication ? toInventoryCompartment(view) : null,
          }))
        : [],
    [data],
  )
  const compartments = useMemo(() => tiles.flatMap((tile) => (tile.compartment ? [tile.compartment] : [])), [tiles])
  const slots = useMemo(() => taskSlots(data?.tasks ?? []), [data])
  const totals = useMemo(() => inventoryTotals(slots, compartments), [slots, compartments])
  const lowStock = useMemo(() => lowCompartments(compartments), [compartments])
  const events = useMemo(() => taskFeed(data?.tasks ?? [], MAX_EVENTS), [data])

  // Resalta la toma que llegó desde la consulta anterior (no en la primera carga).
  const topEventId = events[0]?.id ?? null
  if (data && topEventId !== feedTop.seenId) {
    setFeedTop({ seenId: topEventId, latestEventId: feedTop.seenId === undefined ? null : topEventId })
  }

  /** Marca el compartimento como lleno en la API y vuelve a consultar. */
  const refill = useCallback(
    async (compartment) => {
      await pillService.updateStock(compartment.medicationId, compartment.capacity)
      await load()
    },
    [load],
  )

  const lastSeenAt = data?.lastSeenAt ?? null

  return {
    isLoading: !data && !error,
    error: data ? null : error,
    tiles,
    compartments,
    slots,
    currentSlot: currentSlotIndex(slots, now),
    events,
    latestEventId: feedTop.latestEventId,
totals,
    lowCompartments: lowStock,
    lastSyncAt: data?.syncedAt ?? 0,
    lastSeenAt,
    isDispenserOnline: lastSeenAt !== null && now.getTime() - lastSeenAt <= DISPENSER_ONLINE_MS,
    refill,
    sync: load,
  }
}
