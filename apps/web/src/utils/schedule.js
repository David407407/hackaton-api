import { DAILY, WEEKDAYS } from '../constants/schedule'

/*
 * Fechas y horarios de las asignaciones. Todo en hora local; las fechas se
 * guardan como 'YYYY-MM-DD' y los horarios como 'HH:mm'.
 */

const LOCALE = 'es-MX'
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const LIST = new Intl.ListFormat(LOCALE, { style: 'long', type: 'conjunction' })
const SHORT_WEEKDAY = new Intl.DateTimeFormat(LOCALE, { weekday: 'short' })
const DAY_MONTH = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })

/* ---------- Fechas ---------- */

/** @param {Date} date */
export function toISODate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** 'YYYY-MM-DD' → Date a medianoche local (new Date('YYYY-MM-DD') sería UTC). */
export function parseISODate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** @param {Date} date @param {number} days */
export function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

/** 1 = lunes … 7 = domingo. @param {Date} date */
export const isoWeekday = (date) => date.getDay() || 7

/** @param {string} value */
export const isValidISODate = (value) => DATE_PATTERN.test(value) && !Number.isNaN(parseISODate(value).getTime())

/** "12 sept 2026". @param {string} value 'YYYY-MM-DD' */
export const formatISODate = (value) => DAY_MONTH.format(parseISODate(value))

/* ---------- Horarios ---------- */

/** @param {string} value */
export const isValidTime = (value) => TIME_PATTERN.test(value)

/** Sin repetidos y en orden ('HH:mm' se ordena bien como texto). @param {string[]} times */
export const normalizeTimes = (times) => [...new Set(times)].sort()

/** 'HH:mm' de un Date. @param {Date} date */
export const toTimeString = (date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

/** "08:00 y 20:00". @param {string[]} times */
export const formatTimes = (times) => LIST.format(times)

/** "a las 08:00 y 20:00" ("a la 01:00" en singular). @param {string[]} times */
export function formatAtTimes(times) {
  const article = times.length === 1 && times[0].startsWith('01:') ? 'a la' : 'a las'
  return `${article} ${formatTimes(times)}`
}

/* ---------- Días ---------- */

const WEEKDAY_BY_VALUE = new Map(WEEKDAYS.map((day) => [day.value, day]))
const WORKDAYS = '1,2,3,4,5'
const WEEKEND = '6,7'

/**
 * "Todos los días", "De lunes a viernes", "Fines de semana" o
 * "Lunes, miércoles y viernes".
 *
 * @param {'daily' | number[]} days
 */
export function formatDays(days) {
  if (days === DAILY || days.length === 7) return 'Todos los días'
  const key = [...days].sort().join(',')
  if (key === WORKDAYS) return 'De lunes a viernes'
  if (key === WEEKEND) return 'Fines de semana'
  const text = LIST.format([...days].sort().map((day) => WEEKDAY_BY_VALUE.get(day).label.toLowerCase()))
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/* ---------- Asignaciones ---------- */

/**
 * ¿La asignación tiene tomas ese día? (activa, día de la semana y dentro de
 * sus fechas de inicio y fin).
 *
 * @param {import('../services/assignmentsService').Assignment} assignment
 * @param {Date} date
 */
export function appliesOn(assignment, date) {
  if (!assignment.active) return false
  const day = toISODate(date)
  if (assignment.startDate && day < assignment.startDate) return false
  if (assignment.endDate && day > assignment.endDate) return false
  return assignment.days === DAILY || assignment.days.includes(isoWeekday(date))
}

/** Días hacia adelante en los que se busca la próxima toma. */
const LOOKAHEAD_DAYS = 7

/**
 * @typedef {object} NextDose
 * @property {string} time 'HH:mm'
 * @property {number} dayOffset 0 = hoy, 1 = mañana…
 * @property {number} at Timestamp (ms), para comparar entre pacientes.
 */

/**
 * Próxima toma entre las asignaciones dadas: la siguiente de hoy (incluida la
 * del minuto actual) o la primera de los días siguientes.
 *
 * @param {import('../services/assignmentsService').Assignment[]} assignments
 * @param {Date} now
 * @returns {NextDose | null}
 */
export function findNextDose(assignments, now) {
  const currentTime = toTimeString(now)

  for (let dayOffset = 0; dayOffset <= LOOKAHEAD_DAYS; dayOffset += 1) {
    const date = addDays(now, dayOffset)
    const times = assignments
      .filter((assignment) => appliesOn(assignment, date))
      .flatMap((assignment) => assignment.times)
      .filter((time) => dayOffset > 0 || time >= currentTime)
      .sort()

    if (times.length) {
      const [hours, minutes] = times[0].split(':').map(Number)
      const at = new Date(date)
      at.setHours(hours, minutes, 0, 0)
      return { time: times[0], dayOffset, at: at.getTime() }
    }
  }
  return null
}

/**
 * "14:30", "Mañana 08:00", "lun 08:00" o "Sin tomas".
 *
 * @param {NextDose | null} next
 */
export function formatNextDose(next) {
  if (!next) return 'Sin tomas'
  if (next.dayOffset === 0) return next.time
  if (next.dayOffset === 1) return `Mañana ${next.time}`
  return `${SHORT_WEEKDAY.format(next.at).replace('.', '')} ${next.time}`
}

/** "1 pastilla" / "2 pastillas". @param {number} count */
export const pillsLabel = (count) => `${count} ${count === 1 ? 'pastilla' : 'pastillas'}`

/**
 * Resumen en una línea: "1 pastilla de Metformina 850 mg a las 08:00 y 20:00,
 * todos los días".
 *
 * @param {object} schedule
 * @param {number} schedule.quantity
 * @param {string} schedule.medicationLabel
 * @param {string[]} schedule.times
 * @param {'daily' | number[]} schedule.days
 */
export function describeSchedule({ quantity, medicationLabel, times, days }) {
  const parts = [`${pillsLabel(quantity)} de ${medicationLabel}`]
  if (times.length) parts.push(formatAtTimes(times))
  const daysText = days === DAILY || days.length ? formatDays(days).toLowerCase() : ''
  return `${parts.join(' ')}${daysText ? `, ${daysText}` : ''}`
}
