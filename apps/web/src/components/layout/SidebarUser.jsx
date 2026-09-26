import clsx from 'clsx'
import { LogOut } from 'lucide-react'

/**
 * Usuario con sesión iniciada y botón para cerrarla.
 *
 * @param {object} props
 * @param {{ name: string, initials: string, shift: string }} props.user
 * @param {() => void} props.onLogout
 * @param {import('react').ReactNode} [props.actions] Botones extra antes de "Cerrar sesión".
 * @param {string} [props.className]
 */
function SidebarUser({ user, onLogout, actions, className }) {
  return (
    <div className={clsx('flex items-center gap-2 px-2 py-2', className)}>
      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-mist text-sm font-bold text-ink">
        {user.initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[13px] font-semibold leading-tight">{user.name}</p>
        <p className="text-[11px] text-white/55">{user.shift}</p>
      </div>
      {actions}
      <button
        type="button"
        onClick={onLogout}
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        className="grid size-8 shrink-0 place-items-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30"
      >
        <LogOut aria-hidden className="size-[18px]" />
      </button>
    </div>
  )
}

export default SidebarUser
