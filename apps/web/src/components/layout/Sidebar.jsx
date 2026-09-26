import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import BrandMark from '../brand/BrandMark'
import DemoResetButton from './DemoResetButton'
import DeviceStatusCard from './DeviceStatusCard'
import SidebarNavItem from './SidebarNavItem'
import SidebarUser from './SidebarUser'
import { NAV_ITEMS } from '../../constants/navigation'
import { DISPENSER } from '../../data/dispenser'
import { CURRENT_USER } from '../../data/session'

/**
 * Barra lateral: marca, navegación principal, estado del dispensador y usuario.
 * El posicionamiento (fijo en escritorio o drawer en móvil) lo decide quien la usa.
 *
 * @param {object} props
 * @param {string} [props.id]
 * @param {import('react').Ref<HTMLElement>} [props.ref] Se usa para mover el foco al abrir el drawer.
 * @param {() => void} [props.onNavigate] Se llama al elegir un item de la navegación.
 * @param {string} [props.className]
 */
function Sidebar({ id, ref, onNavigate, className }) {
  const navigate = useNavigate()

  return (
    <aside
      id={id}
      ref={ref}
      tabIndex={-1}
      className={clsx(
        'flex w-[252px] shrink-0 flex-col overflow-y-auto bg-ink px-4 py-6 text-white outline-hidden',
        className,
      )}
    >
      <div className="px-2">
        <BrandMark />
      </div>

      <p className="mt-9 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">Menú</p>
      <nav aria-label="Principal">
        <ul className="mt-2 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <SidebarNavItem item={item} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      <DeviceStatusCard device={DISPENSER} className="mt-auto" />
      <SidebarUser
        user={CURRENT_USER}
        onLogout={() => navigate('/login')}
        actions={<DemoResetButton />}
        className="mt-4"
      />
    </aside>
  )
}

export default Sidebar
