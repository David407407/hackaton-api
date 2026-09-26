import MedicationInUseDialog from './MedicationInUseDialog'
import ConfirmDialog from '../ui/ConfirmDialog'
import useNotify from '../../hooks/useNotify'
import { errorMessage } from '../../lib/errors'
import * as pillService from '../../services/pillService'
import { compartmentLabel, medicationLabel } from '../../utils/labels'

const NO_PATIENTS = []

/**
 * Eliminar un medicamento. Si algún paciente lo tiene asignado, muestra el
 * aviso de "en uso" (sin botón de confirmar); si no, pide confirmación y
 * después ofrece "Deshacer" durante 5 s.
 *
 * @param {object} props
 * @param {import('../../services/medicationsService').Medication | null} props.medication Sin él no se muestra.
 * @param {Map<string, import('../../services/patientsService').Patient[]>} props.patientsByMedication
 * @param {() => void} props.onClose
 * @param {(medication: import('../../services/medicationsService').Medication) => void} [props.onDeleted]
 * @param {(medication: import('../../services/medicationsService').Medication) => void} [props.onRestored] Recibe el medicamento recreado (con otro id).
 */
function DeleteMedicationDialog({ medication, patientsByMedication, onClose, onDeleted, onRestored }) {
  if (!medication) return null

  const patients = patientsByMedication.get(medication.id) ?? NO_PATIENTS
  if (patients.length) return <MedicationInUseDialog medication={medication} patients={patients} onClose={onClose} />
  return (
    <ConfirmDeleteMedication medication={medication} onClose={onClose} onDeleted={onDeleted} onRestored={onRestored} />
  )
}

function ConfirmDeleteMedication({ medication, onClose, onDeleted, onRestored }) {
  const notify = useNotify()
  const label = medicationLabel(medication)

  const undo = async () => {
    try {
      const restored = await pillService.restoreMedication(medication)
      onRestored?.(restored)
      notify(`${label} restaurado`)
    } catch (error) {
      notify({ message: `No se pudo restaurar: ${errorMessage(error)}`, tone: 'error' })
    }
  }

  const handleConfirm = async () => {
    try {
      await pillService.removeMedication(medication.id)
      onClose()
      onDeleted?.(medication)
      notify({ message: 'Medicamento eliminado', action: { label: 'Deshacer', onClick: undo } })
    } catch (error) {
      onClose()
      notify({ message: errorMessage(error), tone: 'error' })
    }
  }

  const releases = medication.compartmentId !== null ? ` y se liberará el compartimento ${compartmentLabel(medication.compartmentId)}` : ''

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={handleConfirm}
      tone="danger"
      title={`¿Eliminar ${label}?`}
      description={`Se quitará del catálogo${releases}.`}
      confirmLabel="Eliminar"
    />
  )
}

export default DeleteMedicationDialog
