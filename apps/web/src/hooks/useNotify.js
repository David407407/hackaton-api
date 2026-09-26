import { useContext } from 'react'
import { ToastContext } from '../context/toastContext'

/**
 * Muestra un toast global (estable, se puede pasar a useCallback):
 *
 *   const notify = useNotify()
 *   notify('Paciente guardado')
 *   notify({ message: 'Paciente eliminado', action: { label: 'Deshacer', onClick: undo } })
 *   notify({ message: error.message, tone: 'error' })
 */
export default function useNotify() {
  const showToast = useContext(ToastContext)
  if (!showToast) throw new Error('useNotify debe usarse dentro de <ToastProvider>.')
  return showToast
}
