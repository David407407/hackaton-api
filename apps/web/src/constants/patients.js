/*
 * Los hex de este archivo son de la ilustración del avatar (piel, cabello,
 * ropa, fondo), no del sistema de UI.
 */

export const PATIENT_TITLES = ['Doña', 'Don'];

export const PATIENT_LIMITS = {
  nameMin: 3,
  nameMax: 60,
  ageMin: 50,
  ageMax: 115,
};

/** @typedef {'bun' | 'short' | 'bald'} HairStyle */

/** @type {{ value: HairStyle, label: string }[]} */
export const HAIR_STYLES = [
  { value: 'bun', label: 'Chongo' },
  { value: 'short', label: 'Corto' },
  { value: 'bald', label: 'Calvo' },
];

/** Estilo de cabello por defecto según el tratamiento. */
export const DEFAULT_HAIR_BY_TITLE = { Doña: 'bun', Don: 'short' };

export const SKIN_TONES = [
  { value: '#f1c7a5', label: 'Claro' },
  { value: '#e3b08c', label: 'Medio claro' },
  { value: '#c98e6a', label: 'Medio' },
  { value: '#b27a55', label: 'Oscuro' },
];

/** Ropa y fondo del retrato; se reparten en orden para que no se repitan seguidos. */
export const AVATAR_OUTFITS = [
  { shirt: '#4a6eb0', bg: '#cfe9ea' },
  { shirt: '#114c5f', bg: '#f6ecd9' },
  { shirt: '#0799b6', bg: '#dfe6f3' },
];

export const DEFAULT_HAIR_COLOR = '#dcd6ce';

/**
 * Avatar inicial de un paciente nuevo.
 *
 * @param {'Don' | 'Doña'} title
 * @param {number} index Posición del paciente (para variar la ropa).
 */
export function createDefaultAvatar(title, index) {
  return {
    hairStyle: DEFAULT_HAIR_BY_TITLE[title],
    glasses: false,
    beard: false,
    mustache: false,
    skin: SKIN_TONES[1].value,
    hair: DEFAULT_HAIR_COLOR,
    ...AVATAR_OUTFITS[index % AVATAR_OUTFITS.length],
  };
}

/** Lado en px al que se reduce la foto antes de guardarla. */
export const PHOTO_SIZE = 256;
