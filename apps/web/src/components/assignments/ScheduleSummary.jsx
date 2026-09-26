import { CalendarClock } from 'lucide-react'
import { medicationLabel } from '../../utils/labels'
import { describeSchedule } from '../../utils/schedule'

/**
 * Resumen en vivo de una asignación: "1 pastilla de Metformina 850 mg a las
 * 08:00 y 20:00, todos los días". Se anuncia al cambiar (aria-live).
 *
 * @param {object} props
 * @param {import('../../services/medicationsService').Medication | null} props.medication
 * @param {number | ''} props.quantity
 * @param {string[]} props.times
 * @param {'daily' | number[]} props.days
 */
function ScheduleSummary({ medication, quantity, times, days }) {
  const text =
    medication && Number.isInteger(quantity)
      ? describeSchedule({ quantity, medicationLabel: medicationLabel(medication), times, days })
      : 'Elige un medicamento para ver el resumen.'

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-teal/8 p-4 ring-1 ring-teal/15">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-teal shadow-card">
        <CalendarClock aria-hidden className="size-[18px]" />
      </span>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-ink/55">Resumen</p>
        <p aria-live="polite" className="mt-0.5 text-sm font-semibold text-ink">
          {text}
        </p>
      </div>
    </div>
  )
}

export default ScheduleSummary
