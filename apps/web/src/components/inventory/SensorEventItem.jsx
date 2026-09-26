import clsx from 'clsx'
import { Nfc, TriangleAlert } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { CARD_COLORS } from '../../constants/cardColors'
import { SENSOR_EVENT } from '../../constants/inventory'
import { formatTime } from '../../utils/formatDate'

/** Tiempo que un evento recién llegado se queda resaltado antes de desvanecerse. */
const HIGHLIGHT_MS = 1600

/** Ícono y textos de cada tipo de evento. */
const VARIANTS = {
  [SENSOR_EVENT.doseDispensed]: {
    icon: Nfc,
    iconBox: 'bg-teal/12 text-teal',
    title: (event) =>
      event.card ? `Tarjeta ${CARD_COLORS[event.card].label} · ${event.patientName}` : 'Dosis entregada',
    detail: (event) => `Dosis entregada: ${event.medication} ${event.dose}`,
  },
  [SENSOR_EVENT.lowStock]: {
    icon: TriangleAlert,
    iconBox: 'bg-warn-soft text-warn-ink',
    title: (event) => `Sensor de nivel: ${event.medication} bajo`,
    detail: (event) => event.patientName ?? `Compartimento C${event.compartmentId}`,
  },
}

const HIGHLIGHT = {
  fresh: 'bg-mist/35',
  idle: 'bg-transparent',
}

/**
 * Un evento del feed del sensor. Si acaba de llegar (`isNew`) aparece
 * resaltado y se desvanece solo.
 *
 * @param {object} props
 * @param {import('../../hooks/useDispenser').FeedEvent} props.event
 * @param {boolean} props.isNew
 */
function SensorEventItem({ event, isNew }) {
  const [hasFaded, setHasFaded] = useState(false)
  const variant = VARIANTS[event.type]
  const Icon = variant.icon

  useEffect(() => {
    if (!isNew) return
    const timeoutId = setTimeout(() => setHasFaded(true), HIGHLIGHT_MS)
    return () => clearTimeout(timeoutId)
  }, [isNew])

  return (
    <li
      className={clsx(
        'flex items-start gap-3 rounded-2xl p-3 transition-colors duration-500',
        HIGHLIGHT[isNew && !hasFaded ? 'fresh' : 'idle'],
      )}
    >
      <span className={clsx('grid size-8 shrink-0 place-items-center rounded-xl', variant.iconBox)}>
        <Icon aria-hidden className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink">{variant.title(event)}</p>
        <p className="truncate text-xs text-ink/60">{variant.detail(event)}</p>
      </div>
      <time dateTime={new Date(event.at).toISOString()} className="text-[11px] font-medium text-ink/50 tabular-nums">
        {formatTime(event.at)}
      </time>
    </li>
  )
}

export default memo(SensorEventItem)
