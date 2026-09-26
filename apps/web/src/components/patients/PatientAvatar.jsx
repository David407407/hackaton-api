import clsx from 'clsx'
import { memo } from 'react'

/*
 * Los hex de este archivo son de ilustración (piel, cabello, ropa) y vienen de
 * los datos del paciente, no del sistema de UI.
 */

/**
 * Retrato ilustrado del paciente en SVG (o su inicial si no tiene avatar).
 * Solo necesita `name` y `avatar`, así sirve también para la vista previa del
 * formulario.
 *
 * @param {object} props
 * @param {Pick<import('../../services/patientsService').Patient, 'name' | 'avatar'>} props.patient
 * @param {number} [props.size=64] Lado en px.
 * @param {string} [props.className]
 */
function PatientAvatar({ patient, size = 64, className }) {
  const name = patient.name || 'paciente nuevo'
  const p = patient.avatar
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  if (!p) {
    return (
      <span
        aria-label={`Retrato de ${name}`}
        style={{ width: size, height: size }}
        className={clsx(
          'grid shrink-0 place-items-center rounded-full bg-teal/15 text-lg font-semibold text-teal',
          className,
        )}
      >
        {initial}
      </span>
    )
  }

  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={clsx('shrink-0 rounded-full', className)}
      role="img"
      aria-label={`Retrato de ${name}`}
    >
      <circle cx="40" cy="40" r="40" fill={p.bg} />
      <path d="M10 80c2-15 14-23 30-23s28 8 30 23Z" fill={p.shirt} />
      <path d="M33 57l7 8 7-8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" opacity=".85" />
      <rect x="34" y="46" width="12" height="12" rx="5" fill={p.skin} />
      <ellipse cx="25.5" cy="37" rx="3" ry="4.5" fill={p.skin} />
      <ellipse cx="54.5" cy="37" rx="3" ry="4.5" fill={p.skin} />
      <ellipse cx="40" cy="35" rx="14.5" ry="16.5" fill={p.skin} />
      {p.hairStyle === 'bun' && (
        <>
          <circle cx="40" cy="15" r="7" fill={p.hair} />
          <path d="M24.5 38c-2.5-15 5-23.5 15.5-23.5S58 23 55.5 38c-1.5-7-5-12-9-13-2 3-9 5-14 5-4 0-6 2-8 8Z" fill={p.hair} />
        </>
      )}
      {p.hairStyle === 'short' && (
        <path d="M25.5 35c-1-12 5-18.5 14.5-18.5S55.5 23 54.5 35c-1.5-5-3-8-5-9-3 1.5-7 2-9.5 2-3 0-7-.5-9.5-2-2 1-3.5 4-5 9Z" fill={p.hair} />
      )}
      {p.hairStyle === 'bald' && (
        <>
          <path d="M25.5 36c-.5-5 1-8 3-10 0 4 .5 7 1.5 10Z" fill={p.hair} />
          <path d="M54.5 36c.5-5-1-8-3-10 0 4-.5 7-1.5 10Z" fill={p.hair} />
        </>
      )}
      <circle cx="34.5" cy="36" r="1.6" fill="#2b2320" />
      <circle cx="45.5" cy="36" r="1.6" fill="#2b2320" />
      <path d="M31 31.5q3.5-2 7 0M42 31.5q3.5-2 7 0" fill="none" stroke={p.hair} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="31" cy="42" r="2.6" fill="#e2836e" opacity=".28" />
      <circle cx="49" cy="42" r="2.6" fill="#e2836e" opacity=".28" />
      {p.beard && <path d="M28 42c1 9 6 10.5 12 10.5S51 51 52 42c-2 3-5 4-12 4s-10-1-12-4Z" fill={p.hair} />}
      {(p.mustache || p.beard) && (
        <path d="M34.5 44.2c2-1.8 4-1.8 5.5-.6 1.5-1.2 3.5-1.2 5.5.6-2 .8-3.8.9-5.5.3-1.7.6-3.5.5-5.5-.3Z" fill={p.hair} />
      )}
      <path d="M36.5 46.5q3.5 2.6 7 0" fill="none" stroke="#8a4b3c" strokeWidth="1.6" strokeLinecap="round" />
      {p.glasses && (
        <g fill="none" stroke="#1d3b47" strokeWidth="1.5">
          <rect x="29.5" y="32.2" width="9.5" height="7.6" rx="3" />
          <rect x="41" y="32.2" width="9.5" height="7.6" rx="3" />
          <path d="M39 35.5h2" />
        </g>
      )}
    </svg>
  )
}

export default memo(PatientAvatar)
