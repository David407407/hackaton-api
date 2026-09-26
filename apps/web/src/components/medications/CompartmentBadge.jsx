import clsx from 'clsx'
import { Box, TriangleAlert } from 'lucide-react'
import { compartmentLabel } from '../../utils/labels'

const VARIANTS = {
  loaded: 'bg-mist/50 text-ink',
  unloaded: 'bg-ink/6 text-ink/60',
  warning: 'bg-warning-soft text-warning-ink',
}

/**
 * Compartimento del dispensador donde está el medicamento, o "Sin
 * compartimento". Con `warnWhenEmpty` el caso vacío se pinta como advertencia.
 *
 * @param {object} props
 * @param {number | null} props.compartmentId
 * @param {boolean} [props.long=false] "Compartimento C1" en lugar de "C1".
 * @param {boolean} [props.warnWhenEmpty=false]
 * @param {string} [props.className]
 */
function CompartmentBadge({ compartmentId, long = false, warnWhenEmpty = false, className }) {
  const isLoaded = compartmentId !== null
  const variant = isLoaded ? 'loaded' : warnWhenEmpty ? 'warning' : 'unloaded'
  const Icon = variant === 'warning' ? TriangleAlert : Box

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold',
        VARIANTS[variant],
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {isLoaded ? `${long ? 'Compartimento ' : ''}${compartmentLabel(compartmentId)}` : 'Sin compartimento'}
    </span>
  )
}

export default CompartmentBadge
