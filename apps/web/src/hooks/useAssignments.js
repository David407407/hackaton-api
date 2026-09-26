import { useCallback, useMemo } from 'react'
import { assignmentsOf } from '../utils/selectors'
import { useDataActions, useDataState } from './useDataContext'

/** Activas primero; dentro de cada grupo, por su primer horario. */
function compareAssignments(a, b) {
  return Number(b.active) - Number(a.active) || a.times[0].localeCompare(b.times[0])
}

/**
 * Asignaciones de un paciente y sus acciones. Sin `patientId` devuelve todas
 * (sin ordenar), para los derivados que cruzan pacientes.
 *
 * @param {string} [patientId]
 */
export default function useAssignments(patientId) {
  const { assignments, status, error } = useDataState()
  const { createAssignment, updateAssignment, deleteAssignment, restoreAssignment } = useDataActions()

  const list = useMemo(
    () => (patientId ? assignmentsOf(assignments, patientId).sort(compareAssignments) : assignments),
    [assignments, patientId],
  )

  const toggleAssignment = useCallback((id, active) => updateAssignment(id, { active }), [updateAssignment])

  return {
    assignments: list,
    isLoading: status === 'loading',
    error,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    restoreAssignment,
    toggleAssignment,
  }
}
