import { useDataActions } from './useDataContext'

/** Acción para volver a los datos de la semilla. */
export default function useDemoData() {
  const { resetDemoData } = useDataActions()
  return { resetDemoData }
}
