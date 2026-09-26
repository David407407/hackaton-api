import clsx from 'clsx'
import { Clock, Pill } from 'lucide-react'
import { memo } from 'react'
import CardColorBadge from './CardColorBadge'
import PatientActionsMenu from './PatientActionsMenu'
import PatientAvatar from './PatientAvatar'
import PatientStatusBadge from './PatientStatusBadge'
import InfoTile from '../ui/InfoTile'
import { CARD_COLORS } from '../../constants/cardColors'

const SELECTION = {
  active: 'ring-2 ring-teal',
  idle: 'ring-1 ring-ink/5',
}

/**
 * Tarjeta de un paciente. Toda la tarjeta abre el detalle (el nombre es un
 * botón cuyo área se estira sobre la tarjeta); el menú ⋯ queda por encima.
 *
 * @param {object} props
 * @param {import('../../services/patientsService').Patient} props.patient
 * @param {number} props.medsCount Asignaciones activas.
 * @param {string} props.nextDoseLabel "14:30", "Mañana 08:00"…
 * @param {boolean} props.isActive Su detalle está abierto.
 * @param {(patient: import('../../services/patientsService').Patient) => void} props.onOpen
 * @param {(patient: import('../../services/patientsService').Patient) => void} props.onEdit
 * @param {(patient: import('../../services/patientsService').Patient) => void} props.onDelete
 *   Los tres handlers deben ser estables (useCallback) para que memo sirva.
 */
function PatientCard({ patient, medsCount, nextDoseLabel, isActive, onOpen, onEdit, onDelete }) {
  const { name, age, card, status } = patient
  const cardColor = CARD_COLORS[card]

  return (
    <article
      className={clsx(
        'relative rounded-3xl bg-white p-5 shadow-card transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-card-hover',
        // Con el menú abierto, la tarjeta queda por encima de las vecinas.
        'has-[[aria-expanded=true]]:z-20',
        SELECTION[isActive ? 'active' : 'idle'],
      )}
    >
      <div className="absolute right-3 top-3 z-10">
        <PatientActionsMenu patient={patient} onView={onOpen} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div className="flex items-start gap-4 pr-8">
        <div className="relative shrink-0">
          <PatientAvatar patient={patient} size={64} className="ring-4 ring-cream" />
          <span
            aria-hidden
            className={clsx('absolute bottom-0 right-0 size-4 rounded-full ring-[3px] ring-white', cardColor?.bg)}
          />
        </div>
        <div className="min-w-0">
          <p className="whitespace-nowrap text-xs font-medium text-ink/60">{age} años</p>
          <h2 className="mt-0.5 text-[17px] font-semibold leading-tight text-ink">
            <button
              type="button"
              onClick={() => onOpen(patient)}
              aria-label={`Ver detalle de ${name}`}
              className={clsx(
                'text-left outline-hidden after:absolute after:inset-0 after:rounded-3xl after:transition',
                'focus-visible:after:ring-4 focus-visible:after:ring-teal/30',
              )}
            >
              {name}
            </button>
          </h2>
          {cardColor ? <CardColorBadge color={card} className="mt-2" /> : null}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoTile label="Próxima dosis" icon={Clock} iconClassName="text-teal">
          {nextDoseLabel}
        </InfoTile>
        <InfoTile label="Medicamentos" icon={Pill} iconClassName="text-indigo">
          {medsCount} {medsCount === 1 ? 'activo' : 'activos'}
        </InfoTile>
      </div>

      <div className="mt-4">
        {status ? <PatientStatusBadge status={status} /> : null}
      </div>
    </article>
  )
}

export default memo(PatientCard)
