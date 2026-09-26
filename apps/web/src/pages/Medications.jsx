import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import DeleteMedicationDialog from '../components/medications/DeleteMedicationDialog'
import MedicationFormModal from '../components/medications/MedicationFormModal'
import MedicationGrid from '../components/medications/MedicationGrid'
import MedicationsToolbar from '../components/medications/MedicationsToolbar'
import Button from '../components/ui/Button'
import SearchInput from '../components/ui/SearchInput'
import useDisclosure from '../hooks/useDisclosure'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useMedicationFilters from '../hooks/useMedicationFilters'
import useNotify from '../hooks/useNotify'
import usePatientsByMedication from '../hooks/usePatientsByMedication'
import * as pillService from '../services/pillService'
import { medicationLabel } from '../utils/labels'

function Medications() {
  useDocumentTitle('Medicamentos')
  const [medications, setMedications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const patientsByMedication = usePatientsByMedication()
  const { search, setSearch, filter, setFilter, counts, filteredMedications, clearFilters } =
    useMedicationFilters(medications)
  const notify = useNotify()

  useEffect(() => {
    let ignore = false
    setIsLoading(true)
    pillService
      .list()
      .then((data) => {
        if (ignore) return
        setMedications(data)
        setError(null)
      })
      .catch((err) => {
        if (ignore) return
        setError(err)
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const { isOpen: isFormOpen, payload: editingMedication, open: openForm, close: closeForm } = useDisclosure()
  const { isOpen: isDeleteOpen, payload: deletingMedication, open: openDelete, close: closeDelete } = useDisclosure()

  const handleSaved = (medication, isEdit) => {
    closeForm()
    notify(isEdit ? 'Cambios guardados' : `${medicationLabel(medication)} agregado al catálogo`)
  }

  return (
    <>
      <PageHeader
        eyebrow="Catálogo del dispensador"
        title="Medicamentos"
        actions={
          <>
            <SearchInput
              id="medication-search"
              label="Buscar medicamento"
              placeholder="Buscar medicamento"
              value={search}
              onValueChange={setSearch}
            />
            <Button icon={Plus} onClick={() => openForm(null)}>
              Nuevo medicamento
            </Button>
          </>
        }
      />

      <MedicationsToolbar
        filter={filter}
        onFilterChange={setFilter}
        counts={counts}
        resultCount={filteredMedications.length}
        totalCount={medications.length}
        isLoading={isLoading}
      />

      <MedicationGrid
        medications={filteredMedications}
        totalCount={medications.length}
        patientsByMedication={patientsByMedication}
        isLoading={isLoading}
        error={error}
        onEdit={openForm}
        onDelete={openDelete}
        onCreate={() => openForm(null)}
        onClearFilters={clearFilters}
      />

      <MedicationFormModal
        open={isFormOpen}
        medication={editingMedication}
        onClose={closeForm}
        onSaved={handleSaved}
      />
      <DeleteMedicationDialog medication={isDeleteOpen ? deletingMedication : null} onClose={closeDelete} />
    </>
  )
}

export default Medications
