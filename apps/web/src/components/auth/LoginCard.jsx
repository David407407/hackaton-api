import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Mail } from 'lucide-react'
import Button from '../ui/Button'
import TextField from '../ui/TextField'
import LoginHeader from './LoginHeader'
import PasswordField from './PasswordField'
import useLoginForm from '../../hooks/useLoginForm'

const TITLE_ID = 'login-title'

/** Contenido del botón principal según el estado del formulario. */
const SUBMIT_STATES = {
  idle: { label: 'Iniciar sesión', iconRight: ArrowRight, announcement: '' },
  error: { label: 'Iniciar sesión', iconRight: ArrowRight, announcement: '' },
  loading: { label: 'Verificando…', announcement: 'Verificando credenciales…' },
  success: { label: 'Acceso concedido', icon: Check, announcement: 'Acceso concedido. Abriendo el panel.' },
}

/** Panel flotante con el formulario de inicio de sesión. */
function LoginCard() {
  const navigate = useNavigate()
  const { values, errors, status, submitError, setValue, handleSubmit } = useLoginForm({
    onSuccess: () => navigate('/pacientes'),
  })
  const submit = SUBMIT_STATES[status]

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby={TITLE_ID}
      className="w-full max-w-[430px] rounded-panel bg-white/95 p-7 shadow-panel ring-1 ring-ink/5 backdrop-blur sm:p-10"
    >
      <LoginHeader titleId={TITLE_ID} />

      <div className="mt-8 space-y-4">
        <TextField
          id="login-email"
          name="email"
          type="email"
          label="Correo electrónico"
          icon={Mail}
          autoComplete="email"
          value={values.email}
          onChange={(event) => setValue('email', event.target.value)}
          error={errors.email}
        />
        <PasswordField
          id="login-password"
          name="password"
          label="Contraseña"
          placeholder="••••••••"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) => setValue('password', event.target.value)}
          error={errors.password}
        />
      </div>

      {submitError && (
        <p role="alert" className="mt-5 text-center text-xs font-medium text-danger">
          {submitError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        fullWidth
        loading={status === 'loading'}
        icon={submit.icon}
        iconRight={submit.iconRight}
        className="mt-7"
      >
        {submit.label}
      </Button>
      <p aria-live="polite" className="sr-only">
        {submit.announcement}
      </p>
    </form>
  )
}

export default LoginCard
