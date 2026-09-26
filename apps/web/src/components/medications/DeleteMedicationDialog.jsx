import MedicationInUseDialog from './MedicationInUseDialog'
import ConfirmDialog from '../ui/ConfirmDialog'
import useMedications from '../../hooks/useMedications'
import useNotify from '../../hooks/useNotify'
import usePatientsByMedication from '../../hooks/usePatientsByMedication'
import { errorMessage } from '../../lib/errors'
import { compartmentLabel, medicationLabel } from '../../utils/labels'

const NO_PATIENTS = []

/**
 * Eliminar un medicamento. Si algún paciente lo tiene activo, muestra el aviso
 * de "en uso" (sin botón de confirmar); si no, pide confirmación y después
 * ofrece "Deshacer" durante 5 s.
 *
 * @param {object} props
 * @param {import('../../services/medicationsService').Medication | null} props.medication Sin él no se muestra.
 * @param {() => void} props.onClose
 */
function DeleteMedicationDialog({ medication, onClose }) {
  const patientsByMedication = usePatientsByMedication()
  if (!medication) return null

  const patients = patientsByMedication.get(medication.id) ?? NO_PATIENTS
  if (patients.length) return <MedicationInUseDialog medication={medication} patients={patients} onClose={onClose} />
  return <ConfirmDeleteMedication medication={medication} onClose={onClose} />
}

function ConfirmDeleteMedication({ medication, onClose }) {
  const { deleteMedication, restoreMedication } = useMedications()
  const notify = useNotify()
  const label = medicationLabel(medication)

  const undo = async (snapshot) => {
    try {
      await restoreMedication(snapshot)
      notify(`${label} restaurado`)
    } catch (error) {
      notify({ message: `No se pudo restaurar: ${errorMessage(error)}`, tone: 'error' })
    }
  }

  const handleConfirm = async () => {
    try {
      const snapshot = await deleteMedication(medication.id)
      onClose()
      notify({ message: 'Medicamento eliminado', action: { label: 'Deshacer', onClick: () => undo(snapshot) } })
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
