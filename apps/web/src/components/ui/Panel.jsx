import clsx from 'clsx'
import { useId } from 'react'

/**
 * Tarjeta blanca de sección con encabezado opcional: título, subtítulo y un
 * slot a la derecha (leyenda, badge, acción...).
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.title] Sin título no se pinta el encabezado.
 * @param {import('react').ReactNode} [props.subtitle]
 * @param {import('react').ReactNode} [props.actions] Contenido a la derecha del título.
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
function Panel({ title, subtitle, actions, className, children }) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={clsx('rounded-3xl bg-white p-6 shadow-card ring-1 ring-ink/5', className)}
    >
      {title && (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-sm text-ink/60">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}

export default Panel
