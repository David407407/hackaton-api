const LONG_DATE = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
const TIME = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/**
 * Hora en formato de 24 h: "14:02".
 *
 * @param {Date | number} date
 */
export function formatTime(date) {
  return TIME.format(date)
}

/**
 * Fecha larga sin comas y con mayúscula inicial: "Viernes 25 de septiembre".
 *
 * @param {Date} date
 */
export function formatLongDate(date) {
  const parts = Object.fromEntries(LONG_DATE.formatToParts(date).map(({ type, value }) => [type, value]))
  const text = `${parts.weekday} ${parts.day} de ${parts.month}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}
