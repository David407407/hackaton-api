import clsx from 'clsx'

/**
 * Punto indicador de 8px con halo pulsante opcional. Decorativo: acompáñalo
 * siempre de texto.
 *
 * @param {object} props
 * @param {string} props.colorClassName Clase de fondo del punto (p. ej. `bg-online`).
 * @param {boolean} [props.pulse=true]
 */
function PulseDot({ colorClassName, pulse = true }) {
  return (
    <span aria-hidden className="relative flex size-2">
      {pulse && (
        <span
          className={clsx(
            'absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none',
            colorClassName,
          )}
        />
      )}
      <span className={clsx('relative inline-flex size-2 rounded-full', colorClassName)} />
    </span>
  )
}

export default PulseDot
