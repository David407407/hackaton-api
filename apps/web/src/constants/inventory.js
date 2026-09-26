/** Un compartimento está "bajo" con 25% o menos de su capacidad. */
export const LOW_STOCK_RATIO = 0.25;

/** Con esta cantidad de pastillas o menos, el compartimento está en nivel crítico. */
export const CRITICAL_STOCK = 5;

/** Cada cuánto se vuelve a consultar la API para ver lo que entregó el dispensador. */
export const INVENTORY_POLL_MS = 15_000;

/** Si el Arduino pidió una tarea en este lapso, se considera en línea (consulta seguido). */
export const DISPENSER_ONLINE_MS = 2 * 60_000;

/** Eventos visibles en el feed "Actividad del sensor". */
export const MAX_EVENTS = 5;

/** Tipos de evento del feed del dispensador. */
export const SENSOR_EVENT = {
  doseDispensed: 'DOSE_DISPENSED',
  doseMissed: 'DOSE_MISSED',
};

/**
 * Relleno de las barras de stock (Inventario y catálogo de medicamentos):
 * ≤ 25% warn, < 60% indigo, el resto teal. Ver stockFillLevel().
 */
export const STOCK_FILL = {
  low: 'bg-warn',
  medium: 'bg-indigo',
  high: 'bg-teal',
};
