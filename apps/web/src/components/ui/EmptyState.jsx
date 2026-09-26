import clsx from 'clsx'

/**
 * Recuadro punteado para listas vacías. Ocupa todas las columnas si está
 * dentro de un grid.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children Mensaje.
 * @param {import('react').ReactNode} [props.action] Botón u otra acción debajo del mensaje.
 * @param {string} [props.className]
 */
function EmptyState({ children, action, className }) {
  return (
    <div
      className={clsx(
        'col-span-full rounded-3xl border-2 border-dashed border-ink/15 p-10 text-center text-sm text-ink/60',
        className,
      )}
    >
      <p>{children}</p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  )
}

export default EmptyState
