import { useEffect, useState } from 'react'

const TICK_MS = 1000

/**
 * Segundos transcurridos desde `lastSyncAt`, actualizados cada segundo con un
 * solo intervalo. Úsalo en un componente pequeño: solo ese se re-renderiza.
 *
 * @param {number} lastSyncAt Timestamp (ms) de la última sincronización.
 * @returns {number}
 */
export default function useSyncCounter(lastSyncAt) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(intervalId)
  }, [])

  // Si la sincronización es más nueva que el último tick, cuenta como 0.
  return Math.max(0, Math.floor((now - lastSyncAt) / 1000))
}
