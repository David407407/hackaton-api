import clsx from 'clsx'

const ICON_TONES = {
  teal: 'bg-teal/12 text-teal',
  indigo: 'bg-indigo/12 text-indigo',
  neutral: 'bg-mist/50 text-ink',
  warn: 'bg-warn-soft text-warn-ink',
  online: 'bg-online-soft text-online-ink',
}

const NOTE_TONES = {
  muted: 'text-ink/55',
  positive: 'text-online-ink',
  negative: 'text-warn-ink',
}

/**
 * Tarjeta de indicador: etiqueta, ícono, valor grande y nota.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {import('react').ReactNode} props.value
 * @param {string} [props.suffix] Texto pequeño después del valor (p. ej. "/ 26").
 * @param {import('react').ElementType} props.icon
 * @param {keyof typeof ICON_TONES} [props.iconTone='teal']
 * @param {import('react').ReactNode} [props.note]
 * @param {keyof typeof NOTE_TONES} [props.noteTone='muted']
 */
function StatCard({ label, value, suffix, icon: Icon, iconTone = 'teal', note, noteTone = 'muted' }) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink/5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[13px] font-medium text-ink/65">{label}</h2>
        <span className={clsx('grid size-9 shrink-0 place-items-center rounded-xl', ICON_TONES[iconTone])}>
          <Icon aria-hidden className="size-[18px]" />
        </span>
      </div>
      <p className="mt-3 text-[28px] font-bold leading-none tracking-tight text-ink tabular-nums">
        {value}
        {suffix && <span className="ml-1 text-base font-semibold text-ink/50">{suffix}</span>}
      </p>
      {note && <p className={clsx('mt-2 text-xs font-medium', NOTE_TONES[noteTone])}>{note}</p>}
    </article>
  )
}

export default StatCard
