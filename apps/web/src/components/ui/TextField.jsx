import clsx from 'clsx'

/**
 * Campo de texto con label, ícono opcional y mensaje de error accesible.
 * Cualquier prop adicional se pasa al `<input>` (type, name, value, onChange, ...).
 *
 * @param {object} props
 * @param {string} props.id Id del input; también se usa para asociar label y error.
 * @param {string} props.label
 * @param {import('react').ElementType} [props.icon] Ícono a la izquierda; se pinta de teal con el foco.
 * @param {import('react').ReactNode} [props.endAdornment] Contenido a la derecha del input (p. ej. un botón).
 * @param {string} [props.error] Mensaje de error; marca el input con aria-invalid.
 * @param {string} [props.className] Clases del contenedor externo.
 */
function TextField({ id, label, icon: Icon, endAdornment, error, className, ...inputProps }) {
  const errorId = `${id}-error`
  const describedBy = clsx(inputProps['aria-describedby'], error && errorId) || undefined

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink">
        {label}
      </label>

      <div
        className={clsx(
          'group flex h-12 items-center gap-3 rounded-2xl bg-cream/45 px-4 ring-1 transition',
          'focus-within:bg-white focus-within:ring-2 focus-within:ring-teal',
          error ? 'ring-danger/60' : 'ring-ink/10',
        )}
      >
        {Icon && (
          <Icon
            aria-hidden
            className="size-[18px] shrink-0 text-ink/45 transition-colors group-focus-within:text-teal"
          />
        )}
        <input
          id={id}
          {...inputProps}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-hidden placeholder:text-ink/35"
        />
        {endAdornment}
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export default TextField
