import clsx from 'clsx'
import DailyProgressRing from './DailyProgressRing'
import DoseChart from './DoseChart'
import Panel from '../ui/Panel'

const LEGEND = [
  { id: 'dispensed', label: 'Dispensadas', swatch: 'bg-teal' },
  { id: 'planned', label: 'Programadas', swatch: 'bg-mist' },
]

/**
 * Panel "Dosis del día": gráfica por horario y anillo de progreso.
 *
 * @param {object} props
 * @param {import('../../utils/inventorySelectors').DoseSlotState[]} props.slots
 * @param {number} props.currentIndex Índice del horario actual.
 * @param {number} props.progressPct 0–100.
 * @param {number} props.pending Dosis que faltan hoy.
 * @param {string} [props.className]
 */
function DoseChartPanel({ slots, currentIndex, progressPct, pending, className }) {
  return (
    <Panel
      title="Dosis del día"
      subtitle="Programadas vs. dispensadas por horario"
      className={className}
      actions={
        <ul className="flex items-center gap-4 text-xs font-medium text-ink/70">
          {LEGEND.map((item) => (
            <li key={item.id} className="flex items-center gap-1.5">
              <span aria-hidden className={clsx('size-2.5 rounded-[4px]', item.swatch)} />
              {item.label}
            </li>
          ))}
        </ul>
      }
    >
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
        <DoseChart slots={slots} currentIndex={currentIndex} className="w-full min-w-0 flex-1" />
        <DailyProgressRing percent={progressPct} pending={pending} />
      </div>
    </Panel>
  )
}

export default DoseChartPanel
