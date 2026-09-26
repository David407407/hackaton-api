import { TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import ScheduleSummary from './ScheduleSummary'
import Button from '../ui/Button'
import DaysPicker from '../ui/DaysPicker'
import FilterChip from '../ui/FilterChip'
import Modal from '../ui/Modal'
import NumberStepper from '../ui/NumberStepper'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import TextField from '../ui/TextField'
import TimeListInput from '../ui/TimeListInput'
import { ASSIGNMENT_LIMITS, DAILY, WEEKDAYS } from '../../constants/schedule'
import useAssignments from '../../hooks/useAssignments'
import useForm from '../../hooks/useForm'
import useMedications from '../../hooks/useMedications'
import { compartmentLabel, medicationLabel } from '../../utils/labels'
import { toISODate } from '../../utils/schedule'
import { normalizeAssignment, validateAssignment } from '../../validation/assignment'

const FORM_ID = 'assignment-form'
const WORKDAYS = [1, 2, 3, 4, 5]
const INSTRUCTION_SUGGESTIONS = ['Con alimentos', 'En ayunas', 'Antes de dormir', 'Después de comer']

const validate = (values) => validateAssignment(normalizeAssignment(values))

/**
 * @param {string} patientId
 * @param {import('../../services/assignmentsService').Assignment | null} assignment
 */
function createInitialValues(patientId, assignment) {
  if (assignment) {
    const { medicationId, quantity, times, days, startDate, endDate, instructions } = assignment
    return { patientId, medicationId, quantity, times, days, startDate, endDate: endDate ?? '', instructions }
  }
  return {
    patientId,
    medicationId: '',
    quantity: 1,
    times: ['08:00'],
    days: DAILY,
    startDate: toISODate(new Date()),
    endDate: '',
    instructions: '',
  }
}

/**
 * Modal para asignar un medicamento a un paciente (o editar la asignación):
 * medicamento, pastillas por toma, horarios, días, fechas e instrucciones,
 * con un resumen en vivo al pie.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {import('../../services/patientsService').Patient} props.patient
 * @param {import('../../services/assignmentsService').Assignment | null} [props.assignment] Sin ella, crea una nueva.
 * @param {() => void} props.onClose
 * @param {(assignment: import('../../services/assignmentsService').Assignment, isEdit: boolean) => void} props.onSaved
 */
function AssignmentFormModal({ open, ...props }) {
  return open ? <AssignmentFormContent {...props} /> : null
}

function AssignmentFormContent({ patient, assignment = null, onClose, onSaved }) {
  const isEdit = Boolean(assignment)
  const { medications } = useMedications()
  const { assignments, createAssignment, updateAssignment } = useAssignments(patient.id)
  const [initialValues] = useState(() => createInitialValues(patient.id, assignment))

  const { values, errors, isSubmitting, submitError, setValue, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues,
    validate,
    onSubmit: async (formValues) => {
      const saved = isEdit
        ? await updateAssignment(assignment.id, formValues)
        : await createAssignment(formValues)
      onSaved(saved, isEdit)
    },
  })

  // Los medicamentos que el paciente ya tiene activos no se pueden repetir.
  const medicationOptions = useMemo(() => {
    const activeIds = new Set(
      assignments.filter((item) => item.active && item.id !== assignment?.id).map((item) => item.medicationId),
    )
    return medications.map((medication) => {
      const place = medication.compartmentId ? compartmentLabel(medication.compartmentId) : 'Sin compartimento'
      const taken = activeIds.has(medication.id)
      return {
        value: medication.id,
        label: `${medicationLabel(medication)} · ${place}${taken ? ' (ya asignado)' : ''}`,
        disabled: taken,
      }
    })
  }, [medications, assignments, assignment])

  const selectedMedication = medications.find((medication) => medication.id === values.medicationId) ?? null

  return (
    <Modal
      open
      onClose={onClose}
      canClose={!isSubmitting}
      size="lg"
      title={isEdit ? 'Editar asignación' : 'Asignar medicamento'}
      description={`${patient.title} ${patient.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={isSubmitting}>
            {isEdit ? 'Guardar cambios' : 'Asignar'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="mt-6 space-y-5">
        {submitError && (
          <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger-ink">
            {submitError}
          </p>
        )}

        <div>
          <Select
            id={`${FORM_ID}-medication`}
            name="medicationId"
            label="Medicamento"
            placeholder="Elige un medicamento del catálogo"
            options={medicationOptions}
            value={values.medicationId}
            onValueChange={(medicationId) => setValue('medicationId', medicationId)}
            onBlur={handleBlur}
            error={errors.medicationId}
            data-autofocus={isEdit ? undefined : true}
          />
          {selectedMedication && selectedMedication.compartmentId === null && (
            <p
              role="status"
              className="mt-2 flex items-start gap-2 rounded-2xl bg-warning-soft px-3.5 py-2.5 text-xs font-medium text-warning-ink"
            >
              <TriangleAlert aria-hidden className="mt-px size-4 shrink-0" />
              Este medicamento no está cargado en el dispensador. La toma se registra, pero habrá que darla a mano.
            </p>
          )}
        </div>

        <NumberStepper
          id={`${FORM_ID}-quantity`}
          name="quantity"
          label="Pastillas por toma"
          min={ASSIGNMENT_LIMITS.quantityMin}
          max={ASSIGNMENT_LIMITS.quantityMax}
          value={values.quantity}
          onValueChange={(quantity) => setValue('quantity', quantity)}
          onBlur={() => handleBlur('quantity')}
          error={errors.quantity}
          className="sm:max-w-[240px]"
        />

        <TimeListInput
          id={`${FORM_ID}-times`}
          name="times"
          label="Horarios"
          max={ASSIGNMENT_LIMITS.timesMax}
          value={values.times}
          onValueChange={(times) => setValue('times', times)}
          error={errors.times}
        />

        <DaysPicker
          id={`${FORM_ID}-days`}
          name="days"
          label="Días"
          options={WEEKDAYS}
          allValue={DAILY}
          defaultSelection={WORKDAYS}
          value={values.days}
          onValueChange={(days) => setValue('days', days)}
          error={errors.days}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id={`${FORM_ID}-start`}
            name="startDate"
            type="date"
            label="Fecha de inicio"
            value={values.startDate}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.startDate}
          />
          <TextField
            id={`${FORM_ID}-end`}
            name="endDate"
            type="date"
            label="Fecha de fin (opcional)"
            min={values.startDate || undefined}
            value={values.endDate}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.endDate}
          />
        </div>

        <div>
          <Textarea
            id={`${FORM_ID}-instructions`}
            name="instructions"
            label="Instrucciones"
            placeholder="Ej. Con alimentos"
            rows={2}
            maxLength={ASSIGNMENT_LIMITS.instructionsMax}
            value={values.instructions}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.instructions}
          />
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Sugerencias de instrucciones">
            {INSTRUCTION_SUGGESTIONS.map((suggestion) => (
              <FilterChip
                key={suggestion}
                pressed={values.instructions === suggestion}
                onClick={() => setValue('instructions', suggestion)}
              >
                {suggestion}
              </FilterChip>
            ))}
          </div>
        </div>

        <ScheduleSummary
          medication={selectedMedication}
          quantity={values.quantity}
          times={values.times}
          days={values.days}
        />
      </form>
    </Modal>
  )
}

export default AssignmentFormModal
