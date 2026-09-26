import { createContext } from 'react'

/**
 * Estado y acciones van en contexts separados: las acciones nunca cambian, así
 * que un componente que solo las usa no se re-renderiza cuando cambian los datos.
 */

/**
 * @typedef {object} DataState
 * @property {'loading' | 'ready' | 'error'} status
 * @property {Error | null} error
 * @property {import('../services/patientsService').Patient[]} patients
 * @property {import('../services/medicationsService').Medication[]} medications
 * @property {import('../services/assignmentsService').Assignment[]} assignments
 * @property {Record<string, { collection: string, item: object }[]>} pending Cambios optimistas en curso.
 */

/** @type {import('react').Context<DataState | null>} */
export const DataStateContext = createContext(null)

/** @type {import('react').Context<ReturnType<typeof import('./createDataActions').createDataActions> | null>} */
export const DataActionsContext = createContext(null)
