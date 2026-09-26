import clsx from 'clsx'

/**
 * Barra de progreso. El relleno crece desde 0 al montarse y anima los cambios
 * de valor.
 *
 * @param {object} props
 * @param {number} props.value 0–100.
 * @param {string} props.label Nombre accesible (p. ej. "Adherencia").
 * @param {string} [props.fillClassName='bg-teal'] Clase de fondo del relleno.
 * @param {string} [props.trackClassName='bg-mist/45'] Clase de fondo de la pista.
 * @param {string} [props.className]
 */
function ProgressBar({ value, label, fillClassName = 'bg-teal', trackClassName = 'bg-mist/45', className }) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={clsx('h-2 overflow-hidden rounded-full', trackClassName, className)}
    >
      <div
        className={clsx(
          'h-full origin-left animate-progress-grow rounded-full transition-all duration-700 motion-reduce:animate-none',
          fillClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

export default ProgressBar
