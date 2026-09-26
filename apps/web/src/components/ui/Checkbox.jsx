import clsx from 'clsx'
import { Check } from 'lucide-react'

/**
 * Checkbox controlado. Usa un `<input type="checkbox">` real (visualmente
 * oculto) para conservar teclado, foco y lectores de pantalla.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {import('react').ReactNode} props.label
 * @param {boolean} props.checked
 * @param {(checked: boolean) => void} props.onCheckedChange
 * @param {string} [props.className] Clases del `<label>` contenedor.
 */
function Checkbox({ id, label, checked, onCheckedChange, className, ...inputProps }) {
  return (
    <label
      htmlFor={id}
      className={clsx('group inline-flex cursor-pointer select-none items-center gap-2.5 text-ink/80', className)}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="peer sr-only"
        {...inputProps}
      />
      <span
        aria-hidden
        className={clsx(
          'grid size-5 shrink-0 place-items-center rounded-md bg-white ring-1 ring-ink/20 transition',
          'group-hover:ring-ink/35',
          'peer-checked:bg-teal peer-checked:ring-teal',
          'peer-focus-visible:ring-4 peer-focus-visible:ring-teal/30',
          'peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100',
        )}
      >
        <Check strokeWidth={3} className="size-3.5 scale-50 text-white opacity-0 transition" />
      </span>
      {label}
    </label>
  )
}

export default Checkbox
