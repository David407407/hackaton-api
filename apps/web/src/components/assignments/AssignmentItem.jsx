import clsx from 'clsx'
import { Clock, Pencil, Pill, Trash2 } from 'lucide-react'
import { memo } from 'react'
import CompartmentBadge from '../medications/CompartmentBadge'
import DropdownMenu from '../ui/DropdownMenu'
import Switch from '../ui/Switch'
import { medicationLabel } from '../../utils/labels'
import { formatDays, formatISODate, pillsLabel } from '../../utils/schedule'

const STATE = {
  active: 'bg-cream/55',
  inactive: 'bg-ink/4',
}

/**
 * Una asignación dentro del detalle del paciente: medicamento, compartimento,
 * dosis, horarios, días e instrucciones, con switch de activo y menú ⋯.
 *
 * @param {object} props
 * @param {import('../../services/assignmentsService').Assignment} props.assignment
 * @param {import('../../services/medicationsService').Medication} props.medication
 * @param {(assignment: import('../../services/assignmentsService').Assignment, active: boolean) => void} props.onToggle
 * @param {(assignment: import('../../services/assignmentsService').Assignment) => void} props.onEdit
 * @param {(assignment: import('../../services/assignmentsService').Assignment) => void} props.onRemove
 *   Los tres handlers deben ser estables (useCallback) para que memo sirva.
 */
function AssignmentItem({ assignment, medication, onToggle, onEdit, onRemove }) {
  const label = medicationLabel(medication)
  const state = assignment.active ? 'active' : 'inactive'
  const details = [formatDays(assignment.days), assignment.instructions].filter(Boolean)
  if (assignment.endDate) details.push(`Hasta ${formatISODate(assignment.endDate)}`)

  return (
    <li className={clsx('rounded-2xl p-4 transition-colors', STATE[state])}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-teal shadow-card">
          <Pill aria-hidden className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={clsx('font-semibold leading-tight', assignment.active ? 'text-ink' : 'text-ink/55')}>{label}</p>
          <p className="text-xs text-ink/55">{assignment.active ? medication.form : `${medication.form} · Pausado`}</p>
        </div>
        <Switch
          checked={assignment.active}
          onCheckedChange={(active) => onToggle(assignment, active)}
          label={`${label} activo`}
          className="mt-2"
        />
        <DropdownMenu
          label={`Acciones de ${label}`}
          items={[
            { id: 'edit', label: 'Editar', icon: Pencil, onSelect: () => onEdit(assignment) },
            { id: 'remove', label: 'Quitar', icon: Trash2, tone: 'danger', onSelect: () => onRemove(assignment) },
          ]}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <CompartmentBadge compartmentId={medication.compartmentId} warnWhenEmpty />
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink ring-1 ring-ink/8">
          {pillsLabel(assignment.quantity)}
        </span>
        {assignment.times.map((time) => (
          <span
            key={time}
            className="inline-flex items-center gap-1 rounded-full bg-teal/12 px-2.5 py-1 text-xs font-semibold text-ink tabular-nums"
          >
            <Clock aria-hidden className="size-3 text-teal" />
            {time}
          </span>
        ))}
      </div>

      <p className="mt-2 text-xs text-ink/60">{details.join(' · ')}</p>
    </li>
  )
}

export default memo(AssignmentItem)
