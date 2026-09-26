import { CircleCheck, Cpu, Package, Pill, TriangleAlert } from 'lucide-react'
import StatCard from '../ui/StatCard'

const ALERT_STATES = {
  active: { icon: TriangleAlert, iconTone: 'warn', note: 'Acción requerida hoy', noteTone: 'negative' },
  clear: { icon: CircleCheck, iconTone: 'online', note: 'Todo en orden', noteTone: 'positive' },
}

/**
 * @param {ReturnType<typeof import('../../utils/inventorySelectors').inventoryTotals>} totals
 * @param {number} alertCount
 * @param {number} temperature
 */
function getStats(totals, alertCount, temperature) {
  return [
    {
      id: 'doses',
      label: 'Dosis dispensadas hoy',
      value: totals.dispensed,
      suffix: `/ ${totals.planned}`,
      icon: Pill,
      iconTone: 'teal',
      note: 'Actualizado por sensor en vivo',
    },
    {
      id: 'stock',
      label: 'Pastillas en stock',
      value: totals.stock,
      icon: Package,
      iconTone: 'indigo',
      note: `Capacidad total: ${totals.capacity}`,
    },
    {
      id: 'compartments',
      label: 'Compartimentos activos',
      value: totals.activeCompartments,
      suffix: `/ ${totals.totalCompartments}`,
      icon: Cpu,
      iconTone: 'neutral',
      note: `Temperatura interna ${temperature.toFixed(1)} °C`,
    },
    {
      id: 'alerts',
      label: 'Alertas de recarga',
      value: alertCount,
      ...ALERT_STATES[alertCount > 0 ? 'active' : 'clear'],
    },
  ]
}

/**
 * Fila de indicadores del inventario.
 *
 * @param {object} props
 * @param {ReturnType<typeof import('../../utils/inventorySelectors').inventoryTotals>} props.totals
 * @param {number} props.alertCount Compartimentos con stock bajo.
 * @param {number} props.temperature Temperatura interna, en °C.
 */
function InventoryStats({ totals, alertCount, temperature }) {
  return (
    <section aria-label="Indicadores" className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
      {getStats(totals, alertCount, temperature).map(({ id, ...stat }) => (
        <StatCard key={id} {...stat} />
      ))}
    </section>
  )
}

export default InventoryStats
