/** Estado del dispensador (mock hasta conectar el dispositivo). */
export const DISPENSER = {
  id: 'DC-01',
  online: true,
  compartments: 4,
  signal: 98,
};

/**
 * Datos que todavía no se pueden derivar (no hay historial de tomas). Las
 * dosis del día ya salen de las asignaciones (ver utils/selectors).
 */
export const DOSE_SUMMARY = {
  /** Adherencia promedio de la semana anterior, para comparar con la actual. */
  previousWeekAdherence: 87,
};
