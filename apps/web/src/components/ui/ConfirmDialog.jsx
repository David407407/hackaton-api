import clsx from 'clsx'
import { Trash2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import Button from './Button'
import Modal from './Modal'

const TONES = {
  danger: { icon: Trash2, circle: 'bg-danger-soft text-danger-ink', button: 'danger' },
  warning: { icon: TriangleAlert, circle: 'bg-warning-soft text-warning-ink', button: 'primary' },
}

/**
 * Confirmación de una acción: ícono en círculo, título, descripción y botones.
 * Sin `confirmLabel` es solo un aviso (un único botón para cerrar).
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {() => Promise<void> | void} [props.onConfirm] Mientras corre, el botón muestra carga y el diálogo no se cierra.
 * @param {'danger' | 'warning'} [props.tone='danger']
 * @param {import('react').ElementType} [props.icon] Reemplaza al ícono del tono.
 * @param {string} props.title
 * @param {import('react').ReactNode} [props.description]
 * @param {string} [props.confirmLabel] Sin él no hay botón de confirmar.
 * @param {string} [props.cancelLabel='Cancelar']
 * @param {import('react').ReactNode} [props.children] Contenido extra bajo la descripción.
 */
function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  tone = 'danger',
  icon,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  children,
}) {
  const [isConfirming, setIsConfirming] = useState(false)
  const styles = TONES[tone]
  const Icon = icon ?? styles.icon

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm?.()
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      role="alertdialog"
      size="sm"
      align="center"
      canClose={!isConfirming}
      title={title}
      description={description}
      icon={
        <span className={clsx('mx-auto mb-4 grid size-14 place-items-center rounded-full', styles.circle)}>
          <Icon aria-hidden className="size-6" />
        </span>
      }
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isConfirming}
            data-autofocus
            className="sm:min-w-28"
          >
            {confirmLabel ? cancelLabel : 'Entendido'}
          </Button>
          {confirmLabel && (
            <Button variant={styles.button} onClick={handleConfirm} loading={isConfirming} className="sm:min-w-28">
              {confirmLabel}
            </Button>
          )}
        </>
      }
    >
      {children}
    </Modal>
  )
}

export default ConfirmDialog
