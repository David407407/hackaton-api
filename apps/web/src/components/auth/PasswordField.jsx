import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import TextField from '../ui/TextField'

/**
 * TextField de contraseña con candado y botón para mostrar u ocultar el valor.
 * Acepta las mismas props que TextField (salvo `type` e `icon`).
 *
 * @param {Omit<Parameters<typeof TextField>[0], 'type' | 'icon'>} props
 */
function PasswordField(props) {
  const [visible, setVisible] = useState(false)
  const ToggleIcon = visible ? EyeOff : Eye

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      icon={Lock}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label="Mostrar contraseña"
          aria-pressed={visible}
          aria-controls={props.id}
          className="-mr-1.5 grid size-8 shrink-0 place-items-center rounded-xl text-ink/45 transition hover:text-ink focus-visible:text-ink focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30"
        >
          <ToggleIcon aria-hidden className="size-[18px]" />
        </button>
      }
    />
  )
}

export default PasswordField
