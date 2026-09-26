/**
 * @typedef {object} DoseSlot
 * @property {number} hour Hora de inicio del bloque de 2 h (0–23).
 * @property {number} planned Tomas programadas en ese bloque (derivado de las asignaciones).
 */

/** Temperatura interna con la que arranca el dispensador, en °C. */
export const INITIAL_TEMPERATURE = 22.4;

/**
 * Eventos con los que arranca el feed. `minutesAgo` se convierte a una hora
 * real al crear el estado inicial, para que la demo se vea bien a cualquier hora.
 * El medicamento y el paciente se toman del compartimento en ese momento; si
 * el compartimento está vacío, el evento se omite.
 */
export const INITIAL_SENSOR_EVENTS = [
  { id: 'seed-1', type: 'DOSE_DISPENSED', compartmentId: 3, minutesAgo: 3 },
  { id: 'seed-2', type: 'LOW_STOCK',      compartmentId: 2, minutesAgo: 18 },
  { id: 'seed-3', type: 'DOSE_DISPENSED', compartmentId: 6, minutesAgo: 120 },
];
