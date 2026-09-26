import { useCallback, useEffect, useState } from 'react'
import * as assignmentService from '../services/assignmentService'
import * as patientService from '../services/patientService'
import * as pillService from '../services/pillService'

const EMPTY = { patients: [], medications: [], assignments: [] }

/** Reemplaza el registro con el mismo id o lo agrega al final. */
const upsert = (list, item) =>
  list.some((current) => current.id === item.id)
    ? list.map((current) => (current.id === item.id ? item : current))
    : [...list, item]

/**
 * Pacientes, catálogo y asignaciones de la API para la página de Pacientes,
 * con acciones para reflejar lo que ya se guardó en el backend.
 */
export default function usePatientsData() {
  const [data, setData] = useState(EMPTY)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    Promise.all([patientService.list(), pillService.listMedications(), assignmentService.list()])
      .then(([patients, medications, assignments]) => {
        if (ignore) return
        setData({ patients, medications, assignments })
        setError(null)
      })
      .catch((err) => {
        if (!ignore) setError(err)
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const savePatient = useCallback((patient) => setData((current) => ({ ...current, patients: upsert(current.patients, patient) })), [])

  /** Quita al paciente y, como hizo la API, sus asignaciones. */
  const removePatient = useCallback(
    (patientId) =>
      setData((current) => ({
        ...current,
        patients: current.patients.filter((patient) => patient.id !== patientId),
        assignments: current.assignments.filter((assignment) => assignment.patientId !== patientId),
      })),
    [],
  )

  /** @param {{ patient: object, assignments: object[] }} restored */
  const addRestoredPatient = useCallback(
    ({ patient, assignments }) =>
      setData((current) => ({
        ...current,
        patients: [...current.patients, patient],
        assignments: [...current.assignments, ...assignments],
      })),
    [],
  )

  const saveAssignment = useCallback(
    (assignment) => setData((current) => ({ ...current, assignments: upsert(current.assignments, assignment) })),
    [],
  )

  const removeAssignment = useCallback(
    (assignmentId) =>
      setData((current) => ({
        ...current,
        assignments: current.assignments.filter((assignment) => assignment.id !== assignmentId),
      })),
    [],
  )

  return {
    ...data,
    isLoading,
    error,
    savePatient,
    removePatient,
    addRestoredPatient,
    saveAssignment,
    removeAssignment,
  }
}
