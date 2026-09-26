export const MEDICATION_UNITS = ['mg', 'mcg', 'g', 'UI'];

export const MEDICATION_FORMS = ['Tableta', 'Cápsula', 'Gragea'];

/** Compartimentos físicos del dispensador (C1–C4), uno por servo. */
export const COMPARTMENT_IDS = [1, 2, 3, 4];

export const MEDICATION_LIMITS = {
  nameMin: 2,
  nameMax: 60,
  strengthMax: 100000,
  capacityMin: 1,
  capacityMax: 60,
  notesMax: 200,
};

export const DEFAULT_CAPACITY = 30;

/** Filtros de la página de medicamentos. */
export const MEDICATION_FILTERS = {
  all: 'todos',
  loaded: 'en-dispensador',
  unloaded: 'sin-compartimento',
  lowStock: 'stock-bajo',
};
