import { Eye, Pencil, Trash2 } from 'lucide-react'
import DropdownMenu from '../ui/DropdownMenu'

/**
 * Menú ⋯ de un paciente: ver detalle, editar y eliminar.
 *
 * @param {object} props
 * @param {import('../../services/patientsService').Patient} props.patient
 * @param {(patient: import('../../services/patientsService').Patient) => void} props.onView
 * @param {(patient: import('../../services/patientsService').Patient) => void} props.onEdit
 * @param {(patient: import('../../services/patientsService').Patient) => void} props.onDelete
 * @param {string} [props.className]
 */
function PatientActionsMenu({ patient, onView, onEdit, onDelete, className }) {
  return (
    <DropdownMenu
      label={`Acciones de ${patient.name}`}
      className={className}
      items={[
        { id: 'view', label: 'Ver detalle', icon: Eye, onSelect: () => onView(patient) },
        { id: 'edit', label: 'Editar', icon: Pencil, onSelect: () => onEdit(patient) },
        { id: 'delete', label: 'Eliminar', icon: Trash2, tone: 'danger', onSelect: () => onDelete(patient) },
      ]}
    />
  )
}

export default PatientActionsMenu
