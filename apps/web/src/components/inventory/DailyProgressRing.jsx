const SIZE = 112
const RADIUS = 42
const STROKE = 10
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Anillo con el porcentaje de dosis del día ya dispensadas.
 *
 * @param {object} props
 * @param {number} props.percent 0–100.
 * @param {number} props.pending Dosis que faltan hoy.
 */
function DailyProgressRing({ percent, pending }) {
  const clamped = Math.min(100, Math.max(0, percent))

  return (
    <div className="w-[150px] shrink-0 rounded-3xl bg-cream/55 px-3 py-5 text-center">
      <div className="relative mx-auto size-[112px]">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden className="size-full -rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} strokeWidth={STROKE} className="fill-none stroke-mist/45" />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            className="fill-none stroke-teal motion-safe:transition-[stroke-dashoffset] motion-safe:duration-800 motion-safe:ease-out"
            style={{ strokeDashoffset: CIRCUMFERENCE * (1 - clamped / 100) }}
          />
        </svg>
        <p className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[20px] font-bold leading-none text-ink tabular-nums">{clamped}%</span>
          <span className="mt-1 text-[9px] font-medium text-ink/60">hoy</span>
        </p>
      </div>
      <p className="mt-2 text-xs font-semibold text-ink">Progreso diario</p>
      <p className="text-[11px] text-ink/60">
        {pending} {pending === 1 ? 'dosis pendiente' : 'dosis pendientes'}
      </p>
    </div>
  )
}

export default DailyProgressRing
