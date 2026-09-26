import clsx from 'clsx'
import { NavLink } from 'react-router-dom'

const BASE =
  'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ' +
  'focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30'

const STATES = {
  active: 'bg-teal text-white shadow-nav-active',
  inactive: 'text-white/70 hover:bg-white/10 hover:text-white',
}

const BADGE_STATES = {
  active: 'bg-white/25',
  inactive: 'bg-mist text-ink',
}

/**
 * Item de la navegación lateral. Sin `item.to` se muestra deshabilitado
 * ("Próximamente") y no navega.
 *
 * @param {object} props
 * @param {import('../../constants/navigation').NavItem} props.item
 * @param {() => void} [props.onNavigate] Se llama al hacer clic en un item con ruta (p. ej. para cerrar el drawer).
 */
function SidebarNavItem({ item, onNavigate }) {
  const { label, icon: Icon, to, badge } = item

  /** @param {keyof typeof STATES} state */
  const renderContent = (state) => (
    <>
      <Icon aria-hidden className="size-[18px] shrink-0" />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className={clsx('rounded-full px-2 py-0.5 text-[11px] font-bold', BADGE_STATES[state])}>{badge}</span>
      )}
    </>
  )

  if (!to) {
    return (
      <a role="link" aria-disabled="true" title="Próximamente" className={clsx(BASE, STATES.inactive, 'cursor-default')}>
        {renderContent('inactive')}
      </a>
    )
  }

  return (
    <NavLink to={to} onClick={onNavigate} className={({ isActive }) => clsx(BASE, STATES[isActive ? 'active' : 'inactive'])}>
      {({ isActive }) => renderContent(isActive ? 'active' : 'inactive')}
    </NavLink>
  )
}

export default SidebarNavItem
