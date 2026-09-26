import { Pencil, Pill, Trash2 } from 'lucide-react'
import { memo } from 'react'
import AssignedPatientsStack from './AssignedPatientsStack'
import CompartmentBadge from './CompartmentBadge'
import DropdownMenu from '../ui/DropdownMenu'
import ProgressBar from '../ui/ProgressBar'
import { STOCK_FILL } from '../../constants/inventory'
import { stockFillLevel } from '../../utils/inventorySelectors'
import { isLowStock } from '../../utils/selectors'

/**
 * Tarjeta de un medicamento del catálogo: compartimento, stock y pacientes.
 *
 * @param {object} props
 * @param {import('../../services/medicationsService').Medication} props.medication
 * @param {import('../../services/patientsService').Patient[]} props.patients Con el medicamento activo.
 * @param {(medication: import('../../services/medicationsService').Medication) => void} props.onEdit
 * @param {(medication: import('../../services/medicationsService').Medication) => void} props.onDelete
 *   Los handlers deben ser estables (useCallback) para que memo sirva.
 */
function MedicationCard({ medication, patients, onEdit, onDelete }) {
  const { name, strength, unit, form, compartmentId, stock, capacity } = medication
  const pct = Math.round((stock / capacity) * 100)
  const isLow = isLowStock(medication)

  return (
    <article className="relative flex flex-col rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover has-[[aria-expanded=true]]:z-20">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal/12 text-teal">
          <Pill aria-hidden className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-[17px] font-semibold leading-tight text-ink">
            {name} · {strength} {unit}
          </h2>
          <p className="mt-0.5 text-xs text-ink/55">{form}</p>
        </div>
        <DropdownMenu
          label={`Acciones de ${name}`}
          className="-mr-1 -mt-1"
          items={[
            { id: 'edit', label: 'Editar', icon: Pencil, onSelect: () => onEdit(medication) },
            { id: 'delete', label: 'Eliminar', icon: Trash2, tone: 'danger', onSelect: () => onDelete(medication) },
          ]}
        />
      </div>

      <CompartmentBadge compartmentId={compartmentId} long className="mt-4 self-start" />

      <div className="mt-4">
        <div className="flex items-end justify-between">
          <p className="text-xs font-medium text-ink/60">
            Stock{isLow && <span className="ml-1.5 font-bold text-warn-ink">· Bajo</span>}
          </p>
          <p className="text-ink">
            <span className="text-lg font-bold leading-none tabular-nums">{stock}</span>
            <span className="text-xs font-semibold text-ink/50"> / {capacity}</span>
          </p>
        </div>
        <ProgressBar
          value={pct}
          label={`Stock de ${name}`}
          fillClassName={STOCK_FILL[stockFillLevel(pct)]}
          className="mt-2"
        />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink/8 pt-4">
        <p className="text-xs font-medium text-ink/60">Asignado a</p>
        <AssignedPatientsStack patients={patients} />
      </div>
    </article>
  )
}

export default memo(MedicationCard)
