import clsx from 'clsx'

const STATES = {
  active: 'bg-ink text-white shadow-card',
  inactive: 'bg-white text-ink/75 ring-1 ring-ink/10 hover:text-ink',
}

/**
 * Chip de filtro conmutable, con punto de color opcional.
 *
 * @param {object} props
 * @param {boolean} props.pressed
 * @param {() => void} props.onClick
 * @param {string} [props.dotClassName] Clase de fondo del punto; sin ella no se muestra.
 * @param {import('react').ReactNode} props.children
 */
function FilterChip({ pressed, onClick, dotClassName, children }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition',
        'focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30',
        STATES[pressed ? 'active' : 'inactive'],
      )}
    >
      {dotClassName && <span aria-hidden className={clsx('size-2.5 rounded-full', dotClassName)} />}
      {children}
    </button>
  )
}

export default FilterChip
