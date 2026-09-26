import { useState } from 'react'
import { login } from '../services/authService'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const REDIRECT_DELAY_MS = 800

const INITIAL_VALUES = { email: '', password: '' }

/** Cada validador devuelve el mensaje de error o '' si el valor es válido. */
const VALIDATORS = {
  email: (value) => {
    if (!value.trim()) return 'Ingresa tu correo electrónico.'
    if (!EMAIL_PATTERN.test(value.trim())) return 'Ingresa un correo con formato válido.'
    return ''
  },
  password: (value) => (value ? '' : 'Ingresa tu contraseña.'),
}

function validate(values) {
  const errors = {}
  for (const [field, validator] of Object.entries(VALIDATORS)) {
    const message = validator(values[field])
    if (message) errors[field] = message
  }
  return errors
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * @typedef {'idle' | 'loading' | 'success' | 'error'} LoginStatus
 */

/**
 * Estado y lógica del formulario de inicio de sesión.
 *
 * @param {object} [options]
 * @param {(session: import('../services/authService').Session) => void} [options.onSuccess]
 *   Se llama ~800ms después de un login exitoso (p. ej. para navegar).
 */
export default function useLoginForm({ onSuccess } = {}) {
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  /** @type {[LoginStatus, (status: LoginStatus) => void]} */
  const [status, setStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')

  /**
   * @param {keyof typeof INITIAL_VALUES} field
   * @param {string} value
   */
  const setValue = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    // Si el campo ya mostraba un error, se revalida mientras el usuario corrige.
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: VALIDATORS[field](value) }))
    }
  }

  /** @param {import('react').FormEvent<HTMLFormElement>} event */
  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'loading' || status === 'success') return

    const nextErrors = validate(values)
    setErrors(nextErrors)
    const firstInvalid = Object.keys(nextErrors)[0]
    if (firstInvalid) {
      event.currentTarget.elements.namedItem(firstInvalid)?.focus()
      return
    }

    setSubmitError('')
    setStatus('loading')
    try {
      const session = await login({ ...values, email: values.email.trim() })
      setStatus('success')
      await wait(REDIRECT_DELAY_MS)
      onSuccess?.(session)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo iniciar sesión. Inténtalo de nuevo.')
      setStatus('error')
    }
  }

  return { values, errors, status, submitError, setValue, handleSubmit }
}
