import { useMemo } from 'react'
import { patientSummaries } from '../utils/selectors'
import { useDataState } from './useDataContext'
import useNow from './useNow'

/**
 * Número de medicamentos activos y próxima dosis de cada paciente, por id.
 * Se recalcula cuando cambian los datos y cada minuto.
 *
 * @returns {Map<string, import('../utils/selectors').PatientSummary>}
 */
export default function usePatientSummaries() {
  const { patients, assignments } = useDataState()
  const now = useNow()
  return useMemo(() => patientSummaries(patients, assignments, now), [patients, assignments, now])
}
