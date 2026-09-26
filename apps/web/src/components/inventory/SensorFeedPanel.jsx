import { Activity } from 'lucide-react'
import SensorEventItem from './SensorEventItem'
import Panel from '../ui/Panel'

/**
 * Panel "Actividad del sensor": los eventos más recientes, el más nuevo arriba.
 *
 * @param {object} props
 * @param {import('../../utils/inventorySelectors').FeedEvent[]} props.events
 * @param {string | null} props.latestEventId Id del último evento que llegó en vivo.
 */
function SensorFeedPanel({ events, latestEventId }) {
  return (
    <Panel
      title="Actividad del sensor"
      actions={
        <p className="flex items-center gap-1.5 text-xs font-semibold text-online-ink">
          <Activity aria-hidden className="size-3.5" />
          En vivo
        </p>
      }
    >
      <ol aria-live="polite" className="mt-4 space-y-2.5">
        {events.map((event) => (
          <SensorEventItem key={event.id} event={event} isNew={event.id === latestEventId} />
        ))}
      </ol>
    </Panel>
  )
}

export default SensorFeedPanel
