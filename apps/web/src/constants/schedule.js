/** Valor de `days` cuando la toma es diaria. */
export const DAILY = 'daily';

/** Días ISO: 1 = lunes … 7 = domingo. */
export const WEEKDAYS = [
  { value: 1, short: 'L', label: 'Lunes' },
  { value: 2, short: 'M', label: 'Martes' },
  { value: 3, short: 'M', label: 'Miércoles' },
  { value: 4, short: 'J', label: 'Jueves' },
  { value: 5, short: 'V', label: 'Viernes' },
  { value: 6, short: 'S', label: 'Sábado' },
  { value: 7, short: 'D', label: 'Domingo' },
];

export const ASSIGNMENT_LIMITS = {
  quantityMin: 1,
  quantityMax: 4,
  timesMin: 1,
  timesMax: 6,
  instructionsMax: 140,
};

/** Horas de inicio de los bloques de 2 h de la gráfica "Dosis del día". */
export const DOSE_BLOCK_HOURS = [6, 8, 10, 12, 14, 16, 18, 20, 22];
