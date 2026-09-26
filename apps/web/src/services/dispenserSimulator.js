import { SENSOR_EVENT, SENSOR_INTERVAL_MS } from '../constants/inventory'
import { INITIAL_TEMPERATURE } from '../data/inventory'

/**
 * Evento que manda el dispensador cada vez que entrega una dosis: qué tarjeta
 * leyó, de qué compartimento sacó pastillas y cuántas.
 *
 * @typedef {object} DispenserEvent
 * @property {string} id Único por evento.
 * @property {'DOSE_DISPENSED'} type
 * @property {string} card Color de la tarjeta que leyó el sensor.
 * @property {number} compartmentId
 * @property {number} quantity Pastillas entregadas.
 * @property {number} at Timestamp (ms).
 * @property {number} [temperature] Temperatura interna medida, en °C.
 */

/**
 * Toma que el dispensador podría entregar ahora (ver dispenseCandidates).
 *
 * @typedef {object} DispenseCandidate
 * @property {string} card
 * @property {number} compartmentId
 * @property {number} quantity
 */

/**
 * Fuente de eventos del dispensador. El simulador y la conexión real con el
 * ESP32 exponen exactamente esta interfaz, así que useDispenser no distingue
 * entre una y otra.
 *
 * @typedef {object} DispenserSource
 * @property {(onEvent: (event: DispenserEvent) => void) => () => void} subscribe
 *   Empieza a escuchar y devuelve la función para dejar de hacerlo.
 */

const TEMPERATURE_RANGE = { min: 21.6, max: 23.2 }

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)]

/**
 * Sensor falso: cada `intervalMs` elige al azar una asignación activa real
 * (paciente + medicamento cargado con stock suficiente), "lee" la tarjeta del
 * paciente y entrega su dosis. También reporta la temperatura interna, que
 * varía ±0.1 °C por lectura.
 *
 * Se pausa mientras la pestaña no está visible: al volver no llegan ráfagas
 * de eventos acumulados.
 *
 * TODO: reemplazar por WebSocket/MQTT del ESP32 con la misma interfaz
 * `subscribe`, p. ej.:
 *   subscribe(onEvent) {
 *     const socket = new WebSocket(DISPENSER_WS_URL)
 *     socket.onmessage = (message) => onEvent(JSON.parse(message.data))
 *     return () => socket.close()
 *   }
 *
 * @param {object} options
 * @param {() => DispenseCandidate[]} options.getCandidates
 *   Tomas posibles con los datos actuales (el hardware real lo sabe por la
 *   tarjeta que acercan y su agenda).
 * @param {number} [options.intervalMs]
 * @returns {DispenserSource}
 */
export function createDispenserSimulator({ getCandidates, intervalMs = SENSOR_INTERVAL_MS }) {
  let temperature = INITIAL_TEMPERATURE
  let sequence = 0

  const readTemperature = () => {
    const next = temperature + pickRandom([-0.1, 0.1])
    const clamped = Math.min(TEMPERATURE_RANGE.max, Math.max(TEMPERATURE_RANGE.min, next))
    temperature = Math.round(clamped * 10) / 10
    return temperature
  }

  return {
    subscribe(onEvent) {
      let intervalId = null

      const tick = () => {
        const candidates = getCandidates()
        if (!candidates.length) return
        sequence += 1
        onEvent({
          id: `sim-${Date.now()}-${sequence}`,
          type: SENSOR_EVENT.doseDispensed,
          ...pickRandom(candidates),
          at: Date.now(),
          temperature: readTemperature(),
        })
      }

      const start = () => {
        if (intervalId === null) intervalId = setInterval(tick, intervalMs)
      }
      const stop = () => {
        clearInterval(intervalId)
        intervalId = null
      }
      const handleVisibility = () => (document.hidden ? stop() : start())

      document.addEventListener('visibilitychange', handleVisibility)
      if (!document.hidden) start()

      return () => {
        document.removeEventListener('visibilitychange', handleVisibility)
        stop()
      }
    },
  }
}
