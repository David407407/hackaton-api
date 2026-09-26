import clsx from 'clsx'

/**
 * Bloque gris pulsante para reservar el espacio de contenido que aún carga.
 * La forma (tamaño, radio) se da con `className`.
 *
 * @param {object} props
 * @param {string} [props.className]
 */
function Skeleton({ className }) {
  return <div aria-hidden className={clsx('animate-pulse rounded-lg bg-ink/8', className)} />
}

export default Skeleton
