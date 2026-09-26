import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { ALL_CARD_COLORS } from '../constants/cardColors'

/** Minúsculas y sin acentos: "Rosa María" → "rosa maria". */
const normalize = (text) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

/**
 * Búsqueda por nombre (sin distinguir mayúsculas ni acentos) y filtro por
 * color de tarjeta.
 *
 * @param {import('../services/patientsService').Patient[]} patients
 */
export default function usePatientFilters(patients) {
  const [search, setSearch] = useState('')
  const [cardColor, setCardColor] = useState(ALL_CARD_COLORS)
  const deferredSearch = useDeferredValue(search)

  const filteredPatients = useMemo(() => {
    const query = normalize(deferredSearch)
    return patients.filter(
      (patient) =>
        (cardColor === ALL_CARD_COLORS || patient.card === cardColor) &&
        (!query || normalize(patient.name ?? '').includes(query)),
    )
  }, [patients, cardColor, deferredSearch])

  const clearFilters = useCallback(() => {
    setSearch('')
    setCardColor(ALL_CARD_COLORS)
  }, [])

  return { search, setSearch, cardColor, setCardColor, filteredPatients, clearFilters }
}
