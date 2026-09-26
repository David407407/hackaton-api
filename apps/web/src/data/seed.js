import { DAILY } from '../constants/schedule'
import { addDays, toISODate } from '../utils/schedule'

/*
 * Datos de demo con los que arranca la app (y a los que vuelve "Restablecer
 * datos de demo"). Los ids son fijos para que la semilla sea reproducible; los
 * registros nuevos usan crypto.randomUUID().
 *
 * Los hex de `avatar` son de la ilustración, no del sistema de UI.
 */

/** @typedef {import('../services/patientsService').Patient} Patient */
/** @typedef {import('../services/medicationsService').Medication} Medication */
/** @typedef {import('../services/assignmentsService').Assignment} Assignment */

const PATIENTS = [
  { id: 'pat-carmen', title: 'Doña', name: 'Carmen Ruiz', age: 82, card: 'azul', adherence: 96, status: 'ok',
    avatar: { hairStyle: 'bun', glasses: true, beard: false, mustache: false, skin: '#e8b894', hair: '#ebe7e1', shirt: '#4a6eb0', bg: '#cfe9ea' } },
  { id: 'pat-roberto', title: 'Don', name: 'Roberto Méndez', age: 79, card: 'rojo', adherence: 88, status: 'pending',
    avatar: { hairStyle: 'short', glasses: false, beard: false, mustache: true, skin: '#c98e6a', hair: '#d4cfc7', shirt: '#114c5f', bg: '#f6ecd9' } },
  { id: 'pat-esperanza', title: 'Doña', name: 'Esperanza Villalobos', age: 85, card: 'verde', adherence: 99, status: 'ok',
    avatar: { hairStyle: 'bun', glasses: false, beard: false, mustache: false, skin: '#f1c7a5', hair: '#f6f3ee', shirt: '#0799b6', bg: '#dfe6f3' } },
  { id: 'pat-ernesto', title: 'Don', name: 'Ernesto Salazar', age: 88, card: 'amarillo', adherence: 74, status: 'alert',
    avatar: { hairStyle: 'short', glasses: true, beard: true, mustache: false, skin: '#b27a55', hair: '#c2bcb3', shirt: '#4a6eb0', bg: '#cfe9ea' } },
  { id: 'pat-rosa', title: 'Doña', name: 'Rosa María Treviño', age: 76, card: 'morado', adherence: 92, status: 'pending',
    avatar: { hairStyle: 'bun', glasses: true, beard: false, mustache: false, skin: '#d9a27c', hair: '#dcd6ce', shirt: '#114c5f', bg: '#f6ecd9' } },
  { id: 'pat-alfonso', title: 'Don', name: 'Alfonso Garza', age: 81, card: 'naranja', adherence: 90, status: 'ok',
    avatar: { hairStyle: 'bald', glasses: false, beard: false, mustache: false, skin: '#e3b08c', hair: '#efebe5', shirt: '#0799b6', bg: '#dfe6f3' } },
]

const MEDICATIONS = [
  { id: 'med-metformina', name: 'Metformina', strength: 850, unit: 'mg', form: 'Tableta', compartmentId: 1, stock: 4, capacity: 30, notes: '' },
  { id: 'med-losartan', name: 'Losartán', strength: 50, unit: 'mg', form: 'Tableta', compartmentId: 2, stock: 6, capacity: 30, notes: '' },
  { id: 'med-atorvastatina', name: 'Atorvastatina', strength: 20, unit: 'mg', form: 'Tableta', compartmentId: 3, stock: 22, capacity: 30, notes: '' },
  { id: 'med-omeprazol', name: 'Omeprazol', strength: 20, unit: 'mg', form: 'Cápsula', compartmentId: 4, stock: 18, capacity: 30, notes: '' },
  { id: 'med-levotiroxina', name: 'Levotiroxina', strength: 100, unit: 'mcg', form: 'Tableta', compartmentId: 5, stock: 26, capacity: 30, notes: 'Tomar en ayunas, 30 min antes del desayuno.' },
  { id: 'med-paracetamol', name: 'Paracetamol', strength: 500, unit: 'mg', form: 'Tableta', compartmentId: 6, stock: 15, capacity: 30, notes: '' },
  { id: 'med-aas', name: 'Ácido acetilsalicílico', strength: 100, unit: 'mg', form: 'Tableta', compartmentId: null, stock: 20, capacity: 30, notes: '' },
  { id: 'med-vitamina-d', name: 'Vitamina D', strength: 1000, unit: 'UI', form: 'Cápsula', compartmentId: null, stock: 12, capacity: 30, notes: '' },
]

