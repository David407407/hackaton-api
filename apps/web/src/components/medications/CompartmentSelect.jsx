import { useMemo } from 'react'
import Select from '../ui/Select'
import { COMPARTMENT_IDS } from '../../constants/medications'
import { compartmentLabel, medicationLabel } from '../../utils/labels'
import { compartmentOwners } from '../../utils/selectors'

/**
 * Compartimento del dispensador (C1–C6) o "Sin compartimento". Los ocupados
 * muestran qué medicamento los tiene y van deshabilitados, salvo el del
 * medicamento que se edita.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.value '' (sin compartimento) o '1'…'6'.
 * @param {(value: string) => void} props.onValueChange
 * @param {import('../../services/medicationsService').Medication[]} props.medications
 * @param {string} [props.currentMedicationId]
 * @param {() => void} [props.onBlur]
 * @param {string} [props.error]
 */
function CompartmentSelect({ id, value, onValueChange, medications, currentMedicationId, onBlur, error }) {
  const options = useMemo(() => {
    const owners = compartmentOwners(medications)
    return [
      { value: '', label: 'Sin compartimento' },
      ...COMPARTMENT_IDS.map((compartmentId) => {
        const owner = owners.get(compartmentId)
        const takenByOther = owner && owner.id !== currentMedicationId
        return {
          value: String(compartmentId),
          label: `${compartmentLabel(compartmentId)} · ${owner ? medicationLabel(owner) : 'Libre'}`,
          disabled: Boolean(takenByOther),
        }
      }),
    ]
  }, [medications, currentMedicationId])

  return (
    <Select
      id={id}
      name="compartmentId"
      label="Compartimento"
      options={options}
      value={value}
      onValueChange={onValueChange}
      onBlur={onBlur}
      hint="Cada compartimento guarda un solo medicamento."
      error={error}
    />
  )
}

export default CompartmentSelect
