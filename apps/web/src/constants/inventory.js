/** Un compartimento está "bajo" con 25% o menos de su capacidad. */
export const LOW_STOCK_RATIO = 0.25;

/** Con esta cantidad de pastillas o menos, el compartimento está en nivel crítico. */
export const CRITICAL_STOCK = 5;

/** Cada cuánto emite un evento el sensor simulado. */
export const SENSOR_INTERVAL_MS = 4200;

/** Eventos visibles en el feed "Actividad del sensor". */
export const MAX_EVENTS = 5;

/** Tipos de evento del dispensador (mismos nombres que usará el ESP32). */
export const SENSOR_EVENT = {
  doseDispensed: 'DOSE_DISPENSED',
  lowStock: 'LOW_STOCK',
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
