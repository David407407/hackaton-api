import { Plus } from 'lucide-react'
import AssignmentItem from './AssignmentItem'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

/**
 * Asignaciones de un paciente, o un estado vacío con el botón para asignar.
 *
 * @param {object} props
 * @param {import('../../services/assignmentsService').Assignment[]} props.assignments
 * @param {Map<string, import('../../services/medicationsService').Medication>} props.medicationsById
 * @param {(assignment: import('../../services/assignmentsService').Assignment, active: boolean) => void} props.onToggle
 * @param {(assignment: import('../../services/assignmentsService').Assignment) => void} props.onEdit
 * @param {(assignment: import('../../services/assignmentsService').Assignment) => void} props.onRemove
 * @param {() => void} props.onAdd
 */
function AssignmentList({ assignments, medicationsById, onToggle, onEdit, onRemove, onAdd }) {
  if (!assignments.length) {
    return (
      <EmptyState
        className="p-8"
        action={
          <Button size="sm" icon={Plus} onClick={onAdd}>
            Asignar medicamento
          </Button>
        }
      >
        Todavía no tiene medicamentos asignados.
      </EmptyState>
    )
  }

  return (
    <ul className="space-y-3">
      {assignments.map((assignment) => {
        const medication = medicationsById.get(assignment.medicationId)
        if (!medication) return null
        return (
          <AssignmentItem
            key={assignment.id}
            assignment={assignment}
            medication={medication}
            onToggle={onToggle}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        )
      })}
    </ul>
  )
}

export default AssignmentList
