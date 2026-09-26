import useSyncCounter from '../../hooks/useSyncCounter'

/**
 * "Sincronizado hace N s". Tiene su propio intervalo de 1 s para que el tick
 * solo re-renderice este componente y no la página.
 *
 * @param {object} props
 * @param {number} props.lastSyncAt Timestamp (ms) de la última sincronización.
 */
function SyncIndicator({ lastSyncAt }) {
  const seconds = useSyncCounter(lastSyncAt)

  return (
    <p className="text-xs font-medium text-ink/60 tabular-nums">
      Sincronizado hace <strong className="font-bold text-ink">{seconds}</strong> s
    </p>
  )
}

export default SyncIndicator
