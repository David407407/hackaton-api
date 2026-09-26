import clsx from 'clsx'
import Field from './Field'
import { describedByOf } from './fieldIds'

/**
 * Opciones excluyentes como botones segmentados. Por dentro son radios
 * nativos: las flechas cambian la selección y Tab entra y sale del grupo.
 *
 * @template {string} T
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.name
 * @param {string} props.label
 * @param {{ value: T, label: string }[]} props.options
 * @param {T} props.value
 * @param {(value: T) => void} props.onValueChange
 * @param {string} [props.error]
 * @param {string} [props.className]
 */
function SegmentedControl({ id, name, label, options, value, onValueChange, error, className }) {
  return (
    <Field id={id} label={label} error={error} group className={className}>
      <div
        className={clsx(
          'flex rounded-2xl bg-cream/60 p-1 ring-1',
          error ? 'ring-danger/60' : 'ring-ink/10',
        )}
      >
        {options.map((option) => (
          <label key={option.value} className="flex-1 cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onValueChange(option.value)}
              aria-describedby={describedByOf(id, { error })}
              className="peer sr-only"
            />
            <span
              className={clsx(
                'block rounded-xl px-3 py-2 text-center text-sm font-semibold text-ink/60 transition',
                'hover:text-ink peer-checked:bg-white peer-checked:text-ink peer-checked:shadow-card',
                'peer-focus-visible:ring-4 peer-focus-visible:ring-teal/30',
              )}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </Field>
  )
}

export default SegmentedControl
