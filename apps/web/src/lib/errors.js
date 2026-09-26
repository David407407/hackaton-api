/**
 * Errores tipados de la capa de datos. Los formularios leen `fields`
 * ({ campo: 'mensaje' }) para pintar cada error debajo de su campo.
 */

/** Datos inválidos (formato, rangos, campos obligatorios). */
export class ValidationError extends Error {
  /** @param {Record<string, string>} fields */
  constructor(fields, message = 'Revisa los campos marcados.') {
    super(message)
    this.name = 'ValidationError'
    this.fields = fields
  }
}

/** Choca con otro registro: tarjeta o compartimento ocupado, asignación duplicada. */
export class ConflictError extends Error {
  /** @param {Record<string, string>} fields */
  constructor(fields, message = Object.values(fields)[0]) {
    super(message)
    this.name = 'ConflictError'
    this.fields = fields
  }
}

/** No se puede borrar porque otros registros dependen de él. */
export class InUseError extends Error {
  /**
   * @param {string} message
   * @param {string[]} patientIds Pacientes que lo tienen asignado.
   */
  constructor(message, patientIds) {
    super(message)
    this.name = 'InUseError'
    this.patientIds = patientIds
  }
}

export class NotFoundError extends Error {
  constructor(message = 'El registro ya no existe.') {
    super(message)
    this.name = 'NotFoundError'
  }
}

/**
 * Mensaje legible de cualquier error para mostrarlo en un toast.
 *
 * @param {unknown} error
 */
export function errorMessage(error) {
  return error instanceof Error && error.message ? error.message : 'Algo salió mal. Inténtalo de nuevo.'
}
