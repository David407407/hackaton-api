import clsx from 'clsx'
import { Nfc } from 'lucide-react'
import { CARD_COLORS } from '../../constants/cardColors'

/**
 * Tarjeta física asignada: mini tarjeta del color + "Tarjeta <Color>".
 * Siempre lleva texto; el color nunca va solo.
 *
 * @param {object} props
 * @param {keyof typeof CARD_COLORS} props.color
 * @param {string} [props.className]
 */
function CardColorBadge({ color, className }) {
  const swatch = CARD_COLORS[color]
  if (!swatch) return null
  const { label, bg } = swatch

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-cream/70 py-1 pl-1 pr-3 text-xs font-semibold text-ink ring-1 ring-ink/10',
        className,
      )}
    >
      <span aria-hidden className={clsx('relative h-5 w-7 shrink-0 rounded-[5px]', bg)}>
        <span className="absolute left-1 top-1 h-1.5 w-2 rounded-[1.5px] bg-white/70" />
        <Nfc strokeWidth={2.5} className="absolute right-0.5 top-1/2 size-[11px] -translate-y-1/2 text-white" />
      </span>
      Tarjeta {label}
    </span>
  )
}

export default CardColorBadge
