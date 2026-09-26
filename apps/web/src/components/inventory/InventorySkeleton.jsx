import PageHeader from '../layout/PageHeader'
import EmptyState from '../ui/EmptyState'
import Skeleton from '../ui/Skeleton'
import { DISPENSER } from '../../data/dispenser'

const STAT_IDS = ['s1', 's2', 's3', 's4']

/**
 * Inventario mientras cargan los datos (o si fallaron).
 *
 * @param {object} props
 * @param {Error | null} [props.error]
 */
function InventorySkeleton({ error }) {
  return (
    <>
      <PageHeader eyebrow={`Monitoreo en tiempo real · Dispensador ${DISPENSER.id}`} title="Inventario" />
      {error ? (
        <EmptyState className="mt-7">No se pudo cargar el inventario. Intenta recargar la página.</EmptyState>
      ) : (
        <div aria-busy="true" aria-label="Cargando inventario">
          <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
            {STAT_IDS.map((id) => (
              <Skeleton key={id} className="h-[145px] rounded-3xl bg-white/70" />
            ))}
          </div>
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <Skeleton className="h-[340px] rounded-3xl bg-white/70 xl:col-span-2" />
            <Skeleton className="h-[340px] rounded-3xl bg-white/70" />
          </div>
        </div>
      )}
    </>
  )
}

export default InventorySkeleton
