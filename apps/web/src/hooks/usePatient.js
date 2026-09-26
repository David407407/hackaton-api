import { useMemo } from 'react'
import { formatNextDose } from '../utils/schedule'
import { medsCount, nextDose } from '../utils/selectors'
import { useDataState } from './useDataContext'
import useNow from './useNow'

/**
 * Un paciente con sus derivados. `patient` es null si no existe (o ya se borró).
 *
 * @param {string | null} id
 */
export default function usePatient(id) {
  const { patients, assignments, status, error } = useDataState()
  const now = useNow()

  const patient = useMemo(() => patients.find((item) => item.id === id) ?? null, [patients, id])
  const summary = useMemo(() => {
    if (!patient) return { medsCount: 0, nextDoseLabel: formatNextDose(null) }
    return {
      medsCount: medsCount(assignments, patient.id),
      nextDoseLabel: formatNextDose(nextDose(assignments, patient.id, now)),
    }
  }, [assignments, patient, now])

  return { patient, ...summary, isLoading: status === 'loading', error }
}
