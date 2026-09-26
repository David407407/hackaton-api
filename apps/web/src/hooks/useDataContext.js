import { useContext } from 'react'
import { DataActionsContext, DataStateContext } from '../context/dataContext'

/** Estado compartido. Solo para los hooks de dominio. */
export function useDataState() {
  const state = useContext(DataStateContext)
  if (!state) throw new Error('useDataState debe usarse dentro de <DataProvider>.')
  return state
}

/** Acciones compartidas (estables). Solo para los hooks de dominio. */
export function useDataActions() {
  const actions = useContext(DataActionsContext)
  if (!actions) throw new Error('useDataActions debe usarse dentro de <DataProvider>.')
  return actions
}
