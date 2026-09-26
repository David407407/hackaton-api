import { useId } from 'react'
import FilterChip from '../ui/FilterChip'
import { MEDICATION_FILTERS } from '../../constants/medications'

const OPTIONS = [
  { value: MEDICATION_FILTERS.all, label: 'Todos' },
  { value: MEDICATION_FILTERS.loaded, label: 'En dispensador' },
  { value: MEDICATION_FILTERS.unloaded, label: 'Sin compartimento' },
  { value: MEDICATION_FILTERS.lowStock, label: 'Stock bajo', dot: 'bg-warn' },
]

/**
 * Chips de filtro del catálogo y contador de resultados (se anuncia al cambiar).
 *
 * @param {object} props
 * @param {string} props.filter
 * @param {(filter: string) => void} props.onFilterChange
 * @param {Record<string, number>} props.counts Total de cada filtro.
 * @param {number} props.resultCount
 * @param {number} props.totalCount
 * @param {boolean} props.isLoading
 */
function MedicationsToolbar({ filter, onFilterChange, counts, resultCount, totalCount, isLoading }) {
  const labelId = useId()

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
      <div role="group" aria-labelledby={labelId} className="flex flex-wrap items-center gap-2">
        <span id={labelId} className="mr-1 text-sm font-semibold text-ink">
          Mostrar
        </span>
        {OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            pressed={filter === option.value}
            onClick={() => onFilterChange(option.value)}
            dotClassName={option.dot}
          >
            {option.label}
            {!isLoading && <span className="ml-0.5 opacity-60 tabular-nums">{counts[option.value]}</span>}
          </FilterChip>
        ))}
      </div>
      <p aria-live="polite" className="text-sm text-ink/60">
        {isLoading ? 'Cargando catálogo…' : `${resultCount} de ${totalCount} medicamentos`}
      </p>
    </div>
  )
}

export default MedicationsToolbar
