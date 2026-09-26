import clsx from 'clsx'

/**
 * Dato breve: etiqueta en mayúsculas y, debajo, ícono + valor.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {import('react').ElementType} props.icon
 * @param {string} [props.iconClassName] Color del ícono (p. ej. `text-teal`).
 * @param {import('react').ReactNode} props.children Valor.
 */
function InfoTile({ label, icon: Icon, iconClassName, children }) {
  return (
    <div className="rounded-2xl bg-cream/55 px-3.5 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink/55">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[15px] font-semibold text-ink">
        <Icon aria-hidden className={clsx('size-4 shrink-0', iconClassName)} />
        {children}
      </p>
    </div>
  )
}

export default InfoTile
