import { useMemo } from 'react'
import { todayDoseSummary } from '../utils/selectors'
import { useDataState } from './useDataContext'
import useNow from './useNow'

/**
 * Tomas programadas hoy y cuántas ya pasaron su hora.
 *
 * @returns {{ scheduled: number, delivered: number }}
 */
export default function useTodayDoses() {
  const { assignments } = useDataState()
  const now = useNow()
  return useMemo(() => todayDoseSummary(assignments, now), [assignments, now])
}
