import clsx from 'clsx'
import { Check, Nfc } from 'lucide-react'
import Field from '../ui/Field'
import { describedByOf } from '../ui/fieldIds'
import { CARD_COLORS } from '../../constants/cardColors'
import { patientShortName } from '../../utils/labels'

const CARD_OPTIONS = Object.entries(CARD_COLORS).map(([value, { label, bg }]) => ({ value, label, bg }))

/**
 * Las 6 tarjetas físicas como radio group. Las que ya tienen dueño se ven
 * deshabilitadas con su nombre (la del paciente que se edita sigue libre).
 * Las flechas mueven la selección y saltan las ocupadas (radios nativos).
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.name
 * @param {string} props.value Color elegido.
 * @param {(color: string) => void} props.onValueChange
 * @param {Map<string, import('../../services/patientsService').Patient>} props.owners Dueño de cada tarjeta.
 * @param {string} [props.currentPatientId] Paciente que se edita.
 * @param {string} [props.error]
 */
function CardColorPicker({ id, name, value, onValueChange, owners, currentPatientId, error }) {
  return (
    <Field id={id} label="Tarjeta de color" error={error} group>
      <div className="grid grid-cols-3 gap-3">
        {CARD_OPTIONS.map((option) => {
          const owner = owners.get(option.value)
          const takenBy = owner && owner.id !== currentPatientId ? owner : null
          const isCurrent = Boolean(owner) && owner.id === currentPatientId
          const isSelected = value === option.value

          return (
            <label
              key={option.value}
              title={takenBy ? `Asignada a ${takenBy.name}` : undefined}
              className={clsx('group block', takenBy ? 'cursor-not-allowed' : 'cursor-pointer')}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                disabled={Boolean(takenBy)}
                onChange={() => onValueChange(option.value)}
                aria-describedby={describedByOf(id, { error })}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={clsx(
                  'relative block aspect-[1.58] rounded-xl shadow-card transition duration-200',
                  'peer-focus-visible:ring-4 peer-focus-visible:ring-teal/40',
                  option.bg,
                  takenBy && 'opacity-35 saturate-50',
                  !takenBy && 'group-hover:-translate-y-0.5',
                  isSelected && 'ring-4 ring-teal ring-offset-2',
                )}
              >
                <span className="absolute left-2 top-2 h-2.5 w-3.5 rounded-[3px] bg-white/70" />
                <Nfc strokeWidth={2.5} className="absolute bottom-2 right-2 size-4 text-white" />
                {isSelected && (
                  <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-teal text-white shadow-card">
                    <Check strokeWidth={3} className="size-3.5" />
                  </span>
                )}
              </span>
              <span className="mt-1.5 block text-center text-xs font-semibold text-ink">{option.label}</span>
              <span className={clsx('block truncate text-center text-[11px]', takenBy ? 'text-ink/55' : 'text-online-ink')}>
                {takenBy ? patientShortName(takenBy) : isCurrent ? 'Actual' : 'Disponible'}
              </span>
              {takenBy && <span className="sr-only">Asignada a {takenBy.name}</span>}
            </label>
          )
        })}
      </div>
    </Field>
  )
}

export default CardColorPicker
