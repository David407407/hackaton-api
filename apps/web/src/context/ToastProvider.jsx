import Toast from '../components/ui/Toast'
import useToast from '../hooks/useToast'
import { ToastContext } from './toastContext'

/**
 * Un solo toast para toda la app con sesión: cualquier componente lo muestra
 * con `useNotify()`.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 */
function ToastProvider({ children }) {
  const { toast, showToast, dismissToast } = useToast()

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <Toast toast={toast} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export default ToastProvider
