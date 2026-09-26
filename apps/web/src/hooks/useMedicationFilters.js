import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { MEDICATION_FILTERS } from '../constants/medications'
import { isLowStock } from '../utils/selectors'

/** Minúsculas y sin acentos: "Losartán" → "losartan". */
const normalize = (text) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

/** Condición de cada filtro. */
const PREDICATES = {
  [MEDICATION_FILTERS.all]: () => true,
  [MEDICATION_FILTERS.loaded]: (medication) => medication.compartmentId !== null,
  [MEDICATION_FILTERS.unloaded]: (medication) => medication.compartmentId === null,
  [MEDICATION_FILTERS.lowStock]: isLowStock,
}

/**
 * Búsqueda por nombre y filtro (todos, en dispensador, sin compartimento,
 * stock bajo), con el total de cada filtro para los chips.
 *
 * @param {import('../services/medicationsService').Medication[]} medications
 */
export default function useMedicationFilters(medications) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState(MEDICATION_FILTERS.all)
  const deferredSearch = useDeferredValue(search)

  const counts = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(PREDICATES).map(([key, predicate]) => [key, medications.filter(predicate).length]),
      ),
    [medications],
  )

  const filteredMedications = useMemo(() => {
    const query = normalize(deferredSearch)
    return medications.filter(
      (medication) => PREDICATES[filter](medication) && (!query || normalize(medication.name).includes(query)),
    )
  }, [medications, filter, deferredSearch])

  const clearFilters = useCallback(() => {
    setSearch('')
    setFilter(MEDICATION_FILTERS.all)
  }, [])

  return { search, setSearch, filter, setFilter, counts, filteredMedications, clearFilters }
}
