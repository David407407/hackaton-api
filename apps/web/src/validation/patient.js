import { CARD_COLORS } from '../constants/cardColors'
import { HAIR_STYLES, PATIENT_LIMITS, PATIENT_TITLES } from '../constants/patients'

const HEX_COLOR = /^#[0-9a-f]{6}$/i
const HAIR_VALUES = HAIR_STYLES.map((style) => style.value)

/**
 * Limpia lo que llega del formulario: recorta el nombre y convierte la edad a
 * número. No valida.
 *
 * @param {object} input
 */
export function normalizePatient(input) {
  return {
    ...input,
    name: String(input.name ?? '').trim().replace(/\s+/g, ' '),
    age: input.age === '' || input.age == null ? NaN : Number(input.age),
  }
}

/**
 * Reglas de un paciente. La unicidad de la tarjeta la revisa el servicio,
 * porque necesita a los demás pacientes.
 *
 * @param {object} patient Ya normalizado.
 * @returns {Record<string, string>} { campo: 'mensaje' }; vacío si es válido.
 */
export function validatePatient(patient) {
  const errors = {}
  const { nameMin, nameMax, ageMin, ageMax } = PATIENT_LIMITS

  if (!PATIENT_TITLES.includes(patient.title)) errors.title = 'Elige Don o Doña.'

  if (!patient.name) errors.name = 'Escribe el nombre completo.'
  else if (patient.name.length < nameMin) errors.name = `El nombre debe tener al menos ${nameMin} caracteres.`
  else if (patient.name.length > nameMax) errors.name = `El nombre puede tener hasta ${nameMax} caracteres.`

  if (!Number.isInteger(patient.age)) errors.age = 'Escribe la edad en años.'
  else if (patient.age < ageMin || patient.age > ageMax) errors.age = `La edad debe estar entre ${ageMin} y ${ageMax} años.`

  if (!CARD_COLORS[patient.card]) errors.card = 'Elige una tarjeta de color.'

  const avatar = patient.avatar ?? {}
  if (!HAIR_VALUES.includes(avatar.hairStyle)) errors.hairStyle = 'Elige un estilo de cabello.'
  if (!HEX_COLOR.test(avatar.skin ?? '')) errors.skin = 'Elige un tono de piel.'

  return errors
}
