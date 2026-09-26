import clsx from 'clsx'
import { memo } from 'react'
import ProgressBar from '../ui/ProgressBar'
import { CARD_COLORS } from '../../constants/cardColors'
import { STOCK_FILL } from '../../constants/inventory'
import { isLow, patientsLabel, stockFillLevel, stockPct } from '../../utils/inventorySelectors'

const TILE = {
  ok: 'bg-cream/50',
  low: 'bg-warn-soft/45 ring-1 ring-warn/20',
}

const PCT_TEXT = {
  ok: 'text-ink/60',
  low: 'text-warn-ink',
}

/** Puntos de tarjeta visibles por compartimento. */
const MAX_CARD_DOTS = 3

/**
 * Un compartimento del dispensador: medicamento, pacientes, sus tarjetas y el
 * nivel medido por el sensor.
 *
 * @param {object} props
 * @param {import('../../utils/inventorySelectors').Compartment} props.compartment
 */
function CompartmentTile({ compartment }) {
  const pct = stockPct(compartment)
  const state = isLow(compartment) ? 'low' : 'ok'
  const cardDots = compartment.patients.slice(0, MAX_CARD_DOTS)

  return (
    <li className={clsx('rounded-2xl p-4 transition-colors', TILE[state])}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink/55">C{compartment.id}</p>
        <span className="flex -space-x-1">
          {cardDots.map((patient) => (
            <span
              key={patient.id}
              title={`Tarjeta ${CARD_COLORS[patient.card].label}`}
              className={clsx('size-3 rounded-full ring-2 ring-white', CARD_COLORS[patient.card].bg)}
            >
              <span className="sr-only">Tarjeta {CARD_COLORS[patient.card].label}</span>
            </span>
          ))}
        </span>
      </div>
      <p className="mt-1.5 truncate text-sm font-semibold text-ink">{compartment.medication}</p>
      <p className="truncate text-xs text-ink/60">
        {compartment.dose} · {patientsLabel(compartment.patients)}
      </p>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-ink">
          <span className="text-xl font-bold leading-none tabular-nums">{compartment.left}</span>
          <span className="text-xs font-semibold text-ink/50"> / {compartment.capacity}</span>
        </p>
        <p className={clsx('text-xs font-bold tabular-nums', PCT_TEXT[state])}>{pct}%</p>
      </div>
      <ProgressBar
        value={pct}
        label={`Nivel de ${compartment.medication}`}
        trackClassName="bg-white"
        fillClassName={STOCK_FILL[stockFillLevel(pct)]}
        className="mt-2 h-2"
      />
    </li>
  )
}

export default memo(CompartmentTile)
