import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import MobileTopBar from './MobileTopBar'
import DataProvider from '../../context/DataProvider'
import ToastProvider from '../../context/ToastProvider'
import Sidebar from './Sidebar'

const SIDEBAR_ID = 'app-sidebar'

/* Debajo de `lg` el sidebar es un drawer; desde `lg` siempre está visible. */
const DRAWER_BASE =
  'fixed inset-y-0 left-0 z-50 duration-300 lg:static lg:z-auto lg:visible lg:translate-x-0'

/* `visibility` solo se anima al cerrar: al abrir tiene que ser visible de
   inmediato para poder moverle el foco. */
const DRAWER_STATES = {
  open: 'visible translate-x-0 transition-[translate]',
  closed: 'invisible -translate-x-full transition-[translate,visibility]',
}

const OVERLAY_STATES = {
  open: 'opacity-100',
  closed: 'pointer-events-none opacity-0',
}

/**
 * Layout de la app con sesión: sidebar + contenido de la ruta anidada. Aquí
 * viven los datos compartidos (DataProvider) y el toast global.
 */
function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const sidebarRef = useRef(null)
  const menuButtonRef = useRef(null)
  const drawerState = isMenuOpen ? 'open' : 'closed'

  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => {
    if (!isMenuOpen) return
    sidebarRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setIsMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  return (
    <DataProvider>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden bg-cream font-sans text-ink">
          <Sidebar
            id={SIDEBAR_ID}
            ref={sidebarRef}
            onNavigate={closeMenu}
            className={clsx(DRAWER_BASE, DRAWER_STATES[drawerState])}
          />
          <div
            aria-hidden
            onClick={closeMenu}
            className={clsx(
              'fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden',
              OVERLAY_STATES[drawerState],
            )}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <MobileTopBar
              isMenuOpen={isMenuOpen}
              onOpenMenu={() => setIsMenuOpen(true)}
              menuId={SIDEBAR_ID}
              menuButtonRef={menuButtonRef}
              className="lg:hidden"
            />
            <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-9 sm:py-8">
              <Outlet />
            </main>
          </div>
        </div>
      </ToastProvider>
    </DataProvider>
  )
}

export default AppLayout
