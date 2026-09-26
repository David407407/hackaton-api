import { useCallback, useEffect, useRef, useState } from 'react'

const VISIBLE_MS = 2600
/** Con acción ("Deshacer") el toast se queda más tiempo. */
const ACTION_VISIBLE_MS = 5000
/** Debe coincidir con la duración de la transición de salida de <Toast>. */
const EXIT_MS = 300

/**
 * @typedef {object} ToastAction
 * @property {string} label
 * @property {() => void} onClick
 */

/**
 * @typedef {object} ToastOptions
 * @property {string} message
 * @property {'success' | 'error' | 'warning'} [tone='success']
 * @property {ToastAction} [action]
 * @property {number} [duration] ms visibles; por defecto 2.6 s (5 s con acción).
 */

/**
 * @typedef {object} ToastState
 * @property {number} id Cambia con cada toast; úsalo como `key`.
 * @property {string} message
 * @property {'success' | 'error' | 'warning'} tone
 * @property {ToastAction} [action]
 * @property {boolean} open false mientras corre la animación de salida.
 */

/**
 * Un toast a la vez: `showToast` reemplaza al anterior, se cierra solo y se
 * desmonta al terminar la animación de salida.
 *
 * @returns {{
 *   toast: ToastState | null,
 *   showToast: (options: string | ToastOptions) => void,
 *   dismissToast: () => void,
 * }}
 */
export default function useToast() {
  const [toast, setToast] = useState(null)
  const timersRef = useRef([])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  const scheduleClose = useCallback((visibleMs) => {
    clearTimers()
    timersRef.current = [
      setTimeout(() => setToast((current) => current && { ...current, open: false }), visibleMs),
      setTimeout(() => setToast(null), visibleMs + EXIT_MS),
    ]
  }, [])

  const showToast = useCallback(
    (options) => {
      const { message, tone = 'success', action, duration } = typeof options === 'string' ? { message: options } : options
      setToast({ id: Date.now(), message, tone, action, open: true })
      scheduleClose(duration ?? (action ? ACTION_VISIBLE_MS : VISIBLE_MS))
    },
    [scheduleClose],
  )

  const dismissToast = useCallback(() => scheduleClose(0), [scheduleClose])

  useEffect(() => clearTimers, [])

  return { toast, showToast, dismissToast }
}
