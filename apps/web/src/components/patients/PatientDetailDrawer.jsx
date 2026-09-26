import { Clock, Pencil, Pill, Plus, Trash2 } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import CardColorBadge from './CardColorBadge'
import PatientAvatar from './PatientAvatar'
import PatientStatusBadge from './PatientStatusBadge'
import AssignmentFormModal from '../assignments/AssignmentFormModal'
import AssignmentList from '../assignments/AssignmentList'
import Button from '../ui/Button'
import Drawer from '../ui/Drawer'
import InfoTile from '../ui/InfoTile'
import useAssignments from '../../hooks/useAssignments'
import useDisclosure from '../../hooks/useDisclosure'
import useMedications from '../../hooks/useMedications'
import useNotify from '../../hooks/useNotify'
import usePatient from '../../hooks/usePatient'
import { errorMessage } from '../../lib/errors'
import { medicationLabel } from '../../utils/labels'

/**
 * Detalle de un paciente en un drawer: datos, próxima dosis y sus
 * medicamentos asignados (con alta, edición, pausa y baja de asignaciones).
 *
 * @param {object} props
 * @param {string | null} props.patientId Sin id (o si el paciente no existe) no se muestra.
 * @param {() => void} props.onClose
 * @param {(patient: import('../../services/patientsService').Patient) => void} props.onEdit
 * @param {(patient: import('../../services/patientsService').Patient) => void} props.onDelete
 */
function PatientDetailDrawer({ patientId, onClose, onEdit, onDelete }) {
  const { patient, medsCount, nextDoseLabel } = usePatient(patientId)
  if (!patient) return null
  return (
    <PatientDetailContent
      patient={patient}
      medsCount={medsCount}
      nextDoseLabel={nextDoseLabel}
      onClose={onClose}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  )
}

function PatientDetailContent({ patient, medsCount, nextDoseLabel, onClose, onEdit, onDelete }) {
  const { assignments, toggleAssignment, deleteAssignment, restoreAssignment } = useAssignments(patient.id)
  const { medications } = useMedications()
  const assignmentForm = useDisclosure()
  const { open: openAssignmentForm, close: closeAssignmentForm } = assignmentForm
  const notify = useNotify()

  const medicationsById = useMemo(() => new Map(medications.map((item) => [item.id, item])), [medications])
  const labelOf = useCallback(
    (assignment) => {
      const medication = medicationsById.get(assignment.medicationId)
      return medication ? medicationLabel(medication) : 'El medicamento'
    },
    [medicationsById],
  )

  const handleToggle = useCallback(
    async (assignment, active) => {
      try {
        await toggleAssignment(assignment.id, active)
        notify(`${labelOf(assignment)} ${active ? 'activado' : 'pausado'}`)
      } catch (error) {
        notify({ message: errorMessage(error), tone: 'error' })
      }
    },
    [toggleAssignment, labelOf, notify],
  )

  const handleRemove = useCallback(
    async (assignment) => {
      try {
        const removed = await deleteAssignment(assignment.id)
        notify({
          message: `${labelOf(assignment)} quitado`,
          action: {
            label: 'Deshacer',
            onClick: () =>
              restoreAssignment(removed).catch((error) => notify({ message: errorMessage(error), tone: 'error' })),
          },
        })
      } catch (error) {
        notify({ message: errorMessage(error), tone: 'error' })
      }
    },
    [deleteAssignment, restoreAssignment, labelOf, notify],
  )

  const handleSaved = (assignment, isEdit) => {
    closeAssignmentForm()
    notify(isEdit ? 'Asignación actualizada' : `${labelOf(assignment)} asignado`)
  }

  const openCreate = useCallback(() => openAssignmentForm(null), [openAssignmentForm])

  return (
    <Drawer
      open
      onClose={onClose}
      title={patient.name}
      description={`${patient.title} · ${patient.age} años`}
      leading={<PatientAvatar patient={patient} size={80} className="ring-4 ring-cream" />}
      headerExtra={
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardColorBadge color={patient.card} />
            <PatientStatusBadge status={patient.status} />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={Pencil} onClick={() => onEdit(patient)}>
              Editar
            </Button>
            <Button variant="dangerSoft" size="sm" icon={Trash2} onClick={() => onDelete(patient)}>
              Eliminar
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <InfoTile label="Próxima dosis" icon={Clock} iconClassName="text-teal">
          {nextDoseLabel}
        </InfoTile>
        <InfoTile label="Medicamentos" icon={Pill} iconClassName="text-indigo">
          {medsCount} {medsCount === 1 ? 'activo' : 'activos'}
        </InfoTile>
      </div>

      <section aria-labelledby="assigned-medications" className="mt-7">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 id="assigned-medications" className="text-base font-semibold text-ink">
            Medicamentos asignados
          </h3>
          {assignments.length > 0 && (
            <Button size="sm" icon={Plus} onClick={openCreate} className="whitespace-nowrap">
              Asignar medicamento
            </Button>
          )}
        </div>
        <AssignmentList
          assignments={assignments}
          medicationsById={medicationsById}
          onToggle={handleToggle}
          onEdit={openAssignmentForm}
          onRemove={handleRemove}
          onAdd={openCreate}
        />
      </section>

      <AssignmentFormModal
        open={assignmentForm.isOpen}
        patient={patient}
        assignment={assignmentForm.payload}
        onClose={closeAssignmentForm}
        onSaved={handleSaved}
      />
    </Drawer>
  )
}

export default PatientDetailDrawer