/*
 * [paciente, medicamento, pastillas por toma, horarios, instrucciones].
 * Cada paciente incluye el medicamento del compartimento con el que ya
 * estaba relacionado en Inventario (C1 Ernesto, C2 Roberto, C3 Carmen,
 * C4 Rosa María, C5 Esperanza, C6 Alfonso).
 */
const ASSIGNMENTS = [
  ['pat-carmen', 'med-atorvastatina', 1, ['21:00'], 'Con la cena'],
  ['pat-carmen', 'med-paracetamol', 1, ['08:00', '14:30'], 'Con alimentos'],
  ['pat-carmen', 'med-vitamina-d', 1, ['10:00'], ''],

  ['pat-roberto', 'med-losartan', 1, ['08:00', '20:00'], ''],
  ['pat-roberto', 'med-metformina', 1, ['08:00', '15:00'], 'Con alimentos'],
  ['pat-roberto', 'med-aas', 1, ['14:00'], 'Después de comer'],
  ['pat-roberto', 'med-atorvastatina', 1, ['22:00'], ''],

  ['pat-esperanza', 'med-levotiroxina', 1, ['06:00'], 'En ayunas'],
  ['pat-esperanza', 'med-vitamina-d', 1, ['16:15'], ''],

  ['pat-ernesto', 'med-metformina', 1, ['08:00', '14:45', '20:00'], 'Con alimentos'],
  ['pat-ernesto', 'med-losartan', 1, ['09:00'], ''],
  ['pat-ernesto', 'med-atorvastatina', 1, ['21:00'], ''],
  ['pat-ernesto', 'med-aas', 1, ['14:00'], 'Después de comer'],
  ['pat-ernesto', 'med-omeprazol', 1, ['07:00'], 'En ayunas'],

  ['pat-rosa', 'med-omeprazol', 1, ['07:00'], 'En ayunas'],
  ['pat-rosa', 'med-levotiroxina', 1, ['06:30'], 'En ayunas'],
  ['pat-rosa', 'med-paracetamol', 2, ['11:00', '17:00'], 'Con alimentos'],

  ['pat-alfonso', 'med-paracetamol', 1, ['08:00', '18:30'], 'Con alimentos'],
  ['pat-alfonso', 'med-losartan', 1, ['12:00'], ''],
]

/** Días atrás en que "empezaron" los tratamientos de la demo. */
const SEED_START_DAYS_AGO = 30

/**
 * Construye la semilla con fechas relativas a `now`, para que la demo se vea
 * igual cualquier día.
 *
 * @param {Date} [now]
 * @returns {{ patients: Patient[], medications: Medication[], assignments: Assignment[] }}
 */
export function createSeed(now = new Date()) {
  const timestamp = now.toISOString()
  const stamp = { createdAt: timestamp, updatedAt: timestamp }
  const startDate = toISODate(addDays(now, -SEED_START_DAYS_AGO))

  return {
    patients: PATIENTS.map((patient) => ({ photoUrl: null, ...patient, ...stamp })),
    medications: MEDICATIONS.map((medication) => ({ ...medication, ...stamp })),
    assignments: ASSIGNMENTS.map(([patientId, medicationId, quantity, times, instructions], index) => ({
      id: `asg-${index + 1}`,
      patientId,
      medicationId,
      quantity,
      times,
      days: DAILY,
      startDate,
      endDate: null,
      instructions,
      active: true,
      ...stamp,
    })),
  }
}
