import clsx from 'clsx'
import { LoaderCircle } from 'lucide-react'

const BASE =
  'group inline-flex select-none items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 ' +
  'focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30 disabled:cursor-not-allowed'

const VARIANTS = {
  primary: 'bg-teal text-white shadow-cta enabled:hover:-translate-y-0.5 enabled:hover:shadow-cta-hover',
  secondary: 'bg-white text-ink ring-1 ring-ink/12 shadow-card enabled:hover:-translate-y-0.5',
  ghost: 'bg-transparent text-indigo enabled:hover:bg-indigo/10',
  danger: 'bg-danger text-white shadow-card enabled:hover:-translate-y-0.5 enabled:hover:bg-danger-ink',
  dangerSoft: 'bg-danger-soft text-danger-ink enabled:hover:bg-danger-soft/70 enabled:hover:-translate-y-0.5',
}

const SIZES = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
}

const ICON_SIZES = {
  sm: 'size-4',
  md: 'size-[18px]',
  lg: 'size-5',
}

/**
 * Botón base del design system.
 *
 * @param {object} props
 * @param {'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerSoft'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {import('react').ElementType} [props.icon] Ícono (p. ej. de lucide-react) antes del texto.
 * @param {import('react').ElementType} [props.iconRight] Ícono después del texto; se desplaza un poco en hover.
 * @param {boolean} [props.fullWidth=false] Ocupa todo el ancho del contenedor.
 * @param {boolean} [props.loading=false] Muestra un spinner en lugar de `icon` y deshabilita el botón.
 * @param {'button' | 'submit' | 'reset'} [props.type='button']
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  className,
  children,
  ...props
}) {
  const iconClass = clsx('shrink-0', ICON_SIZES[size])

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(
        BASE,
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        loading ? 'cursor-wait' : 'disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {loading && <LoaderCircle aria-hidden className={clsx(iconClass, 'animate-spin')} />}
      {!loading && Icon && <Icon aria-hidden className={iconClass} />}
      <span>{children}</span>
      {!loading && IconRight && (
        <IconRight
          aria-hidden
          className={clsx(iconClass, 'transition-transform duration-200 group-enabled:group-hover:translate-x-0.5')}
        />
      )}
    </button>
  )
}

export default Button
