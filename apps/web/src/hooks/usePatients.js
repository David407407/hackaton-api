import { useDataActions, useDataState } from './useDataContext'

/**
 * Lista de pacientes y sus acciones.
 */
export default function usePatients() {
  const { patients, status, error } = useDataState()
  const { createPatient, updatePatient, deletePatient, restorePatient } = useDataActions()

  return {
    patients,
    isLoading: status === 'loading',
    error,
    createPatient,
    updatePatient,
    deletePatient,
    restorePatient,
  }
}
