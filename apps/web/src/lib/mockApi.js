/*
 * Utilidades para que los servicios se comporten como una API REST: todo es
 * asíncrono, tarda un poco y devuelve copias (nunca referencias internas).
 */

const LATENCY_MS = 250

/** Espera la "latencia de red" simulada. */
export const simulateLatency = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

export const newId = () => crypto.randomUUID()

export const nowISO = () => new Date().toISOString()

/** @template T @param {T} value @returns {T} */
export const clone = (value) => structuredClone(value)

/**
 * Lanza `error` si `fields` trae algún mensaje.
 *
 * @param {Record<string, string>} fields
 * @param {(fields: Record<string, string>) => Error} createError
 */
export function throwIfErrors(fields, createError) {
  if (Object.keys(fields).length) throw createError(fields)
}
