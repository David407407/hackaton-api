import clsx from 'clsx'
import { Clock, Plus, X } from 'lucide-react'
import { useState } from 'react'
import Button from './Button'
import Field from './Field'
import { CONTROL_BOX, controlRing, describedByOf } from './fieldIds'

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

/**
 * Lista de horarios 'HH:mm' como chips, con un input de hora para agregar
 * más. No admite repetidos y siempre entrega la lista ordenada. Enter en el
 * input también agrega.
 *
 * @param {object} props
 * @param {string} props.id
 * @param {string} props.name Se usa para enfocar el campo cuando tiene error.
 * @param {string} props.label
 * @param {string[]} props.value
 * @param {(times: string[]) => void} props.onValueChange
 * @param {number} [props.max=6]
 * @param {string} [props.defaultTime='08:00'] Valor inicial del input.
 * @param {string} [props.error]
 * @param {string} [props.className]
 */
function TimeListInput({ id, name, label, value, onValueChange, max = 6, defaultTime = '08:00', error, className }) {
  const [draft, setDraft] = useState(defaultTime)
  const [draftError, setDraftError] = useState('')
  const isFull = value.length >= max
  const shownError = draftError || error

  const addTime = () => {
    if (!TIME_PATTERN.test(draft)) return setDraftError('Escribe una hora válida.')
    if (value.includes(draft)) return setDraftError(`Las ${draft} ya están en la lista.`)
    if (isFull) return setDraftError(`Máximo ${max} horarios.`)
    setDraftError('')
    onValueChange([...value, draft].sort())
  }

  const removeTime = (time) => {
    setDraftError('')
    onValueChange(value.filter((item) => item !== time))
  }

  /** @param {import('react').KeyboardEvent<HTMLInputElement>} event */
  const handleKeyDown = (event) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    addTime()
  }

  return (
    <Field id={id} label={label} error={shownError} labelAside={`${value.length} / ${max}`} className={className}>
      {value.length > 0 && (
        <ul aria-label="Horarios agregados" className="mb-2.5 flex flex-wrap gap-2">
          {value.map((time) => (
            <li
              key={time}
              className="inline-flex items-center gap-1 rounded-full bg-teal/12 py-1 pl-3 pr-1 text-sm font-semibold text-ink tabular-nums"
            >
              <Clock aria-hidden className="mr-0.5 size-3.5 text-teal" />
              {time}
              <button
                type="button"
                onClick={() => removeTime(time)}
                aria-label={`Quitar ${time}`}
                className="grid size-6 place-items-center rounded-full text-ink/55 transition hover:bg-white hover:text-ink focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-teal/30"
              >
                <X aria-hidden className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <div className={clsx('flex h-12 flex-1 items-center px-4', CONTROL_BOX, controlRing(shownError))}>
          <input
            id={id}
            name={name}
            type="time"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              setDraftError('')
            }}
            onKeyDown={handleKeyDown}
            aria-invalid={shownError ? true : undefined}
            aria-describedby={describedByOf(id, { error: shownError })}
            className="h-full w-full min-w-0 bg-transparent text-[15px] text-ink tabular-nums outline-hidden"
          />
        </div>
        <Button variant="secondary" icon={Plus} onClick={addTime} disabled={isFull} className="h-12">
          Agregar
        </Button>
      </div>
    </Field>
  )
}

export default TimeListInput
