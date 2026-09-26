import clsx from 'clsx'
import { Menu } from 'lucide-react'
import BrandMark from '../brand/BrandMark'

/**
 * Barra superior para pantallas chicas: marca y botón que abre el sidebar.
 *
 * @param {object} props
 * @param {boolean} props.isMenuOpen
 * @param {() => void} props.onOpenMenu
 * @param {string} props.menuId Id del sidebar que controla el botón.
 * @param {import('react').Ref<HTMLButtonElement>} [props.menuButtonRef] Para devolverle el foco al cerrar.
 * @param {string} [props.className]
 */
function MobileTopBar({ isMenuOpen, onOpenMenu, menuId, menuButtonRef, className }) {
  return (
    <header className={clsx('flex items-center gap-3 bg-ink px-4 py-3 text-white', className)}>
      <BrandMark logoSize={32} showTagline={false} />
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menú"
        aria-expanded={isMenuOpen}
        aria-controls={menuId}
        className="ml-auto grid size-10 place-items-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30"
      >
        <Menu aria-hidden className="size-5" />
      </button>
    </header>
  )
}

export default MobileTopBar
