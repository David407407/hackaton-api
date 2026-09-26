import clsx from 'clsx'
import { Minus, Plus } from 'lucide-react'
import Field from './Field'
import { CONTROL_BOX, controlRing, describedByOf } from './fieldIds'

const STEP_BUTTON =
  'grid size-9 shrink-0 place-items-center rounded-xl bg-white text-ink shadow-card ring-1 ring-ink/8 transition ' +
  'enabled:hover:text-teal disabled:cursor-not-allowed disabled:opacity-40'

/** Número entero o '' mientras el campo está vacío. @param {string} text */
const parseValue = (text) => (text === '' ? '' : Number.parseInt(text, 10))

/**
 * Número entero con botones − y +, acotado entre `min` y `max`. En el input
 * también funcionan las flechas ↑ ↓. Los botones no reciben Tab (el input ya
 * cubre el teclado).
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.name
 * @param {string} props.label
 * @param {number | ''} props.value
 * @param {(value: number | '') => void} props.onValueChange
 * @param {number} props.min
 * @param {number} props.max
 * @param {string} [props.suffix] Unidad a la derecha del número ("años").
 * @param {() => void} [props.onBlur]
 * @param {import('react').ReactNode} [props.hint]
 * @param {string} [props.error]
 * @param {string} [props.className]
 */
function NumberStepper({ id, name, label, value, onValueChange, min, max, suffix, onBlur, hint, error, className }) {
  const current = value === '' ? null : value
  const step = (delta) => {
    const base = current ?? (delta > 0 ? min - 1 : max + 1)
    onValueChange(Math.min(max, Math.max(min, base + delta)))
    onBlur?.()
  }

  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <div className={clsx('flex h-12 items-center gap-2 px-1.5', CONTROL_BOX, controlRing(error))}>
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Disminuir ${label.toLowerCase()}`}
          onClick={() => step(-1)}
          disabled={current !== null && current <= min}
          className={STEP_BUTTON}
        >
          <Minus aria-hidden className="size-4" />
        </button>
        <div className="flex min-w-0 flex-1 items-baseline justify-center gap-1">
          <input
            id={id}
            name={name}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={1}
            value={value}
            onChange={(event) => onValueChange(parseValue(event.target.value))}
            onBlur={onBlur}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedByOf(id, { hint, error })}
            className="w-14 min-w-0 appearance-none bg-transparent text-center text-[17px] font-bold text-ink tabular-nums outline-hidden [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {suffix && <span className="text-sm font-medium text-ink/55">{suffix}</span>}
        </div>
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Aumentar ${label.toLowerCase()}`}
          onClick={() => step(1)}
          disabled={current !== null && current >= max}
          className={STEP_BUTTON}
        >
          <Plus aria-hidden className="size-4" />
        </button>
      </div>
    </Field>
  )
}

export default NumberStepper
