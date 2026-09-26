import { useMemo, useState } from 'react'
import AvatarCustomizer from './AvatarCustomizer'
import CardColorBadge from './CardColorBadge'
import CardColorPicker from './CardColorPicker'
import PatientAvatar from './PatientAvatar'
import Button from '../ui/Button'
import Drawer from '../ui/Drawer'
import NumberStepper from '../ui/NumberStepper'
import SegmentedControl from '../ui/SegmentedControl'
import TextField from '../ui/TextField'
import { CARD_COLORS } from '../../constants/cardColors'
import { createDefaultAvatar, DEFAULT_HAIR_BY_TITLE, PATIENT_LIMITS, PATIENT_TITLES } from '../../constants/patients'
import useForm from '../../hooks/useForm'
import * as patientService from '../../services/patientService'
import { cardOwners } from '../../utils/selectors'
import { normalizePatient, validatePatient } from '../../validation/patient'

const FORM_ID = 'patient-form'
const DEFAULT_AGE = 75
const TITLE_OPTIONS = PATIENT_TITLES.map((title) => ({ value: title, label: title }))

const validate = (values) => validatePatient(normalizePatient(values))

/**
 * @param {import('../../services/patientsService').Patient | null} patient
 * @param {import('../../services/patientsService').Patient[]} patients
 */
function createInitialValues(patient, patients) {
  if (patient) {
    const { title, name, age, card, avatar } = patient
    // Pacientes creados antes de guardar el avatar en la API no lo traen.
    return { title, name, age, card, avatar: avatar ?? createDefaultAvatar(title, patients.length) }
  }
  const taken = new Set(patients.map((item) => item.card))
  return {
    title: 'Doña',
    name: '',
    age: DEFAULT_AGE,
    card: Object.keys(CARD_COLORS).find((color) => !taken.has(color)) ?? '',
    avatar: createDefaultAvatar('Doña', patients.length),
  }
}

/**
 * Drawer para dar de alta o editar a un paciente, con vista previa en vivo
 * del retrato y la tarjeta.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {import('../../services/patientsService').Patient | null} [props.patient] Sin él, crea uno nuevo.
 * @param {import('../../services/patientsService').Patient[]} props.patients Todos (para las tarjetas ocupadas).
 * @param {() => void} props.onClose
 * @param {(patient: import('../../services/patientsService').Patient, isEdit: boolean) => void} props.onSaved
 */
function PatientFormDrawer({ open, ...props }) {
  return open ? <PatientFormContent {...props} /> : null
}

function PatientFormContent({ patient = null, patients, onClose, onSaved }) {
  const isEdit = Boolean(patient)
  const [initialValues] = useState(() => createInitialValues(patient, patients))
  const owners = useMemo(() => cardOwners(patients), [patients])

  const { values, errors, isSubmitting, submitError, setValue, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues,
    validate,
    onSubmit: async (formValues) => {
      const saved = isEdit
        ? await patientService.update(patient.id, formValues)
        : await patientService.create(formValues)
      onSaved(saved, isEdit)
    },
  })

  /** Con Doña/Don cambia el peinado por defecto, salvo que ya se haya elegido otro. */
  const handleTitleChange = (title) => {
    const { avatar } = values
    const keepsDefaultHair = avatar.hairStyle === DEFAULT_HAIR_BY_TITLE[values.title]
    setValue('title', title)
    setValue('avatar', {
      ...avatar,
      hairStyle: keepsDefaultHair ? DEFAULT_HAIR_BY_TITLE[title] : avatar.hairStyle,
      ...(title === 'Doña' && { beard: false, mustache: false }),
    })
  }

  const numericAge = Number.isInteger(values.age) ? values.age : null

  return (
    <Drawer
      open
      onClose={onClose}
      canClose={!isSubmitting}
      title={isEdit ? 'Editar paciente' : 'Nuevo paciente'}
      description={isEdit ? patient.name : 'Registra a un residente y vincúlale su tarjeta.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={isSubmitting}>
            {isEdit ? 'Guardar cambios' : 'Guardar paciente'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="space-y-6">
        <section
          aria-label="Vista previa"
          className="flex items-center gap-4 rounded-3xl bg-linear-to-br from-mist/40 to-cream/70 p-5"
        >
          <PatientAvatar patient={values} size={76} className="ring-4 ring-white" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink/60">
              {values.title}
              {numericAge !== null && ` · ${numericAge} años`}
            </p>
            <p className="truncate text-lg font-semibold text-ink">{values.name.trim() || 'Nombre del paciente'}</p>
            {CARD_COLORS[values.card] && <CardColorBadge color={values.card} className="mt-1.5" />}
          </div>
        </section>

        {submitError && (
          <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger-ink">
            {submitError}
          </p>
        )}

        <SegmentedControl
          id={`${FORM_ID}-title`}
          name="title"
          label="Tratamiento"
          options={TITLE_OPTIONS}
          value={values.title}
          onValueChange={handleTitleChange}
          error={errors.title}
        />

        <TextField
          id={`${FORM_ID}-name`}
          name="name"
          label="Nombre completo"
          placeholder="Ej. Carmen Ruiz"
          autoComplete="off"
          data-autofocus
          maxLength={PATIENT_LIMITS.nameMax}
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.name}
        />

        <NumberStepper
          id={`${FORM_ID}-age`}
          name="age"
          label="Edad"
          suffix="años"
          min={PATIENT_LIMITS.ageMin}
          max={PATIENT_LIMITS.ageMax}
          value={values.age}
          onValueChange={(age) => setValue('age', age)}
          onBlur={() => handleBlur('age')}
          error={errors.age}
          className="sm:max-w-[240px]"
        />

        <CardColorPicker
          id={`${FORM_ID}-card`}
          name="card"
          value={values.card}
          onValueChange={(card) => setValue('card', card)}
          owners={owners}
          currentPatientId={patient?.id}
          error={errors.card}
        />

        <section aria-label="Apariencia del avatar">
          <p className="mb-2 text-[13px] font-semibold text-ink">Apariencia del avatar</p>
          <AvatarCustomizer
            idPrefix={FORM_ID}
            value={values.avatar}
            onValueChange={(avatar) => setValue('avatar', avatar)}
            showFacialHair={values.title === 'Don'}
            errors={errors}
          />
        </section>
      </form>
    </Drawer>
  )
}

export default PatientFormDrawer
