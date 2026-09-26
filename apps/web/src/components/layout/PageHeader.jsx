/**
 * Encabezado de página: línea de contexto, título y acciones a la derecha.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {import('react').ReactNode} [props.eyebrow] Línea de contexto sobre el título.
 * @param {import('react').ReactNode} [props.actions]
 */
function PageHeader({ title, eyebrow, actions }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div>
        {eyebrow && <p className="text-sm font-medium text-ink/60">{eyebrow}</p>}
        <h1 className="mt-1 text-[30px] font-bold leading-tight tracking-tight text-ink">{title}</h1>
      </div>
      {actions && <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">{actions}</div>}
    </header>
  )
}

export default PageHeader
