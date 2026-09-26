import { RefreshCw } from 'lucide-react'
import SyncIndicator from './SyncIndicator'
import Button from '../ui/Button'
import StatusPill from '../ui/StatusPill'

/**
 * Acciones del encabezado: última sincronización, estado del hardware y botón
 * para sincronizar.
 *
 * @param {object} props
 * @param {number} props.lastSyncAt Timestamp (ms).
 * @param {() => void} props.onSync
 */
function InventoryHeaderActions({ lastSyncAt, onSync }) {
  return (
    <>
      <SyncIndicator lastSyncAt={lastSyncAt} />
      <StatusPill tone="online" className="shadow-card">
        Hardware Online
      </StatusPill>
      <Button variant="secondary" icon={RefreshCw} onClick={onSync}>
        Sincronizar
      </Button>
    </>
  )
}

export default InventoryHeaderActions
