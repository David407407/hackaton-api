import { useMemo } from 'react'
import { patientsByMedication } from '../utils/selectors'
import { useDataState } from './useDataContext'

/**
 * Pacientes con cada medicamento asignado y activo, por id de medicamento.
 *
 * @returns {Map<string, import('../services/patientsService').Patient[]>}
 */
export default function usePatientsByMedication() {
  const { patients, assignments } = useDataState()
  return useMemo(() => patientsByMedication(assignments, patients), [assignments, patients])
}
