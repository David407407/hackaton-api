/*
 * Textos que se arman igual en toda la app a partir de un registro.
 */

/** "Metformina 850 mg". @param {{ name: string, strength: number, unit: string }} medication */
export const medicationLabel = (medication) => `${medication.name} ${medication.strength} ${medication.unit}`

/** "Doña Carmen" (o solo el nombre si no hay tratamiento). */
export const patientGreetingName = (patient) => {
  const first = (patient.name ?? '').split(' ')[0]
  return patient.title ? `${patient.title} ${first}` : first
}

/**
 * Nombre corto: nombre de pila + inicial del apellido ("Ernesto S.").
 *
 * @param {{ name: string } | undefined} patient
 */
export function patientShortName(patient) {
  if (!patient) return 'Sin asignar'
  const words = patient.name.split(' ')
  return words.length > 1 ? `${words[0]} ${words.at(-1).charAt(0)}.` : words[0]
}

/** "C3". @param {number} compartmentId */
export const compartmentLabel = (compartmentId) => `C${compartmentId}`
