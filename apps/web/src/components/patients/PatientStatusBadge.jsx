import clsx from 'clsx'
import { CircleCheck, Clock3, TriangleAlert } from 'lucide-react'

const STATUSES = {
  ok: { label: 'Dosis tomada', icon: CircleCheck, className: 'bg-online-soft text-online-ink' },
  pending: { label: 'Próxima dosis', icon: Clock3, className: 'bg-indigo/10 text-indigo' },
  alert: { label: 'Requiere atención', icon: TriangleAlert, className: 'bg-warn-soft text-warn-ink' },
}

/**
 * Estado de la medicación del paciente.
 *
 * @param {object} props
 * @param {keyof typeof STATUSES} props.status
 */
function PatientStatusBadge({ status }) {
  const config = STATUSES[status]
  if (!config) return null
  const { label, icon: Icon, className } = config

  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', className)}>
      <Icon aria-hidden className="size-3.5" />
      {label}
    </span>
  )
}

export default PatientStatusBadge
