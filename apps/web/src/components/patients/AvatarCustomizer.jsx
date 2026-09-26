import clsx from 'clsx'
import { useId } from 'react'
import Checkbox from '../ui/Checkbox'
import SegmentedControl from '../ui/SegmentedControl'
import { HAIR_STYLES, SKIN_TONES } from '../../constants/patients'

/**
 * Rasgos del retrato ilustrado: cabello, lentes, vello facial y tono de piel.
 *
 * @param {object} props
 * @param {string} props.idPrefix
 * @param {import('../../services/patientsService').PatientAvatar} props.value
 * @param {(avatar: import('../../services/patientsService').PatientAvatar) => void} props.onValueChange
 * @param {boolean} [props.showFacialHair] Bigote y barba (solo "Don").
 * @param {Record<string, string>} [props.errors]
 */
function AvatarCustomizer({ idPrefix, value, onValueChange, showFacialHair = false, errors = {} }) {
  const skinLabelId = useId()
  const update = (patch) => onValueChange({ ...value, ...patch })

  return (
    <div className="space-y-5 rounded-3xl bg-cream/40 p-5 ring-1 ring-ink/5">
      <SegmentedControl
        id={`${idPrefix}-hair`}
        name="hairStyle"
        label="Estilo de cabello"
        options={HAIR_STYLES}
        value={value.hairStyle}
        onValueChange={(hairStyle) => update({ hairStyle })}
        error={errors.hairStyle}
      />

      <fieldset>
        <legend id={skinLabelId} className="mb-2 text-[13px] font-semibold text-ink">
          Tono de piel
        </legend>
        <div className="flex gap-3">
          {SKIN_TONES.map((tone) => (
            <label key={tone.value} title={tone.label} className="cursor-pointer">
              <input
                type="radio"
                name="skin"
                value={tone.value}
                checked={value.skin === tone.value}
                onChange={() => update({ skin: tone.value })}
                className="peer sr-only"
              />
              <span
                aria-hidden
                // Color de ilustración (dato del avatar), no un token de UI.
                style={{ backgroundColor: tone.value }}
                className={clsx(
                  'block size-10 rounded-full ring-2 ring-white shadow-card transition',
                  'peer-checked:ring-4 peer-checked:ring-teal peer-focus-visible:outline-4 peer-focus-visible:outline-teal/30',
                )}
              />
              <span className="sr-only">{tone.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
        <Checkbox
          id={`${idPrefix}-glasses`}
          label="Lentes"
          checked={value.glasses}
          onCheckedChange={(glasses) => update({ glasses })}
        />
        {showFacialHair && (
          <>
            <Checkbox
              id={`${idPrefix}-mustache`}
              label="Bigote"
              checked={value.mustache}
              onCheckedChange={(mustache) => update({ mustache })}
            />
            <Checkbox
              id={`${idPrefix}-beard`}
              label="Barba"
              checked={value.beard}
              onCheckedChange={(beard) => update({ beard })}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default AvatarCustomizer
