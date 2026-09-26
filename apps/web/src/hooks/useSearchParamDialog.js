import { useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

const OPENED_HERE = 'searchParamDialogOpenedHere'

/**
 * Diálogo que vive en la URL (`?paciente=<id>`): se puede compartir el enlace
 * y el botón Atrás lo cierra.
 *
 * Al abrirlo se agrega una entrada al historial; al cerrarlo se regresa a la
 * anterior si la abrimos nosotros, o se reemplaza la URL si se llegó por enlace.
 *
 * @param {string} paramName
 * @returns {{ value: string | null, open: (value: string) => void, close: () => void }}
 */
export default function useSearchParamDialog(paramName) {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const openedHere = Boolean(location.state?.[OPENED_HERE])

  const open = useCallback(
    (value) =>
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)
          next.set(paramName, value)
          return next
        },
        { state: { [OPENED_HERE]: true } },
      ),
    [paramName, setSearchParams],
  )

  const close = useCallback(() => {
    if (openedHere) {
      navigate(-1)
      return
    }
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete(paramName)
        return next
      },
      { replace: true },
    )
  }, [openedHere, navigate, paramName, setSearchParams])

  return { value: searchParams.get(paramName), open, close }
}
