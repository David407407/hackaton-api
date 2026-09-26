import { clone, simulateLatency } from '../lib/mockApi'
import { resetDb } from '../lib/storage'

// TODO: reemplazar por fetch a la API (POST /api/demo/reset) o quitarlo en producción.

/**
 * Vuelve a los datos de la semilla y devuelve las tres colecciones.
 *
 * @returns {Promise<Omit<import('../lib/storage').Database, 'schemaVersion'>>}
 */
export async function resetDemoData() {
  await simulateLatency()
  const { patients, medications, assignments } = resetDb()
  return clone({ patients, medications, assignments })
}
