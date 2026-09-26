import { createSeed } from '../data/seed'

/*
 * "Base de datos" de la demo: un solo objeto JSON en localStorage.
 * Se guarda también en memoria, así la app sigue funcionando (sin persistir)
 * si localStorage no está disponible (modo privado, cuota llena…).
 */

const STORAGE_KEY = 'dosicare:v1'
export const SCHEMA_VERSION = 1

/**
 * @typedef {object} Database
 * @property {number} schemaVersion
 * @property {import('../services/patientsService').Patient[]} patients
 * @property {import('../services/medicationsService').Medication[]} medications
 * @property {import('../services/assignmentsService').Assignment[]} assignments
 */

/** @type {Database | null} */
let memory = null

function readStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    console.warn('[storage] No se pudieron leer los datos guardados.', error)
    return null
  }
}

/** @param {Database} db */
function writeStorage(db) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (error) {
    console.warn('[storage] No se pudieron guardar los datos; se conservan solo en esta sesión.', error)
  }
}

/**
 * Lleva los datos guardados a la versión actual del esquema. Aquí irán las
 * migraciones futuras (`if (db.schemaVersion === 1) db = migrateV1toV2(db)`).
 * Con una versión desconocida devuelve null y se vuelve a sembrar.
 *
 * @param {unknown} db
 * @returns {Database | null}
 */
function migrate(db) {
  if (!db || typeof db !== 'object') return null
  if (db.schemaVersion === SCHEMA_VERSION) return /** @type {Database} */ (db)
  return null
}

/** @returns {Database} */
const seedDatabase = () => ({ schemaVersion: SCHEMA_VERSION, ...createSeed() })

/**
 * Datos actuales. La primera vez (o si lo guardado no sirve) siembra la demo.
 *
 * @returns {Database}
 */
export function loadDb() {
  if (!memory) memory = migrate(readStorage()) ?? saveDb(seedDatabase())
  return memory
}

/**
 * Reemplaza los datos (en memoria y en localStorage).
 *
 * @param {Database} db
 */
export function saveDb(db) {
  memory = db
  writeStorage(db)
  return db
}

/** Vuelve a la semilla. */
export const resetDb = () => saveDb(seedDatabase())
