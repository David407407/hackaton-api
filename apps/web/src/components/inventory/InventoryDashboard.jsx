import { useCallback } from 'react'
import CompartmentsPanel from './CompartmentsPanel'
import DoseChartPanel from './DoseChartPanel'
import InventoryHeaderActions from './InventoryHeaderActions'
import InventoryStats from './InventoryStats'
import RefillAlertsPanel from './RefillAlertsPanel'
import SensorFeedPanel from './SensorFeedPanel'
import PageHeader from '../layout/PageHeader'
import { DISPENSER } from '../../data/dispenser'
import useNotify from '../../hooks/useNotify'
import { errorMessage } from '../../lib/errors'
import { refillMessage } from '../../utils/inventorySelectors'

/**
 * Inventario en vivo con los datos de la API (ver useInventory). Se monta
 * cuando los datos ya cargaron.
 *
 * @param {object} props
 * @param {ReturnType<typeof import('../../hooks/useInventory').default>} props.dispenser
 */
function InventoryDashboard({ dispenser }) {
  const notify = useNotify()
  const { refill } = dispenser

  const handleRefill = useCallback(
    async (compartment) => {
      try {
        await refill(compartment)
        notify(refillMessage(compartment))
      } catch (error) {
        notify({ message: errorMessage(error), tone: 'error' })
      }
    },
    [refill, notify],
  )

  return (
    <>
      <PageHeader
        eyebrow={`Monitoreo en tiempo real · Dispensador ${DISPENSER.id}`}
        title="Inventario"
        actions={
          <InventoryHeaderActions
            lastSyncAt={dispenser.lastSyncAt}
            lastSeenAt={dispenser.lastSeenAt}
            isOnline={dispenser.isDispenserOnline}
            onSync={dispenser.sync}
          />
        }
      />

      <InventoryStats totals={dispenser.totals} alertCount={dispenser.lowCompartments.length} />

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <DoseChartPanel
          slots={dispenser.slots}
          currentIndex={dispenser.currentSlot}
          progressPct={dispenser.totals.progressPct}
          pending={dispenser.totals.pending}
          className="xl:col-span-2"
        />
        <RefillAlertsPanel compartments={dispenser.lowCompartments} onRefill={handleRefill} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 pb-4 xl:grid-cols-3">
        <CompartmentsPanel tiles={dispenser.tiles} className="xl:col-span-2" />
        <SensorFeedPanel events={dispenser.events} latestEventId={dispenser.latestEventId} />
      </div>
    </>
  )
}

export default InventoryDashboard
