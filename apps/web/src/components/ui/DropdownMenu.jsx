import clsx from 'clsx'
import { MoreHorizontal } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

const ITEM_TONES = {
  default: 'text-ink hover:bg-cream/70 focus-visible:bg-cream/70',
  danger: 'text-danger-ink hover:bg-danger-soft focus-visible:bg-danger-soft',
}

const ALIGN = {
  end: 'right-0',
  start: 'left-0',
}

/**
 * @typedef {object} MenuItem
 * @property {string} id
 * @property {string} label
 * @property {import('react').ElementType} [icon]
 * @property {'default' | 'danger'} [tone='default']
 * @property {() => void} onSelect
 */

/**
 * Menú contextual (botón ⋯). Se navega con flechas, Inicio y Fin; se cierra
 * con Esc, Tab o clic fuera. Al elegir una opción el foco vuelve al botón
 * antes de ejecutarla, así un diálogo que se abra desde ahí devuelve el foco
 * al lugar correcto al cerrarse.
 *
 * @param {object} props
 * @param {string} props.label Nombre accesible del botón (p. ej. "Acciones de Carmen Ruiz").
 * @param {MenuItem[]} props.items
 * @param {'start' | 'end'} [props.align='end']
 * @param {string} [props.className] Clases del contenedor.
 */
function DropdownMenu({ label, items, align = 'end', className }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const itemRefs = useRef([])
  const menuId = useId()

  const focusItem = (index) => {
    const count = items.length
    itemRefs.current[((index % count) + count) % count]?.focus()
  }

  const close = ({ restoreFocus = true } = {}) => {
    setIsOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!isOpen) return
    itemRefs.current[0]?.focus()

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  /** @param {import('react').KeyboardEvent} event */
  const handleMenuKeyDown = (event) => {
    const current = itemRefs.current.indexOf(document.activeElement)
    const keyActions = {
      ArrowDown: () => focusItem(current + 1),
      ArrowUp: () => focusItem(current - 1),
      Home: () => focusItem(0),
      End: () => focusItem(items.length - 1),
      Escape: () => close(),
    }
    if (event.key === 'Tab') {
      close({ restoreFocus: false })
      return
    }
    const action = keyActions[event.key]
    if (!action) return
    event.preventDefault()
    event.stopPropagation()
    action()
  }

  /** @param {import('react').KeyboardEvent} event */
  const handleTriggerKeyDown = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    setIsOpen(true)
  }

  /** @param {MenuItem} item */
  const handleSelect = (item) => {
    close()
    item.onSelect()
  }

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleTriggerKeyDown}
        className={clsx(
          'grid size-9 place-items-center rounded-xl text-ink/55 transition hover:bg-ink/5 hover:text-ink',
          'focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30',
          isOpen && 'bg-ink/5 text-ink',
        )}
      >
        <MoreHorizontal aria-hidden className="size-5" />
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
          className={clsx(
            'absolute top-full z-30 mt-1.5 min-w-44 origin-top-right rounded-2xl bg-white p-1.5 shadow-panel ring-1 ring-ink/8 motion-safe:animate-menu-in',
            ALIGN[align],
          )}
        >
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                ref={(element) => {
                  itemRefs.current[index] = element
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                onClick={() => handleSelect(item)}
                className={clsx(
                  'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium outline-hidden transition-colors',
                  ITEM_TONES[item.tone ?? 'default'],
                )}
              >
                {Icon && <Icon aria-hidden className="size-4 shrink-0" />}
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DropdownMenu
