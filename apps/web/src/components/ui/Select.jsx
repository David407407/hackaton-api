import clsx from 'clsx'
import { ChevronDown } from 'lucide-react'
import Field from './Field'
import { CONTROL_BOX, controlRing, describedByOf } from './fieldIds'

/**
 * @typedef {object} SelectOption
 * @property {string} value
 * @property {string} label
 * @property {boolean} [disabled]
 */

/**
 * Select nativo con el estilo de los campos. Cualquier prop extra va al `<select>`.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} [props.label] Sin label visible, pasa `aria-label`.
 * @param {string} props.value
 * @param {(value: string) => void} props.onValueChange
 * @param {SelectOption[]} props.options
 * @param {string} [props.placeholder] Opción vacía deshabilitada al inicio.
 * @param {import('react').ReactNode} [props.hint]
 * @param {string} [props.error]
 * @param {string} [props.className]
 */
function Select({ id, label, value, onValueChange, options, placeholder, hint, error, className, ...selectProps }) {
  const control = (
    <div className={clsx('relative flex h-12 items-center', CONTROL_BOX, controlRing(error))}>
      <select
        id={id}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedByOf(id, { hint, error })}
        className="h-full w-full min-w-0 cursor-pointer appearance-none rounded-2xl bg-transparent pl-4 pr-10 text-[15px] text-ink outline-hidden"
        {...selectProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3.5 size-[18px] text-ink/50" />
    </div>
  )

  if (!label) return <div className={className}>{control}</div>

  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      {control}
    </Field>
  )
}

export default Select
