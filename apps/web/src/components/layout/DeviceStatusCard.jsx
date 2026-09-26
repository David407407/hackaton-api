import clsx from 'clsx'
import { Cpu } from 'lucide-react'
import PulseDot from '../ui/PulseDot'

const CONNECTION = {
  online: { label: 'En línea', text: 'text-online-bright', dot: 'bg-online-bright', pulse: true },
  offline: { label: 'Sin conexión', text: 'text-white/55', dot: 'bg-white/40', pulse: false },
}

/** Barritas decorativas de intensidad de señal. */
const SIGNAL_BARS = [
  { id: 1, className: 'opacity-100' },
  { id: 2, className: 'opacity-100' },
  { id: 3, className: 'opacity-100' },
  { id: 4, className: 'opacity-100' },
  { id: 5, className: 'opacity-60' },
  { id: 6, className: 'opacity-35' },
]

/**
 * Tarjeta del sidebar con el estado del dispensador.
 *
 * @param {object} props
 * @param {{ id: string, online: boolean, compartments: number, signal: number }} props.device
 * @param {string} [props.className]
 */
function DeviceStatusCard({ device, className }) {
  const connection = CONNECTION[device.online ? 'online' : 'offline']

  return (
    <section
      aria-label={`Dispensador ${device.id}`}
      className={clsx('rounded-3xl bg-white/[0.07] p-4 ring-1 ring-white/10', className)}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Cpu aria-hidden className="size-4 text-mist" />
          {device.id}
        </p>
        <p className={clsx('flex items-center gap-1.5 text-[11px] font-semibold', connection.text)}>
          <PulseDot colorClassName={connection.dot} pulse={connection.pulse} />
          {connection.label}
        </p>
      </div>
      <p className="mt-2 text-xs text-white/60">
        {device.compartments} compartimentos · Señal {device.signal}%
      </p>
      <div aria-hidden className="mt-3 flex gap-1">
        {SIGNAL_BARS.map((bar) => (
          <span key={bar.id} className={clsx('h-1.5 flex-1 rounded-full bg-mist', bar.className)} />
        ))}
      </div>
    </section>
  )
}

export default DeviceStatusCard
