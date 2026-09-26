import clsx from 'clsx'
import Field from './Field'
import { CONTROL_BOX, controlRing, describedByOf } from './fieldIds'

/**
 * Área de texto con label, contador opcional y error accesible. Cualquier
 * prop extra va al `<textarea>` (name, value, onChange, onBlur…).
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.label
 * @param {string} props.value
 * @param {number} [props.maxLength] Muestra el contador "12 / 140".
 * @param {import('react').ReactNode} [props.hint]
 * @param {string} [props.error]
 * @param {number} [props.rows=3]
 * @param {string} [props.className]
 */
function Textarea({ id, label, value, maxLength, hint, error, rows = 3, className, ...textareaProps }) {
  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      className={className}
      labelAside={maxLength ? `${value.length} / ${maxLength}` : undefined}
    >
      <div className={clsx(CONTROL_BOX, controlRing(error))}>
        <textarea
          id={id}
          value={value}
          rows={rows}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByOf(id, { hint, error })}
          className="block w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-[15px] text-ink outline-hidden placeholder:text-ink/35"
          {...textareaProps}
        />
      </div>
    </Field>
  )
}

export default Textarea
