import clsx from 'clsx'
import { errorIdOf, hintIdOf } from './fieldIds'

const LABEL = 'mb-1.5 block text-[13px] font-semibold text-ink'

/**
 * Envoltura de un campo: label (o legend, para grupos), control, ayuda y error.
 * El control debe llevar `aria-describedby={describedByOf(id, { hint, error })}`.
 *
 * Con `group` se pinta como `<fieldset>` + `<legend>` (radios, checkboxes).
 *
 * @param {object} props
 * @param {string} props.id Id del control (o del grupo).
 * @param {import('react').ReactNode} props.label
 * @param {import('react').ReactNode} [props.hint]
 * @param {string} [props.error]
 * @param {boolean} [props.group=false]
 * @param {import('react').ReactNode} [props.labelAside] A la derecha del label (p. ej. un contador).
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
function Field({ id, label, hint, error, group = false, labelAside, className, children }) {
  const Container = group ? 'fieldset' : 'div'
  const labelContent = (
    <span className="flex items-baseline justify-between gap-3">
      <span>{label}</span>
      {labelAside && <span className="text-xs font-medium text-ink/50">{labelAside}</span>}
    </span>
  )

  return (
    <Container className={clsx('min-w-0', className)}>
      {group ? (
        <legend className={clsx(LABEL, 'w-full')}>{labelContent}</legend>
      ) : (
        <label htmlFor={id} className={LABEL}>
          {labelContent}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={hintIdOf(id)} className="mt-1.5 text-xs text-ink/55">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorIdOf(id)} role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </Container>
  )
}

export default Field
