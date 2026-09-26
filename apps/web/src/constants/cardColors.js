/**
 * Tarjetas físicas que lee el sensor del dispensador. Las clases van completas
 * (nada de `bg-card-${color}`) para que Tailwind las detecte al compilar.
 */
export const CARD_COLORS = {
  rojo:     { label: 'Rojo',     bg: 'bg-card-rojo' },
  azul:     { label: 'Azul',     bg: 'bg-card-azul' },
  verde:    { label: 'Verde',    bg: 'bg-card-verde' },
  amarillo: { label: 'Amarillo', bg: 'bg-card-amarillo' },
  morado:   { label: 'Morado',   bg: 'bg-card-morado' },
  naranja:  { label: 'Naranja',  bg: 'bg-card-naranja' },
};

/** Valor del filtro que no restringe por color. */
export const ALL_CARD_COLORS = 'todas';
