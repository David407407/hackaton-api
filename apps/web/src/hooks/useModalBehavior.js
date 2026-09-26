import { useEffect, useRef } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

/** Controles enfocables y visibles dentro de `container`. @param {HTMLElement} container */
function getFocusable(container) {
  return [...container.querySelectorAll(FOCUSABLE)].filter(
    (element) => !element.closest('[inert]') && element.getClientRects().length > 0,
  )
}

/* Varios diálogos pueden estar abiertos a la vez (un modal sobre un drawer):
   el scroll del body se libera cuando se cierra el último. */
let scrollLocks = 0

function lockScroll() {
  scrollLocks += 1
  if (scrollLocks === 1) document.body.style.overflow = 'hidden'
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1)
  if (scrollLocks === 0) document.body.style.overflow = ''
}

/**
 * Comportamiento WAI-ARIA de un diálogo modal. Úsalo en el componente que se
 * monta al abrir (y se desmonta al cerrar):
 * - mueve el foco adentro (a `[data-autofocus]` o al primer control),
 * - atrapa Tab / Shift+Tab dentro del panel,
 * - cierra con Esc (si `canClose`),
 * - bloquea el scroll del body,
 * - al cerrarse, devuelve el foco al elemento que lo abrió.
 *
 * Los eventos de teclado se detienen aquí para que un diálogo anidado no
 * cierre también al de abajo.
 *
 * @param {object} options
 * @param {import('react').RefObject<HTMLElement>} options.panelRef
 * @param {() => void} options.onClose
 * @param {boolean} [options.canClose=true] false mientras guarda.
 * @returns {{ handleKeyDown: (event: import('react').KeyboardEvent) => void }}
 */
export default function useModalBehavior({ panelRef, onClose, canClose = true }) {
  const returnFocusRef = useRef(null)

  useEffect(() => {
    returnFocusRef.current = document.activeElement
    lockScroll()

    const panel = panelRef.current
    const target = panel?.querySelector('[data-autofocus]') ?? (panel && getFocusable(panel)[0]) ?? panel
    target?.focus({ preventScroll: true })

    return () => {
      unlockScroll()
      const previous = returnFocusRef.current
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true })
    }
  }, [panelRef])

  /** @param {import('react').KeyboardEvent} event */
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      if (canClose) onClose()
      return
    }
    if (event.key !== 'Tab' || !panelRef.current) return

    event.stopPropagation()
    const focusable = getFocusable(panelRef.current)
    if (!focusable.length) {
      event.preventDefault()
      return
    }
    const first = focusable[0]
    const last = focusable.at(-1)
    const active = document.activeElement
    const isOutside = !panelRef.current.contains(active)

    if (event.shiftKey && (active === first || isOutside)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (active === last || isOutside)) {
      event.preventDefault()
      first.focus()
    }
  }

  return { handleKeyDown }
}
