import clsx from 'clsx'
import { X } from 'lucide-react'
import { useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import useModalBehavior from '../../hooks/useModalBehavior'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
}

const HEADER_ALIGN = {
  start: 'text-left',
  center: 'text-center',
}

/**
 * Diálogo modal centrado, en un portal. Solo se monta mientras está abierto.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose Esc, clic fuera o botón ×.
 * @param {string} props.title
 * @param {import('react').ReactNode} [props.description]
 * @param {import('react').ReactNode} [props.icon] Se pinta arriba del título (diálogos de confirmación).
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {'start' | 'center'} [props.align='start'] Alineación del encabezado.
 * @param {boolean} [props.canClose=true] false mientras guarda: no cierra con Esc ni clic fuera.
 * @param {'dialog' | 'alertdialog'} [props.role='dialog']
 * @param {import('react').ReactNode} [props.footer] Acciones al pie, alineadas a la derecha.
 * @param {import('react').ReactNode} props.children
 */
function Modal({ open, ...props }) {
  if (!open) return null
  return createPortal(<ModalPanel {...props} />, document.body)
}

function ModalPanel({
  onClose,
  title,
  description,
  icon,
  size = 'md',
  align = 'start',
  canClose = true,
  role = 'dialog',
  footer,
  children,
}) {
  const panelRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()
  const { handleKeyDown } = useModalBehavior({ panelRef, onClose, canClose })

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div
        aria-hidden
        onClick={canClose ? onClose : undefined}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm motion-safe:animate-fade-in"
      />
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={clsx(
          'relative max-h-[calc(100dvh-1.5rem)] w-full overflow-y-auto rounded-[28px] bg-white p-6 shadow-panel outline-hidden sm:max-h-[calc(100dvh-3rem)] sm:p-8',
          'motion-safe:animate-dialog-in',
          SIZES[size],
        )}
      >
        {canClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl text-ink/50 transition hover:bg-ink/5 hover:text-ink focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30"
          >
            <X aria-hidden className="size-5" />
          </button>
        )}

        <header className={clsx('pr-8', HEADER_ALIGN[align], align === 'center' && 'pl-8')}>
          {icon}
          <h2 id={titleId} className="text-xl font-bold tracking-tight text-ink">
            {title}
          </h2>
          {description && (
            <div id={descriptionId} className="mt-1.5 text-sm text-ink/65">
              {description}
            </div>
          )}
        </header>

        {children}

        {footer && <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal
