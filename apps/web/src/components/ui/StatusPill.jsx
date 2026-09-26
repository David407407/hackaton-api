import clsx from 'clsx'
import PulseDot from './PulseDot'

const TONES = {
  online: {
    pill: 'bg-online-soft text-online-ink ring-online/25',
    dot: 'bg-online',
    pulse: true,
  },
  warning: {
    pill: 'bg-warning-soft text-warning-ink ring-warning/30',
    dot: 'bg-warning',
    pulse: true,
  },
  offline: {
    pill: 'bg-ink/5 text-ink/65 ring-ink/15',
    dot: 'bg-ink/40',
    pulse: false,
  },
}

/**
 * Pill de estado con punto indicador (pulsante en online y warning).
 *
 * @param {object} props
 * @param {'online' | 'warning' | 'offline'} [props.tone='online']
 * @param {string} [props.className]
 * @param {import('react').ReactNode} props.children
 */
function StatusPill({ tone = 'online', className, children }) {
  const styles = TONES[tone]

  return (
    <span
      role="status"
      className={clsx(
        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold ring-1',
        styles.pill,
        className,
      )}
    >
      <PulseDot colorClassName={styles.dot} pulse={styles.pulse} />
      {children}
    </span>
  )
}

export default StatusPill
