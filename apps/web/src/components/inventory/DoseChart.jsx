import clsx from 'clsx'
import { memo, useMemo, useState } from 'react'
import ChartTooltip from './ChartTooltip'
import { formatSlotHour } from '../../utils/inventorySelectors'

/* ---------- Geometría (funciones puras) ---------- */

const VIEW = { width: 430, height: 250 }
const PADDING = { top: 22, right: 6, bottom: 30, left: 26 }
/** Escala mínima del eje Y; crece de 3 en 3 si algún horario tiene más dosis. */
const MIN_Y_MAX = 6
const Y_TICK_COUNT = 3
const BAR_WIDTH = 24
const BAR_RADIUS = 9
/** Separación entre la barra más alta de la columna y el punto / tooltip. */
const MARKER_GAP = 9
const TOOLTIP_GAP = 16

const PLOT_WIDTH = VIEW.width - PADDING.left - PADDING.right
const PLOT_HEIGHT = VIEW.height - PADDING.top - PADDING.bottom
const BASELINE = PADDING.top + PLOT_HEIGHT

/**
 * Tope del eje Y: 6 o el siguiente múltiplo de 3 que quepa el horario más alto.
 *
 * @param {import('../../utils/inventorySelectors').DoseSlotState[]} slots
 */
function computeYMax(slots) {
  const highest = Math.max(0, ...slots.map((slot) => Math.max(slot.planned, slot.dispensed)))
  return Math.max(MIN_Y_MAX, Math.ceil(highest / Y_TICK_COUNT) * Y_TICK_COUNT)
}

/** @param {number} yMax */
const yTicks = (yMax) => Array.from({ length: Y_TICK_COUNT + 1 }, (_, index) => (yMax / Y_TICK_COUNT) * index)

/** @param {number} value Dosis (0–yMax). @param {number} yMax */
const yScale = (value, yMax) => BASELINE - (Math.min(value, yMax) / yMax) * PLOT_HEIGHT

/** @param {number} value @param {number} yMax */
function barRect(centerX, value, yMax) {
  const y = yScale(value, yMax)
  return { x: centerX - BAR_WIDTH / 2, y, width: BAR_WIDTH, height: BASELINE - y }
}

/**
 * Posición de cada columna en unidades del viewBox.
 *
 * @param {import('../../utils/inventorySelectors').DoseSlotState[]} slots
 * @param {number} yMax
 */
function buildColumns(slots, yMax) {
  const columnWidth = PLOT_WIDTH / slots.length
  return slots.map((slot, index) => {
    const x = PADDING.left + index * columnWidth
    const centerX = x + columnWidth / 2
    return {
      slot,
      hitArea: { x, y: PADDING.top - 12, width: columnWidth, height: PLOT_HEIGHT + PADDING.bottom + 10 },
      planned: barRect(centerX, slot.planned, yMax),
      dispensed: barRect(centerX, slot.dispensed, yMax),
      centerX,
      topY: yScale(Math.max(slot.planned, slot.dispensed), yMax),
    }
  })
}

/* ---------- Estilos ---------- */

const GRID_LINE = {
  base: { className: 'stroke-ink/18', dash: undefined },
  guide: { className: 'stroke-ink/7', dash: '3 5' },
}

const X_LABEL = {
  current: 'fill-ink font-bold',
  other: 'fill-ink/55 font-medium',
}

/**
 * Barras de dosis programadas (atrás) vs. dispensadas (adelante) por horario.
 * Cada columna se puede enfocar con Tab y muestra su tooltip; sin hover ni
 * foco, el tooltip queda sobre el horario actual.
 *
 * @param {object} props
 * @param {import('../../utils/inventorySelectors').DoseSlotState[]} props.slots
 * @param {number} props.currentIndex Índice del horario actual.
 * @param {string} [props.className]
 */
function DoseChart({ slots, currentIndex, className }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const yMax = useMemo(() => computeYMax(slots), [slots])
  const columns = useMemo(() => buildColumns(slots, yMax), [slots, yMax])

  const dispensed = slots.reduce((sum, slot) => sum + slot.dispensed, 0)
  const planned = slots.reduce((sum, slot) => sum + slot.planned, 0)

  const tooltipColumn = columns[activeIndex ?? currentIndex]
  const { slot: tooltipSlot } = tooltipColumn

  return (
    <div className={clsx('relative', className)} onMouseLeave={() => setActiveIndex(null)}>
      <svg
        viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
        className="w-full overflow-visible"
        role="img"
        aria-label={`${dispensed} de ${planned} dosis dispensadas hoy`}
      >
        {yTicks(yMax).map((tick) => {
          const line = GRID_LINE[tick === 0 ? 'base' : 'guide']
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={VIEW.width - PADDING.right}
                y1={yScale(tick, yMax)}
                y2={yScale(tick, yMax)}
                strokeDasharray={line.dash}
                className={line.className}
              />
              <text
                x={PADDING.left - 10}
                y={yScale(tick, yMax) + 4}
                textAnchor="end"
                className="fill-ink/55 text-[11px] tabular-nums"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {columns.map((column, index) => {
          const { slot } = column
          const isCurrent = index === currentIndex
          return (
            <g
              key={slot.hour}
              tabIndex={0}
              aria-label={`${formatSlotHour(slot.hour)}: ${slot.dispensed} de ${slot.planned} dosis`}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(null)}
              className="group cursor-default outline-hidden"
            >
              <rect
                {...column.hitArea}
                rx={12}
                strokeWidth={3}
                className="fill-transparent stroke-transparent group-focus-visible:fill-teal/5 group-focus-visible:stroke-teal/30"
              />
              <rect
                {...column.planned}
                rx={BAR_RADIUS}
                className="fill-mist opacity-45 transition-opacity group-hover:opacity-75 group-focus-visible:opacity-75"
              />
              <rect
                {...column.dispensed}
                rx={BAR_RADIUS}
                className="fill-teal motion-safe:transition-[y,height] motion-safe:duration-600 motion-safe:ease-[cubic-bezier(.2,.8,.2,1)]"
              />
              {isCurrent && <circle cx={column.centerX} cy={column.topY - MARKER_GAP} r={3} className="fill-indigo" />}
              <text
                x={column.centerX}
                y={BASELINE + 19}
                textAnchor="middle"
                className={clsx('text-[10.5px]', X_LABEL[isCurrent ? 'current' : 'other'])}
              >
                {String(slot.hour).padStart(2, '0')}h
              </text>
            </g>
          )
        })}
      </svg>

      <ChartTooltip
        x={(tooltipColumn.centerX / VIEW.width) * 100}
        y={((tooltipColumn.topY - TOOLTIP_GAP) / VIEW.height) * 100}
        title={formatSlotHour(tooltipSlot.hour)}
        detail={`${tooltipSlot.dispensed} de ${tooltipSlot.planned} dosis`}
      />
    </div>
  )
}

export default memo(DoseChart)
