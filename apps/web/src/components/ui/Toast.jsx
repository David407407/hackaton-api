import clsx from 'clsx'
import { Check, TriangleAlert, X } from 'lucide-react'

const STATES = {
  open: 'motion-safe:animate-toast-in',
  closing: 'translate-y-2 opacity-0',
}

const TONES = {
  success: { icon: Check, iconBox: 'bg-online', role: 'status' },
  warning: { icon: TriangleAlert, iconBox: 'bg-warning', role: 'status' },
  error: { icon: X, iconBox: 'bg-danger', role: 'alert' },
}

/**
 * Aviso flotante abajo al centro. Se maneja con el hook useToast (o, dentro de
 * la app, con useNotify):
 *
 *   const { toast, showToast, dismissToast } = useToast()
 *   <Toast toast={toast} onDismiss={dismissToast} />
 *
 * Los errores se anuncian con role="alert"; el resto con role="status".
 *
 * @param {object} props
 * @param {import('../../hooks/useToast').ToastState | null} props.toast
 * @param {() => void} [props.onDismiss] Se llama después de ejecutar la acción.
 */
function Toast({ toast, onDismiss }) {
  if (!toast) return null
  const tone = TONES[toast.tone] ?? TONES.success
  const Icon = tone.icon

  const handleAction = () => {
    toast.action.onClick()
    onDismiss?.()
  }

  return (
    <div
      key={toast.id}
      role={tone.role}
      className={clsx(
        'fixed bottom-6 left-1/2 z-70 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-2xl bg-ink py-3 pl-4 pr-3 text-sm font-medium text-white shadow-panel',
        'motion-safe:transition-[opacity,translate] motion-safe:duration-300',
        STATES[toast.open ? 'open' : 'closing'],
      )}
    >
      <span aria-hidden className={clsx('grid size-6 shrink-0 place-items-center rounded-full', tone.iconBox)}>
        <Icon strokeWidth={3} className="size-3.5" />
      </span>
      <span className="min-w-0 pr-1">{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          onClick={handleAction}
          className="shrink-0 rounded-xl bg-white/12 px-3 py-1.5 text-[13px] font-bold text-mist transition hover:bg-white/20 hover:text-white focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/40"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  )
}

export default Toast
