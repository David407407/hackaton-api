import { PackageOpen } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'

/**
 * Compartimento sin medicamento cargado, con un enlace al catálogo para
 * asignarle uno.
 *
 * @param {object} props
 * @param {number} props.id 1–6.
 */
function EmptyCompartmentTile({ id }) {
  return (
    <li className="flex flex-col rounded-2xl border-2 border-dashed border-ink/12 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-ink/55">C{id}</p>
      <PackageOpen aria-hidden className="mt-2 size-5 text-ink/35" />
      <p className="mt-1 text-sm font-semibold text-ink/60">Vacío</p>
      <Link
        to="/medicamentos"
        className="mt-auto pt-2 text-xs font-semibold text-indigo hover:underline focus-visible:rounded focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30"
      >
        Cargar medicamento
      </Link>
    </li>
  )
}

export default memo(EmptyCompartmentTile)
