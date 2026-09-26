import clsx from 'clsx'
import Checkbox from './Checkbox'
import Field from './Field'
import { describedByOf } from './fieldIds'

/**
 * Días de la semana: "Todos los días" o una selección de días como pills.
 * Al desmarcar "Todos los días" se proponen los días de `defaultSelection`.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.name Se usa para enfocar el campo cuando tiene error.
 * @param {string} props.label
 * @param {{ value: number, short: string, label: string }[]} props.options Días en orden.
 * @param {string | number[]} props.value `allValue` o los días elegidos.
 * @param {(value: string | number[]) => void} props.onValueChange
 * @param {string} props.allValue Valor que representa "todos los días".
 * @param {number[]} [props.defaultSelection] Días propuestos al pasar a selección.
 * @param {string} [props.error]
 * @param {string} [props.className]
 */
function DaysPicker({ id, name, label, options, value, onValueChange, allValue, defaultSelection = [], error, className }) {
  const isAll = value === allValue
  const selected = isAll ? [] : value

  const toggleDay = (day) => {
    const next = selected.includes(day) ? selected.filter((item) => item !== day) : [...selected, day]
    onValueChange(next.sort((a, b) => a - b))
  }

  return (
    <Field id={id} label={label} error={error} group className={className}>
      <Checkbox
        id={`${id}-all`}
        data-field={isAll ? name : undefined}
        label={<span className="text-sm font-medium">Todos los días</span>}
        checked={isAll}
        onCheckedChange={(checked) => onValueChange(checked ? allValue : defaultSelection)}
      />

      {!isAll && (
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((day, index) => (
            <label key={day.value} className="cursor-pointer">
              <input
                type="checkbox"
                data-field={index === 0 ? name : undefined}
                checked={selected.includes(day.value)}
                onChange={() => toggleDay(day.value)}
                aria-describedby={describedByOf(id, { error })}
                className="peer sr-only"
              />
              <span
                className={clsx(
                  'grid size-10 place-items-center rounded-full bg-white text-sm font-bold text-ink/65 ring-1 ring-ink/12 transition',
                  'hover:text-ink peer-checked:bg-teal peer-checked:text-white peer-checked:shadow-cta peer-checked:ring-teal',
                  'peer-focus-visible:ring-4 peer-focus-visible:ring-teal/30',
                )}
              >
                <span aria-hidden>{day.short}</span>
                <span className="sr-only">{day.label}</span>
              </span>
            </label>
          ))}
        </div>
      )}
    </Field>
  )
}

export default DaysPicker
