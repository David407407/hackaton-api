import { useEffect, useState } from 'react'

const MINUTE_MS = 60_000

/**
 * Fecha actual que se refresca cada `intervalMs` (por defecto cada minuto),
 * para los derivados que dependen de la hora ("Próxima dosis").
 *
 * @param {number} [intervalMs]
 * @returns {Date}
 */
export default function useNow(intervalMs = MINUTE_MS) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(intervalId)
  }, [intervalMs])

  return now
}
