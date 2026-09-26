import { Clock, Heart, Pill, Users } from 'lucide-react'
import StatCard from '../ui/StatCard'
import Skeleton from '../ui/Skeleton'
import { CARD_COLORS } from '../../constants/cardColors'
import { DOSE_SUMMARY } from '../../data/dispenser'
import { patientGreetingName } from '../../utils/labels'

const SKELETON_IDS = ['s1', 's2', 's3', 's4']

/**
 * Indicadores derivados de los pacientes y sus asignaciones.
 *
 * @param {import('../../services/patientsService').Patient[]} patients
 * @param {Map<string, import('../../utils/selectors').PatientSummary>} summaries
 * @param {{ scheduled: number, delivered: number }} doses Tomas de hoy.
 */
function getStats(patients, summaries, doses) {
  const withAdherence = patients.filter((patient) => Number.isFinite(patient.adherence))
  const adherence = withAdherence.length
    ? Math.round(withAdherence.reduce((sum, patient) => sum + patient.adherence, 0) / withAdherence.length)
    : 0
  const adherenceDelta = adherence - DOSE_SUMMARY.previousWeekAdherence

  // Paciente con la próxima toma más cercana.
  const next = patients.reduce((soonest, patient) => {
    const candidate = summaries.get(patient.id)?.nextDose
    if (!candidate) return soonest
    return !soonest || candidate.at < soonest.dose.at ? { patient, dose: candidate } : soonest
  }, null)

  return [
    {
      id: 'active',
      label: 'Pacientes activos',
      value: patients.length,
      icon: Users,
      iconTone: 'teal',
      note: `${patients.length} de ${Object.keys(CARD_COLORS).length} tarjetas vinculadas al sensor`,
    },
    {
      id: 'doses',
      label: 'Dosis entregadas hoy',
      value: doses.delivered,
      suffix: `/ ${doses.scheduled}`,
      icon: Pill,
      iconTone: 'indigo',
      note: `${doses.scheduled - doses.delivered} programadas para más tarde`,
    },
    {
      id: 'adherence',
      label: 'Adherencia semanal',
      value: `${adherence}%`,
      icon: Heart,
      iconTone: 'teal',
      note: `${adherenceDelta >= 0 ? '+' : ''}${adherenceDelta}% vs. semana anterior`,
      noteTone: adherenceDelta >= 0 ? 'positive' : 'negative',
    },
    {
      id: 'next',
      label: 'Próxima dispensación',
      value: next ? summaries.get(next.patient.id).nextDoseLabel : '—',
      icon: Clock,
      iconTone: 'neutral',
      note: next
        ? `${patientGreetingName(next.patient)} · Tarjeta ${CARD_COLORS[next.patient.card]?.label ?? next.patient.card}`
        : 'Sin tomas programadas',
    },
  ]
}

/**
 * Fila de indicadores de la página de pacientes.
 *
 * @param {object} props
 * @param {import('../../services/patientsService').Patient[]} props.patients Lista completa (sin filtrar).
 * @param {Map<string, import('../../utils/selectors').PatientSummary>} props.summaries
 * @param {{ scheduled: number, delivered: number }} props.doses
 * @param {boolean} props.isLoading
 */
function PatientStats({ patients, summaries, doses, isLoading }) {
  return (
    <section aria-label="Indicadores" className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
      {isLoading
        ? SKELETON_IDS.map((id) => <Skeleton key={id} className="h-[145px] rounded-3xl bg-white/70" />)
        : getStats(patients, summaries, doses).map(({ id, ...stat }) => <StatCard key={id} {...stat} />)}
    </section>
  )
}

export default PatientStats
