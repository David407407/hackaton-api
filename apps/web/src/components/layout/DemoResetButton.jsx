import { RotateCcw } from 'lucide-react'
import ConfirmDialog from '../ui/ConfirmDialog'
import useDemoData from '../../hooks/useDemoData'
import useDisclosure from '../../hooks/useDisclosure'
import useNotify from '../../hooks/useNotify'
import { errorMessage } from '../../lib/errors'

/**
 * Botón del sidebar para volver a los datos de demo (deja la app limpia antes
 * de presentar). Pide confirmación.
 */
function DemoResetButton() {
  const { isOpen, open, close } = useDisclosure()
  const { resetDemoData } = useDemoData()
  const notify = useNotify()

  const handleConfirm = async () => {
    try {
      await resetDemoData()
      close()
      notify('Datos de demo restablecidos')
    } catch (error) {
      close()
      notify({ message: errorMessage(error), tone: 'error' })
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => open()}
        aria-label="Restablecer datos de demo"
        title="Restablecer datos de demo"
        className="grid size-8 shrink-0 place-items-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30"
      >
        <RotateCcw aria-hidden className="size-[18px]" />
      </button>
      <ConfirmDialog
        open={isOpen}
        onClose={close}
        onConfirm={handleConfirm}
        tone="warning"
        icon={RotateCcw}
        title="¿Restablecer datos de demo?"
        description="Se borrarán los pacientes, medicamentos y asignaciones que hayas creado o editado, y todo volverá a la semilla inicial."
        confirmLabel="Restablecer"
      />
    </>
  )
}

export default DemoResetButton
