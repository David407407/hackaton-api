import PatientAvatar from '../patients/PatientAvatar'

const AVATAR_SIZE = 28

/**
 * Pila de avatares de los pacientes que tienen el medicamento (máximo `max`
 * y luego "+N"), o "Sin pacientes".
 *
 * @param {object} props
 * @param {import('../../services/patientsService').Patient[]} props.patients
 * @param {number} [props.max=4]
 */
function AssignedPatientsStack({ patients, max = 4 }) {
  if (!patients.length) return <p className="text-xs font-medium text-ink/50">Sin pacientes</p>

  const visible = patients.slice(0, max)
  const hidden = patients.length - visible.length
  const names = patients.map((patient) => patient.name).join(', ')

  return (
    <ul
      aria-label={`${patients.length} ${patients.length === 1 ? 'paciente' : 'pacientes'}: ${names}`}
      title={names}
      className="flex items-center -space-x-2"
    >
      {visible.map((patient) => (
        <li key={patient.id} aria-hidden>
          <PatientAvatar patient={patient} size={AVATAR_SIZE} className="ring-2 ring-white" />
        </li>
      ))}
      {hidden > 0 && (
        <li
          aria-hidden
          className="grid size-7 place-items-center rounded-full bg-mist text-[11px] font-bold text-ink ring-2 ring-white"
        >
          +{hidden}
        </li>
      )}
    </ul>
  )
}

export default AssignedPatientsStack
