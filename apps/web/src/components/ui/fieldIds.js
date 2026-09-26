import clsx from 'clsx'

/** Id del mensaje de error de un campo. @param {string} id */
export const errorIdOf = (id) => `${id}-error`

/** Id del texto de ayuda de un campo. @param {string} id */
export const hintIdOf = (id) => `${id}-hint`

/**
 * Valor de `aria-describedby` para el control de un campo.
 *
 * @param {string} id
 * @param {{ hint?: import('react').ReactNode, error?: string }} parts
 */
export const describedByOf = (id, { hint, error }) =>
  clsx(hint && hintIdOf(id), error && errorIdOf(id)) || undefined

/** Contenedor de controles tipo input (fondo crema, anillo, foco teal). */
export const CONTROL_BOX =
  'rounded-2xl bg-cream/45 ring-1 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-teal'

/** Anillo del control según tenga error o no. @param {string | undefined} error */
export const controlRing = (error) => (error ? 'ring-danger/60' : 'ring-ink/10')
