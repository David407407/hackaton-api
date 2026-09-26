import { useId } from 'react'
import FilterChip from '../ui/FilterChip'
import { ALL_CARD_COLORS, CARD_COLORS } from '../../constants/cardColors'

const OPTIONS = [
  { value: ALL_CARD_COLORS, label: 'Todas' },
  ...Object.entries(CARD_COLORS).map(([value, { label, bg }]) => ({ value, label, dot: bg })),
]

/**
 * Chips para filtrar por color de tarjeta ("Todas" + un chip por color).
 *
 * @param {object} props
 * @param {string} props.value Color activo o ALL_CARD_COLORS.
 * @param {(value: string) => void} props.onChange
 */
function CardColorFilter({ value, onChange }) {
  const labelId = useId()

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-wrap items-center gap-2">
      <span id={labelId} className="mr-1 text-sm font-semibold text-ink">
        Color de tarjeta
      </span>
      {OPTIONS.map((option) => (
        <FilterChip
          key={option.value}
          pressed={value === option.value}
          onClick={() => onChange(option.value)}
          dotClassName={option.dot}
        >
          {option.label}
        </FilterChip>
      ))}
    </div>
  )
}

export default CardColorFilter
