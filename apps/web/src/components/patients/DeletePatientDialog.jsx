import ConfirmDialog from '../ui/ConfirmDialog'
import useNotify from '../../hooks/useNotify'
import { errorMessage } from '../../lib/errors'
import * as patientService from '../../services/patientService'

/** "Se eliminarán también sus 3 medicamentos asignados." @param {number} count */
function cascadeMessage(count) {
  if (count === 0) return 'No tiene medicamentos asignados.'
  if (count === 1) return 'Se eliminará también su medicamento asignado.'
  return `Se eliminarán también sus ${count} medicamentos asignados.`
}

/**
 * Confirmación para eliminar a un paciente en la API (y, en cascada, sus
 * asignaciones). Después muestra un toast con "Deshacer" durante 5 s.
 *
 * @param {object} props
 * @param {import('../../services/patientsService').Patient | null} props.patient Sin paciente no se muestra.
 * @param {number} props.assignmentCount Asignaciones que se borrarán con él.
 * @param {() => void} props.onClose
 * @param {(patient: import('../../services/patientsService').Patient) => void} [props.onDeleted]
 * @param {(restored: { patient: object, assignments: object[] }) => void} [props.onRestored] Recreados con otros ids.
 */
function DeletePatientDialog({ patient, ...props }) {
  return patient ? <DeletePatientContent patient={patient} {...props} /> : null
}

function DeletePatientContent({ patient, assignmentCount, onClose, onDeleted, onRestored }) {
  const notify = useNotify()

  const undo = async (assignments) => {
    try {
      const restored = await patientService.restore(patient, assignments)
      onRestored?.(restored)
      notify('Paciente restaurado')
    } catch (error) {
      notify({ message: `No se pudo restaurar: ${errorMessage(error)}`, tone: 'error' })
    }
  }

  const handleConfirm = async () => {
    try {
      const assignments = await patientService.remove(patient.id)
      onClose()
      onDeleted?.(patient)
      notify({ message: 'Paciente eliminado', action: { label: 'Deshacer', onClick: () => undo(assignments) } })
    } catch (error) {
      onClose()
      notify({ message: errorMessage(error), tone: 'error' })
    }
  }

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={handleConfirm}
      tone="danger"
      title={`¿Eliminar a ${patient.name}?`}
      description={`${cascadeMessage(assignmentCount)} Su tarjeta quedará libre.`}
      confirmLabel="Eliminar"
    />
  )
}

export default DeletePatientDialog
