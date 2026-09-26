import { useEffect } from 'react'
import { BRAND } from '../config/brand'

/**
 * Pone el título de la pestaña como "<title> · DosiCare" y restaura el
 * anterior al desmontar.
 *
 * @param {string} title
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} · ${BRAND.name}`
    return () => {
      document.title = previous
    }
  }, [title])
}
