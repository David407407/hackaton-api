import { Plus } from 'lucide-react'
import MedicationCard from './MedicationCard'
import MedicationCardSkeleton from './MedicationCardSkeleton'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'

const SKELETON_IDS = ['s1', 's2', 's3', 's4', 's5', 's6']
const NO_PATIENTS = []

/**
 * Grid del catálogo con sus estados de carga, error y vacío.
 *
 * @param {object} props
 * @param {import('../../services/medicationsService').Medication[]} props.medications Ya filtrados.
 * @param {number} props.totalCount Sin filtrar.
 * @param {Map<string, import('../../services/patientsService').Patient[]>} props.patientsByMedication
 * @param {boolean} props.isLoading
 * @param {Error | null} [props.error]
 * @param {(medication: import('../../services/medicationsService').Medication) => void} props.onEdit
 * @param {(medication: import('../../services/medicationsService').Medication) => void} props.onDelete
 * @param {() => void} props.onCreate
 * @param {() => void} props.onClearFilters
 */
function MedicationGrid({
  medications,
  totalCount,
  patientsByMedication,
  isLoading,
  error,
  onEdit,
  onDelete,
  onCreate,
  onClearFilters,
}) {
  const renderContent = () => {
    if (isLoading) return SKELETON_IDS.map((id) => <MedicationCardSkeleton key={id} />)

    if (error) return <EmptyState>No se pudo cargar el catálogo. Intenta recargar la página.</EmptyState>

    if (totalCount === 0) {
      return (
        <EmptyState
          action={
            <Button size="sm" icon={Plus} onClick={onCreate}>
              Nuevo medicamento
            </Button>
          }
        >
          El catálogo está vacío. Agrega el primer medicamento del dispensador.
        </EmptyState>
      )
    }

    if (medications.length === 0) {
      return (
        <EmptyState
          action={
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Limpiar filtros
            </Button>
          }
        >
          No hay medicamentos con ese filtro.
        </EmptyState>
      )
    }

    return medications.map((medication) => (
      <MedicationCard
        key={medication.id}
        medication={medication}
        patients={patientsByMedication.get(medication.id) ?? NO_PATIENTS}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))
  }

  return (
    <section
      aria-label="Medicamentos"
      aria-busy={isLoading}
      className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
    >
      {renderContent()}
    </section>
  )
}

export default MedicationGrid
