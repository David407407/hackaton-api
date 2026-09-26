import { X } from 'lucide-react'
import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import useModalBehavior from '../../hooks/useModalBehavior'

/**
 * Panel lateral modal que entra desde la derecha, en un portal. Encabezado y
 * pie fijos; el cuerpo hace scroll. Solo se monta mientras está abierto.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose Esc, clic fuera o botón ×.
 * @param {string} props.title
 * @param {import('react').ReactNode} [props.description] Línea bajo el título.
 * @param {import('react').ReactNode} [props.leading] A la izquierda del título (p. ej. un avatar).
 * @param {import('react').ReactNode} [props.headerExtra] Debajo del título (badges, acciones).
 * @param {boolean} [props.canClose=true] false mientras guarda.
 * @param {import('react').ReactNode} [props.footer] Acciones al pie, alineadas a la derecha.
 * @param {import('react').ReactNode} props.children
 */
function Drawer({ open, ...props }) {
  if (!open) return null
  return createPortal(<DrawerPanel {...props} />, document.body)
}

function DrawerPanel({ onClose, title, description, leading, headerExtra, canClose = true, footer, children }) {
  const panelRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const { handleKeyDown } = useModalBehavior({ panelRef, onClose, canClose })

  return (
    <div className="fixed inset-0 z-60 flex justify-end">
      <div
        aria-hidden
        onClick={canClose ? onClose : undefined}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm motion-safe:animate-fade-in"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative flex h-full w-full max-w-[480px] flex-col rounded-l-[28px] bg-white shadow-panel outline-hidden motion-safe:animate-drawer-in"
      >
        <header className="border-b border-ink/8 px-6 pb-5 pt-6 sm:px-8">
          <div className="flex items-start gap-4">
            {leading}
            <div className="min-w-0 flex-1 self-center">
              <h2 id={titleId} className="text-xl font-bold leading-tight tracking-tight text-ink">
                {title}
              </h2>
              {description && (
                <div id={descriptionId} className="mt-1 text-sm text-ink/65">
                  {description}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={!canClose}
              aria-label="Cerrar"
              className="-mr-2 -mt-1 grid size-9 shrink-0 place-items-center rounded-xl text-ink/50 transition hover:bg-ink/5 hover:text-ink focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30 disabled:opacity-40"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
          {headerExtra}
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">{children}</div>

        {footer && (
          <footer className="flex flex-col-reverse gap-3 border-t border-ink/8 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}

export default Drawer
