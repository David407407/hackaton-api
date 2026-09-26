import clsx from 'clsx'
import { Check } from 'lucide-react'
import RefillAlertCard from './RefillAlertCard'
import Panel from '../ui/Panel'

const BADGE = {
  active: { className: 'bg-warn-soft text-warn-ink', label: (count) => `${count} ${count === 1 ? 'activa' : 'activas'}` },
  clear: { className: 'bg-online-soft text-online-ink', label: () => 'Sin alertas' },
}

/**
 * Panel "Alertas de recarga": una tarjeta por compartimento bajo, o un estado
 * vacío verde si no hay ninguno.
 *
 * @param {object} props
 * @param {import('../../utils/inventorySelectors').Compartment[]} props.compartments Solo los que tienen stock bajo.
 * @param {(compartment: import('../../utils/inventorySelectors').Compartment) => void} props.onRefill
 */
function RefillAlertsPanel({ compartments, onRefill }) {
  const badge = BADGE[compartments.length > 0 ? 'active' : 'clear']

  return (
    <Panel
      title="Alertas de recarga"
      actions={
        <span className={clsx('rounded-full px-2.5 py-1 text-xs font-bold', badge.className)}>
          {badge.label(compartments.length)}
        </span>
      }
    >
      {compartments.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {compartments.map((compartment) => (
            <RefillAlertCard key={compartment.id} compartment={compartment} onRefill={onRefill} />
          ))}
        </ul>
      ) : (
        <div className="mt-4 rounded-2xl bg-online-soft/60 px-4 py-8 text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-full bg-white text-online-ink shadow-card">
            <Check aria-hidden strokeWidth={3} className="size-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-online-ink">Todos los compartimentos tienen stock</p>
        </div>
      )}
    </Panel>
  )
}

export default RefillAlertsPanel
