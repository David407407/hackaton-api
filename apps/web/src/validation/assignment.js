import { ASSIGNMENT_LIMITS, DAILY } from '../constants/schedule'
import { isValidISODate, isValidTime, normalizeTimes } from '../utils/schedule'

/**
 * Limpia lo que llega del formulario: ordena horarios y días, convierte la
 * cantidad a número y deja la fecha de fin en null si está vacía.
 *
 * @param {object} input
 */
export function normalizeAssignment(input) {
  return {
    ...input,
    quantity: input.quantity === '' || input.quantity == null ? NaN : Number(input.quantity),
    times: normalizeTimes(input.times ?? []),
    days: input.days === DAILY ? DAILY : [...new Set(input.days ?? [])].sort(),
    endDate: input.endDate || null,
    instructions: String(input.instructions ?? '').trim(),
    active: input.active ?? true,
  }
}

/**
 * Reglas de una asignación. Que no se duplique un medicamento activo en el
 * mismo paciente lo revisa el servicio.
 *
 * @param {object} assignment Ya normalizada.
 * @returns {Record<string, string>}
 */
export function validateAssignment(assignment) {
  const errors = {}
  const { quantityMin, quantityMax, timesMin, timesMax, instructionsMax } = ASSIGNMENT_LIMITS

  if (!assignment.patientId) errors.patientId = 'Falta el paciente.'
  if (!assignment.medicationId) errors.medicationId = 'Elige un medicamento.'

  const { quantity } = assignment
  if (!Number.isInteger(quantity) || quantity < quantityMin || quantity > quantityMax) {
    errors.quantity = `Entre ${quantityMin} y ${quantityMax} pastillas por toma.`
  }

  const { times } = assignment
  if (times.length < timesMin) errors.times = 'Agrega al menos un horario.'
  else if (times.length > timesMax) errors.times = `Máximo ${timesMax} horarios.`
  else if (!times.every(isValidTime)) errors.times = 'Usa el formato HH:mm.'

  const { days } = assignment
  if (days !== DAILY && (!days.length || !days.every((day) => Number.isInteger(day) && day >= 1 && day <= 7))) {
    errors.days = 'Elige al menos un día.'
  }

  if (!assignment.startDate || !isValidISODate(assignment.startDate)) errors.startDate = 'Elige la fecha de inicio.'
  if (assignment.endDate) {
    if (!isValidISODate(assignment.endDate)) errors.endDate = 'La fecha de fin no es válida.'
    else if (!errors.startDate && assignment.endDate < assignment.startDate) {
      errors.endDate = 'La fecha de fin debe ser posterior al inicio.'
    }
  }

  if (assignment.instructions.length > instructionsMax) {
    errors.instructions = `Las instrucciones pueden tener hasta ${instructionsMax} caracteres.`
  }

  return errors
}
