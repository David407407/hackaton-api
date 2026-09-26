import { Plus } from 'lucide-react'
import PatientCard from './PatientCard'
import PatientCardSkeleton from './PatientCardSkeleton'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

const SKELETON_IDS = ['s1', 's2', 's3', 's4', 's5', 's6']
const EMPTY_SUMMARY = { medsCount: 0, nextDoseLabel: '—' }

/**
 * Grid de pacientes con sus estados de carga, error y vacío.
 *
 * @param {object} props
 * @param {import('../../services/patientsService').Patient[]} props.patients Ya filtrados.
 * @param {number} props.totalCount Pacientes sin filtrar (para distinguir "sin resultados" de "sin pacientes").
 * @param {Map<string, import('../../utils/selectors').PatientSummary>} props.summaries
 * @param {boolean} props.isLoading
 * @param {Error | null} [props.error]
 * @param {string | null} props.activeId Paciente con el detalle abierto.
 * @param {(patient: import('../../services/patientsService').Patient) => void} props.onOpen
 * @param {(patient: import('../../services/patientsService').Patient) => void} props.onEdit
 * @param {(patient: import('../../services/patientsService').Patient) => void} props.onDelete
 * @param {() => void} props.onCreate
 * @param {() => void} props.onClearFilters
 */
function PatientGrid({
  patients,
  totalCount,
  summaries,
  isLoading,
  error,
  activeId,
  onOpen,
  onEdit,
  onDelete,
  onCreate,
  onClearFilters,
}) {
  const renderContent = () => {
    if (isLoading) return SKELETON_IDS.map((id) => <PatientCardSkeleton key={id} />)

    if (error) return <EmptyState>No se pudieron cargar los pacientes. Intenta recargar la página.</EmptyState>

    if (totalCount === 0) {
      return (
        <EmptyState
          action={
            <Button size="sm" icon={Plus} onClick={onCreate}>
              Nuevo paciente
            </Button>
          }
        >
          Todavía no hay pacientes registrados.
        </EmptyState>
      )
    }

    if (patients.length === 0) {
      return (
        <EmptyState
          action={
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Limpiar filtros
            </Button>
          }
        >
          No hay pacientes con ese filtro.
        </EmptyState>
      )
    }

    return patients.map((patient) => {
      const id = patient.id ?? patient._id
      const summary = summaries.get(id) ?? EMPTY_SUMMARY
      return (
        <PatientCard
          key={id}
          patient={patient}
          medsCount={summary.medsCount}
          nextDoseLabel={summary.nextDoseLabel}
          isActive={id === activeId}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )
    })
  }

  return (
    <section aria-label="Pacientes" aria-busy={isLoading} className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {renderContent()}
    </section>
  )
}

export default PatientGrid
