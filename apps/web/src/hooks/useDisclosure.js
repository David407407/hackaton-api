import { useCallback, useState } from 'react'

/**
 * Abierto/cerrado de un diálogo, con un dato opcional (p. ej. el registro a
 * editar). El dato se conserva hasta el siguiente `open`.
 *
 * @template T
 * @returns {{ isOpen: boolean, payload: T | null, open: (payload?: T) => void, close: () => void }}
 */
export default function useDisclosure() {
  const [state, setState] = useState({ isOpen: false, payload: null })

  const open = useCallback((payload = null) => setState({ isOpen: true, payload }), [])
  const close = useCallback(() => setState((current) => ({ ...current, isOpen: false })), [])

  return { ...state, open, close }
}
