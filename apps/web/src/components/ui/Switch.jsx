import clsx from 'clsx'

const TRACK = {
  on: 'bg-teal',
  off: 'bg-ink/20',
}

const THUMB = {
  on: 'translate-x-5',
  off: 'translate-x-0.5',
}

/**
 * Interruptor on/off (role="switch"). Si no hay texto visible al lado, pasa
 * `label` para el nombre accesible.
 *
 * @param {object} props
 * @param {boolean} props.checked
 * @param {(checked: boolean) => void} props.onCheckedChange
 * @param {string} props.label Nombre accesible.
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
function Switch({ checked, onCheckedChange, label, disabled = false, className }) {
  const state = checked ? 'on' : 'off'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={clsx(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
        'focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30 disabled:cursor-not-allowed disabled:opacity-50',
        TRACK[state],
        className,
      )}
    >
      <span
        aria-hidden
        className={clsx('size-5 rounded-full bg-white shadow-card transition-transform duration-200', THUMB[state])}
      />
    </button>
  )
}

export default Switch
