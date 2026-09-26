import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PatientAvatar from '../patients/PatientAvatar'
import ConfirmDialog from '../ui/ConfirmDialog'
import { medicationLabel } from '../../utils/labels'

/**
 * Aviso de que un medicamento no se puede borrar porque hay pacientes que lo
 * tienen activo. Lista a esos pacientes con un enlace a su detalle.
 *
 * @param {object} props
 * @param {import('../../services/medicationsService').Medication} props.medication
 * @param {import('../../services/patientsService').Patient[]} props.patients
 * @param {() => void} props.onClose
 */
function MedicationInUseDialog({ medication, patients, onClose }) {
  return (
    <ConfirmDialog
      open
      onClose={onClose}
      tone="warning"
      title={`${medicationLabel(medication)} está en uso`}
      description="Quita la asignación primero. Estos pacientes lo tienen activo:"
    >
      <ul className="mt-5 space-y-2 text-left">
        {patients.map((patient) => (
          <li key={patient.id}>
            <Link
              to={`/pacientes?paciente=${encodeURIComponent(patient.id)}`}
              className="flex items-center gap-3 rounded-2xl bg-cream/55 px-3 py-2.5 transition hover:bg-cream focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30"
            >
              <PatientAvatar patient={patient} size={32} />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{patient.name}</span>
              <span className="text-xs font-medium text-indigo">Ver detalle</span>
              <ChevronRight aria-hidden className="size-4 text-indigo" />
            </Link>
          </li>
        ))}
      </ul>
    </ConfirmDialog>
  )
}

export default MedicationInUseDialog
