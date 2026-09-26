import { RefreshCw, TriangleAlert } from 'lucide-react'
import { memo } from 'react'
import Button from '../ui/Button'
import { patientsLabel, stockLevel } from '../../utils/inventorySelectors'
import { pillsLabel } from '../../utils/schedule'

const LEVEL_LABEL = {
  critical: 'Crítico',
  low: 'Bajo',
}

/**
 * Alerta de un compartimento con stock bajo y botón para marcarlo como recargado.
 *
 * @param {object} props
 * @param {import('../../utils/inventorySelectors').Compartment} props.compartment
 * @param {(compartment: import('../../utils/inventorySelectors').Compartment) => void} props.onRefill
 *   Debe ser estable (useCallback) para que memo sirva.
 */
function RefillAlertCard({ compartment, onRefill }) {
  const remaining = compartment.left === 1 ? 'restante' : 'restantes'

  return (
    <li className="rounded-2xl bg-warn-soft/55 p-4 ring-1 ring-warn/15">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-warn-ink shadow-card">
          <TriangleAlert aria-hidden className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">
            {compartment.medication} {compartment.dose}
          </p>
          <p className="mt-0.5 text-xs text-ink/65">
            Compartimento {compartment.id} · {patientsLabel(compartment.patients)}
          </p>
          <p className="mt-1 text-xs font-bold text-warn-ink">
            {LEVEL_LABEL[stockLevel(compartment)]}: {pillsLabel(compartment.left)} {remaining}
          </p>
        </div>
      </div>
      <Button size="sm" icon={RefreshCw} fullWidth className="mt-3" onClick={() => onRefill(compartment)}>
        Marcar como recargado
      </Button>
    </li>
  )
}

export default memo(RefillAlertCard)
