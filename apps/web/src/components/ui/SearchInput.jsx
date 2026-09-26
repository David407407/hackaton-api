import clsx from 'clsx'
import { Search } from 'lucide-react'

/**
 * Campo de búsqueda con lupa. El label es obligatorio y queda solo para
 * lectores de pantalla. Cualquier prop adicional se pasa al `<input>`.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label Texto del label (sr-only).
 * @param {string} props.value
 * @param {(value: string) => void} props.onValueChange
 * @param {string} [props.className] Clases del contenedor.
 */
function SearchInput({ id, label, value, onValueChange, className, ...inputProps }) {
  return (
    <div
      className={clsx(
        'group flex h-11 w-full items-center gap-2.5 rounded-2xl bg-white px-4 shadow-card ring-1 ring-ink/10 transition sm:w-[260px]',
        'focus-within:ring-2 focus-within:ring-teal',
        className,
      )}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search aria-hidden className="size-[18px] shrink-0 text-ink/45 transition-colors group-focus-within:text-teal" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-hidden placeholder:text-ink/40"
        {...inputProps}
      />
    </div>
  )
}

export default SearchInput
