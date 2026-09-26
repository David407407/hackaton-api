import { useEffect, useMemo, useReducer } from 'react'
import * as assignmentsService from '../services/assignmentsService'
import * as medicationsService from '../services/medicationsService'
import * as patientsService from '../services/patientsService'
import { createDataActions } from './createDataActions'
import { DataActionsContext, DataStateContext } from './dataContext'
import { dataReducer, INITIAL_DATA_STATE } from './dataReducer'

/**
 * Carga pacientes, medicamentos y asignaciones una sola vez y los comparte con
 * toda la app. Léelos con los hooks de dominio (usePatients, useMedications,
 * useAssignments, usePatient), no con los contexts directamente.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 */
function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, INITIAL_DATA_STATE)

  useEffect(() => {
    let ignore = false
    Promise.all([patientsService.list(), medicationsService.list(), assignmentsService.list()]).then(
      ([patients, medications, assignments]) => {
        if (!ignore) dispatch({ type: 'LOADED', data: { patients, medications, assignments } })
      },
      (error) => {
        if (!ignore) dispatch({ type: 'LOAD_FAILED', error })
      },
    )
    return () => {
      ignore = true
    }
  }, [])

  // `dispatch` nunca cambia: las acciones se crean una sola vez.
  const actions = useMemo(() => createDataActions(dispatch), [])

  return (
    <DataActionsContext.Provider value={actions}>
      <DataStateContext.Provider value={state}>{children}</DataStateContext.Provider>
    </DataActionsContext.Provider>
  )
}

export default DataProvider
