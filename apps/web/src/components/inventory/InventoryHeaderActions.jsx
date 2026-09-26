import { RefreshCw } from 'lucide-react'
import SyncIndicator from './SyncIndicator'
import Button from '../ui/Button'
import StatusPill from '../ui/StatusPill'
import { formatTime } from '../../utils/formatDate'

/**
 * Acciones del encabezado: última sincronización, estado del hardware y botón
 * para sincronizar.
 *
 * @param {object} props
 * @param {number} props.lastSyncAt Timestamp (ms) de la última consulta a la API.
 * @param {number | null} props.lastSeenAt Última vez que el Arduino pidió una tarea.
 * @param {boolean} props.isOnline
 * @param {() => void} props.onSync
 */
function InventoryHeaderActions({ lastSyncAt, lastSeenAt, isOnline, onSync }) {
  const seen = lastSeenAt ? `Última conexión: ${formatTime(lastSeenAt)}` : 'El dispensador no se ha conectado'
  return (
    <>
      <SyncIndicator lastSyncAt={lastSyncAt} />
      <span title={seen}>
        <StatusPill tone={isOnline ? 'online' : 'offline'} className="shadow-card">
          {isOnline ? 'Hardware en línea' : 'Hardware sin conexión'}
        </StatusPill>
      </span>
      <Button variant="secondary" icon={RefreshCw} onClick={onSync}>
        Sincronizar
      </Button>
    </>
  )
}

export default InventoryHeaderActions
