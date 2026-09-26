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
import useDisclosure from '../../hooks/useDisclosure'
import useNotify from '../../hooks/useNotify'
import useNow from '../../hooks/useNow'
import { errorMessage } from '../../lib/errors'
import * as assignmentService from '../../services/assignmentService'
import { medicationLabel } from '../../utils/labels'
import { formatNextDose } from '../../utils/schedule'
import { compareAssignments, medsCount, nextDose } from '../../utils/selectors'

/**
 * Detalle de un paciente en un drawer: datos, próxima dosis y sus
 * medicamentos asignados (con alta, edición, pausa y baja de asignaciones en
 * la API).
 *
 * @param {object} props
 * @param {import('../../services/patientsService').Patient | null} props.patient Sin paciente no se muestra.
 * @param {import('../../services/assignmentsService').Assignment[]} props.assignments Las del paciente.
 * @param {import('../../services/medicationsService').Medication[]} props.medications Todo el catálogo.
 * @param {() => void} props.onClose
 * @param {(patient: import('../../services/patientsService').Patient) => void} props.onEdit
 * @param {(patient: import('../../services/patientsService').Patient) => void} props.onDelete
 * @param {(assignment: import('../../services/assignmentsService').Assignment) => void} props.onAssignmentSaved
 * @param {(assignmentId: string) => void} props.onAssignmentRemoved
 */
function PatientDetailDrawer({ patient, ...props }) {
  return patient ? <PatientDetailContent patient={patient} {...props} /> : null
}

function PatientDetailContent({
  patient,
  assignments: patientAssignments,
  medications,
  onClose,
  onEdit,
  onDelete,
  onAssignmentSaved,
  onAssignmentRemoved,
}) {
  const now = useNow()
  const assignments = useMemo(() => [...patientAssignments].sort(compareAssignments), [patientAssignments])
  const activeCount = medsCount(assignments, patient.id)
  const nextDoseLabel = formatNextDose(nextDose(assignments, patient.id, now))
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
        onAssignmentSaved(await assignmentService.setActive(assignment, active))
        notify(`${labelOf(assignment)} ${active ? 'activado' : 'pausado'}`)
      } catch (error) {
        notify({ message: errorMessage(error), tone: 'error' })
      }
    },
    [onAssignmentSaved, labelOf, notify],
  )

  const handleRemove = useCallback(
    async (assignment) => {
      try {
        const removed = await assignmentService.remove(assignment.id)
        onAssignmentRemoved(removed.id)
        notify({
          message: `${labelOf(assignment)} quitado`,
          action: {
            label: 'Deshacer',
            onClick: () =>
              assignmentService
                .restore(removed)
                .then(onAssignmentSaved)
                .catch((error) => notify({ message: errorMessage(error), tone: 'error' })),
          },
        })
      } catch (error) {
        notify({ message: errorMessage(error), tone: 'error' })
      }
    },
    [onAssignmentSaved, onAssignmentRemoved, labelOf, notify],
  )

  const handleSaved = (assignment, isEdit) => {
    onAssignmentSaved(assignment)
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
          {activeCount} {activeCount === 1 ? 'activo' : 'activos'}
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
        assignments={assignments}
        medications={medications}
        onClose={closeAssignmentForm}
        onSaved={handleSaved}
      />
    </Drawer>
  )
}

export default PatientDetailDrawer
