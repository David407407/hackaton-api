import { Camera, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import Button from '../ui/Button'
import { errorIdOf } from '../ui/fieldIds'
import { PHOTO_SIZE } from '../../constants/patients'
import { resizeImageToDataUrl } from '../../lib/image'

/**
 * Subir o quitar la foto del paciente. La imagen se recorta y reduce a
 * 256 px en el navegador antes de guardarse.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string | null} props.value dataURL.
 * @param {(photoUrl: string | null) => void} props.onValueChange
 * @param {string} [props.error]
 */
function PhotoPicker({ id, value, onValueChange, error }) {
  const inputRef = useRef(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [readError, setReadError] = useState('')
  const shownError = readError || error

  /** @param {import('react').ChangeEvent<HTMLInputElement>} event */
  const handleFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setReadError('')
    setIsProcessing(true)
    try {
      onValueChange(await resizeImageToDataUrl(file, PHOTO_SIZE))
    } catch (fileError) {
      setReadError(fileError.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-[13px] font-semibold text-ink">Foto</p>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id={id}
          name="photoUrl"
          type="file"
          accept="image/*"
          onChange={handleFile}
          aria-describedby={shownError ? errorIdOf(id) : undefined}
          className="sr-only"
          tabIndex={-1}
        />
        <Button
          variant="secondary"
          size="sm"
          icon={Camera}
          onClick={() => inputRef.current?.click()}
          loading={isProcessing}
        >
          {value ? 'Cambiar foto' : 'Subir foto'}
        </Button>
        {value && (
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => onValueChange(null)}>
            Quitar foto
          </Button>
        )}
        <p className="text-xs text-ink/55">{value ? 'Se usa en lugar del retrato.' : 'Opcional. JPG o PNG.'}</p>
      </div>
      {shownError && (
        <p id={errorIdOf(id)} role="alert" className="mt-1.5 text-xs font-medium text-danger">
          {shownError}
        </p>
      )}
    </div>
  )
}

export default PhotoPicker
