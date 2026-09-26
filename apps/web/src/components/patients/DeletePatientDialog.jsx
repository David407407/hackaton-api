import ConfirmDialog from '../ui/ConfirmDialog'
import useAssignments from '../../hooks/useAssignments'
import useNotify from '../../hooks/useNotify'
import usePatients from '../../hooks/usePatients'
import { errorMessage } from '../../lib/errors'

/** "Se eliminarán también sus 3 medicamentos asignados." @param {number} count */
function cascadeMessage(count) {
  if (count === 0) return 'No tiene medicamentos asignados.'
  if (count === 1) return 'Se eliminará también su medicamento asignado.'
  return `Se eliminarán también sus ${count} medicamentos asignados.`
}

/**
 * Confirmación para eliminar a un paciente (y, en cascada, sus asignaciones).
 * Después muestra un toast con "Deshacer" durante 5 s.
 *
 * @param {object} props
 * @param {import('../../services/patientsService').Patient | null} props.patient Sin paciente no se muestra.
 * @param {() => void} props.onClose
 * @param {(patient: import('../../services/patientsService').Patient) => void} [props.onDeleted]
 */
function DeletePatientDialog({ patient, onClose, onDeleted }) {
  return patient ? <DeletePatientContent patient={patient} onClose={onClose} onDeleted={onDeleted} /> : null
}

function DeletePatientContent({ patient, onClose, onDeleted }) {
  const { deletePatient, restorePatient } = usePatients()
  const { assignments } = useAssignments(patient.id)
  const notify = useNotify()

  const undo = async (snapshot) => {
    try {
      await restorePatient(snapshot)
      notify('Paciente restaurado')
    } catch (error) {
      notify({ message: `No se pudo restaurar: ${errorMessage(error)}`, tone: 'error' })
    }
  }

  const handleConfirm = async () => {
    try {
      const snapshot = await deletePatient(patient.id)
      onClose()
      onDeleted?.(patient)
      notify({ message: 'Paciente eliminado', action: { label: 'Deshacer', onClick: () => undo(snapshot) } })
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
      description={`${cascadeMessage(assignments.length)} Su tarjeta quedará libre.`}
      confirmLabel="Eliminar"
    />
  )
}

export default DeletePatientDialog
