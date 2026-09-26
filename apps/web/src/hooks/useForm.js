import { useCallback, useMemo, useState } from 'react'
import { errorMessage } from '../lib/errors'

/**
 * Enfoca el primer control del campo con error (input con `name` o un
 * elemento con `data-field`).
 *
 * @param {HTMLFormElement | null} form
 * @param {Record<string, string>} errors
 */
function focusFirstError(form, errors) {
  const field = Object.keys(errors)[0]
  if (!form || !field) return
  const selector = `[name="${CSS.escape(field)}"]:not(:disabled), [data-field="${CSS.escape(field)}"]`
  form.querySelector(selector)?.focus()
}

/**
 * Estado de un formulario: valores, errores (del cliente y del servidor),
 * campos tocados y envío.
 *
 * Los errores de validación aparecen al salir del campo o al intentar enviar;
 * los del servidor (ValidationError/ConflictError con `fields`) aparecen al
 * instante en su campo y se borran en cuanto el usuario lo cambia.
 *
 * @template {Record<string, any>} T
 * @param {object} options
 * @param {T} options.initialValues
 * @param {(values: T) => Record<string, string>} options.validate Función pura (validation/*).
 * @param {(values: T) => Promise<void>} options.onSubmit Puede lanzar errores con `fields`.
 */
export default function useForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const clientErrors = useMemo(() => validate(values), [validate, values])

  const errors = useMemo(() => {
    const visible = {}
    for (const [field, message] of Object.entries(clientErrors)) {
      if (hasSubmitted || touched[field]) visible[field] = message
    }
    return { ...visible, ...serverErrors }
  }, [clientErrors, serverErrors, touched, hasSubmitted])

  /** @param {keyof T & string} name @param {any} value */
  const setValue = useCallback((name, value) => {
    setValues((current) => ({ ...current, [name]: value }))
    setServerErrors((current) => {
      if (!(name in current)) return current
      const rest = { ...current }
      delete rest[name]
      return rest
    })
  }, [])

  /** Para inputs nativos: usa `name` y `value` (o `checked`) del evento. */
  const handleChange = useCallback(
    (event) => {
      const { name, type, value, checked } = event.target
      setValue(name, type === 'checkbox' ? checked : value)
    },
    [setValue],
  )

  /** Acepta el evento de blur o directamente el nombre del campo. */
  const handleBlur = useCallback((eventOrName) => {
    const name = typeof eventOrName === 'string' ? eventOrName : eventOrName.target.name
    if (name) setTouched((current) => (current[name] ? current : { ...current, [name]: true }))
  }, [])

  /** Errores que devolvió el servidor, por campo. */
  const setFieldErrors = useCallback((fieldErrors) => setServerErrors(fieldErrors), [])

  /** @param {import('react').FormEvent<HTMLFormElement>} event */
  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    const form = event.currentTarget

    setHasSubmitted(true)
    setSubmitError('')
    if (Object.keys(clientErrors).length) {
      focusFirstError(form, clientErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      if (error?.fields) {
        setServerErrors(error.fields)
        focusFirstError(form, error.fields)
      } else {
        setSubmitError(errorMessage(error))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldErrors,
  }
}
