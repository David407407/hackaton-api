import { useMemo } from 'react'
import { useDataActions, useDataState } from './useDataContext'

/**
 * Orden del catálogo: primero los cargados en el dispensador (C1…C6) y luego
 * el resto por nombre.
 */
function compareMedications(a, b) {
  const slotA = a.compartmentId ?? Infinity
  const slotB = b.compartmentId ?? Infinity
  return slotA - slotB || a.name.localeCompare(b.name, 'es')
}

/**
 * Catálogo de medicamentos (ordenado) y sus acciones.
 */
export default function useMedications() {
  const { medications, status, error } = useDataState()
  const { createMedication, updateMedication, deleteMedication, restoreMedication, dispenseMedication } =
    useDataActions()

  const sorted = useMemo(() => [...medications].sort(compareMedications), [medications])

  return {
    medications: sorted,
    isLoading: status === 'loading',
    error,
    createMedication,
    updateMedication,
    deleteMedication,
    restoreMedication,
    dispenseMedication,
  }
}
