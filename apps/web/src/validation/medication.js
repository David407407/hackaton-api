import { COMPARTMENT_IDS, MEDICATION_FORMS, MEDICATION_LIMITS, MEDICATION_UNITS } from '../constants/medications'

/** '' o null → NaN, para que la validación lo marque como vacío. */
const toNumber = (value) => (value === '' || value == null ? NaN : Number(value))

/**
 * Limpia lo que llega del formulario: recorta textos y convierte números.
 * `compartmentId` vacío significa "Sin compartimento" (null).
 *
 * @param {object} input
 */
export function normalizeMedication(input) {
  return {
    ...input,
    name: String(input.name ?? '').trim().replace(/\s+/g, ' '),
    strength: toNumber(input.strength),
    compartmentId: input.compartmentId === '' || input.compartmentId == null ? null : Number(input.compartmentId),
    stock: toNumber(input.stock),
    capacity: toNumber(input.capacity),
    notes: String(input.notes ?? '').trim(),
  }
}

/**
 * Reglas de un medicamento. Que el compartimento esté libre lo revisa el
 * servicio, porque necesita a los demás medicamentos.
 *
 * @param {object} medication Ya normalizado.
 * @returns {Record<string, string>}
 */
export function validateMedication(medication) {
  const errors = {}
  const { nameMin, nameMax, strengthMax, capacityMin, capacityMax, notesMax } = MEDICATION_LIMITS

  if (!medication.name) errors.name = 'Escribe el nombre del medicamento.'
  else if (medication.name.length < nameMin) errors.name = `El nombre debe tener al menos ${nameMin} caracteres.`
  else if (medication.name.length > nameMax) errors.name = `El nombre puede tener hasta ${nameMax} caracteres.`

  if (!Number.isFinite(medication.strength) || medication.strength <= 0) errors.strength = 'Escribe la concentración.'
  else if (medication.strength > strengthMax) errors.strength = 'La concentración es demasiado alta.'

  if (!MEDICATION_UNITS.includes(medication.unit)) errors.unit = 'Elige una unidad.'
  if (!MEDICATION_FORMS.includes(medication.form)) errors.form = 'Elige la forma.'

  if (medication.compartmentId !== null && !COMPARTMENT_IDS.includes(medication.compartmentId)) {
    errors.compartmentId = `Elige un compartimento de C1 a C${COMPARTMENT_IDS.at(-1)}.`
  }

  const capacityValid = Number.isInteger(medication.capacity) && medication.capacity >= capacityMin && medication.capacity <= capacityMax
  if (!capacityValid) errors.capacity = `La capacidad debe ser un entero entre ${capacityMin} y ${capacityMax}.`

  if (!Number.isInteger(medication.stock) || medication.stock < 0) errors.stock = 'El stock debe ser un entero de 0 o más.'
  else if (capacityValid && medication.stock > medication.capacity) errors.stock = `El stock no puede pasar la capacidad (${medication.capacity}).`

  if (medication.notes.length > notesMax) errors.notes = `Las notas pueden tener hasta ${notesMax} caracteres.`

  return errors
}
