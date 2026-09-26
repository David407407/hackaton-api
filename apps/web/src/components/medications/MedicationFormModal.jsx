import { useState } from 'react'
import CompartmentSelect from './CompartmentSelect'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import NumberStepper from '../ui/NumberStepper'
import SegmentedControl from '../ui/SegmentedControl'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import TextField from '../ui/TextField'
import {
  DEFAULT_CAPACITY,
  MEDICATION_FORMS,
  MEDICATION_LIMITS,
  MEDICATION_UNITS,
} from '../../constants/medications'
import useForm from '../../hooks/useForm'
import * as pillService from '../../services/pillService'
import { medicationLabel } from '../../utils/labels'
import { normalizeMedication, validateMedication } from '../../validation/medication'

const FORM_ID = 'medication-form'
const FORM_OPTIONS = MEDICATION_FORMS.map((form) => ({ value: form, label: form }))
const UNIT_OPTIONS = MEDICATION_UNITS.map((unit) => ({ value: unit, label: unit }))

const validate = (values) => validateMedication(normalizeMedication(values))

/** @param {import('../../services/medicationsService').Medication | null} medication */
function createInitialValues(medication) {
  if (medication) {
    const { name, strength, unit, form, compartmentId, stock, capacity, notes } = medication
    return { name, strength: String(strength), unit, form, compartmentId: compartmentId === null ? '' : String(compartmentId), stock, capacity, notes }
  }
  return {
    name: '',
    strength: '',
    unit: MEDICATION_UNITS[0],
    form: MEDICATION_FORMS[0],
    compartmentId: '',
    stock: DEFAULT_CAPACITY,
    capacity: DEFAULT_CAPACITY,
    notes: '',
  }
}

/**
 * Modal para dar de alta o editar un medicamento del catálogo.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {import('../../services/medicationsService').Medication | null} [props.medication] Sin él, crea uno nuevo.
 * @param {import('../../services/medicationsService').Medication[]} props.medications Todo el catálogo (para los compartimentos ocupados).
 * @param {() => void} props.onClose
 * @param {(medication: import('../../services/medicationsService').Medication, isEdit: boolean) => void} props.onSaved
 */
function MedicationFormModal({ open, ...props }) {
  return open ? <MedicationFormContent {...props} /> : null
}

function MedicationFormContent({ medication = null, medications, onClose, onSaved }) {
  const isEdit = Boolean(medication)
  const [initialValues] = useState(() => createInitialValues(medication))

  const { values, errors, isSubmitting, submitError, setValue, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues,
    validate,
    onSubmit: async (formValues) => {
      const saved = isEdit
        ? await pillService.updateMedication(medication.id, formValues)
        : await pillService.createMedication(formValues)
      onSaved(saved, isEdit)
    },
  })

  const capacity = Number.isInteger(values.capacity) ? values.capacity : MEDICATION_LIMITS.capacityMax

  return (
    <Modal
      open
      onClose={onClose}
      canClose={!isSubmitting}
      size="lg"
      title={isEdit ? 'Editar medicamento' : 'Nuevo medicamento'}
      description={
        isEdit ? medicationLabel(medication) : 'Agrégalo al catálogo y, si quieres, cárgalo en un compartimento.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={isSubmitting}>
            {isEdit ? 'Guardar cambios' : 'Guardar medicamento'}
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

        <TextField
          id={`${FORM_ID}-name`}
          name="name"
          label="Nombre"
          placeholder="Ej. Metformina"
          autoComplete="off"
          data-autofocus
          maxLength={MEDICATION_LIMITS.nameMax}
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.name}
        />

        <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-3">
          <TextField
            id={`${FORM_ID}-strength`}
            name="strength"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            label="Concentración"
            placeholder="850"
            className="min-w-0"
            value={values.strength}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.strength}
          />
          <Select
            id={`${FORM_ID}-unit`}
            name="unit"
            label="Unidad"
            options={UNIT_OPTIONS}
            value={values.unit}
            onValueChange={(unit) => setValue('unit', unit)}
            error={errors.unit}
          />
        </div>

        <SegmentedControl
          id={`${FORM_ID}-form`}
          name="form"
          label="Forma"
          options={FORM_OPTIONS}
          value={values.form}
          onValueChange={(form) => setValue('form', form)}
          error={errors.form}
        />

        <CompartmentSelect
          id={`${FORM_ID}-compartment`}
          value={values.compartmentId}
          onValueChange={(compartmentId) => setValue('compartmentId', compartmentId)}
          medications={medications}
          currentMedicationId={medication?.id}
          onBlur={() => handleBlur('compartmentId')}
          error={errors.compartmentId}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <NumberStepper
            id={`${FORM_ID}-stock`}
            name="stock"
            label="Stock actual"
            suffix="pastillas"
            min={0}
            max={capacity}
            value={values.stock}
            onValueChange={(stock) => setValue('stock', stock)}
            onBlur={() => handleBlur('stock')}
            error={errors.stock}
          />
          <NumberStepper
            id={`${FORM_ID}-capacity`}
            name="capacity"
            label="Capacidad"
            suffix="máx."
            min={MEDICATION_LIMITS.capacityMin}
            max={MEDICATION_LIMITS.capacityMax}
            value={values.capacity}
            onValueChange={(nextCapacity) => setValue('capacity', nextCapacity)}
            onBlur={() => handleBlur('capacity')}
            error={errors.capacity}
          />
        </div>

        <Textarea
          id={`${FORM_ID}-notes`}
          name="notes"
          label="Notas"
          placeholder="Ej. Tomar en ayunas, 30 min antes del desayuno."
          rows={2}
          maxLength={MEDICATION_LIMITS.notesMax}
          value={values.notes}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.notes}
        />
      </form>
    </Modal>
  )
}

export default MedicationFormModal
