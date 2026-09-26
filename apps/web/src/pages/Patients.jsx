import { Plus } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import PageHeader from '../components/layout/PageHeader'
import CardColorFilter from '../components/patients/CardColorFilter'
import DeletePatientDialog from '../components/patients/DeletePatientDialog'
import PatientDetailDrawer from '../components/patients/PatientDetailDrawer'
import PatientFormDrawer from '../components/patients/PatientFormDrawer'
import PatientGrid from '../components/patients/PatientGrid'
import PatientStats from '../components/patients/PatientStats'
import Button from '../components/ui/Button'
import SearchInput from '../components/ui/SearchInput'
import { CARD_COLORS } from '../constants/cardColors'
import { FACILITY } from '../data/session'
import useDisclosure from '../hooks/useDisclosure'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useNotify from '../hooks/useNotify'
import useNow from '../hooks/useNow'
import usePatientFilters from '../hooks/usePatientFilters'
import usePatientsData from '../hooks/usePatientsData'
import useSearchParamDialog from '../hooks/useSearchParamDialog'
import { formatLongDate } from '../utils/formatDate'
import { assignmentsOf, patientSummaries, todayDoseSummary } from '../utils/selectors'

const CARD_COUNT = Object.keys(CARD_COLORS).length

function Patients() {
  useDocumentTitle('Pacientes')
  const {
    patients,
    medications,
    assignments,
    isLoading,
    error,
    savePatient,
    removePatient,
    addRestoredPatient,
    saveAssignment,
    removeAssignment,
  } = usePatientsData()
  const now = useNow()
  const summaries = useMemo(() => patientSummaries(patients, assignments, now), [patients, assignments, now])
  const doses = useMemo(() => todayDoseSummary(assignments, now), [assignments, now])
  const { search, setSearch, cardColor, setCardColor, filteredPatients, clearFilters } = usePatientFilters(patients)
  const notify = useNotify()

  const { value: detailId, open: openDetail, close: closeDetail } = useSearchParamDialog('paciente')
  const { isOpen: isFormOpen, payload: editingPatient, open: openForm, close: closeForm } = useDisclosure()
  const { isOpen: isDeleteOpen, payload: deletingPatient, open: openDelete, close: closeDelete } = useDisclosure()

  const detailPatient = patients.find((patient) => patient.id === detailId) ?? null
  const allCardsTaken = new Set(patients.map((patient) => patient.card)).size >= CARD_COUNT

  const handleCreate = useCallback(() => {
    if (allCardsTaken) {
      notify({ message: `Las ${CARD_COUNT} tarjetas están asignadas`, tone: 'warning' })
      return
    }
    openForm(null)
  }, [allCardsTaken, notify, openForm])

  const handleOpen = useCallback((patient) => openDetail(patient.id), [openDetail])

  const handleSaved = (patient, isEdit) => {
    savePatient(patient)
    closeForm()
    notify(isEdit ? 'Cambios guardados' : `${patient.name} registrado`)
  }

  const handleDeleted = (patient) => {
    removePatient(patient.id)
    if (patient.id === detailId) closeDetail()
  }

  return (
    <>
      <PageHeader
        eyebrow={`${formatLongDate(new Date())} · ${FACILITY.name}`}
        title="Pacientes"
        actions={
          <>
            <SearchInput
              id="patient-search"
              label="Buscar paciente"
              placeholder="Buscar paciente"
              value={search}
              onValueChange={setSearch}
            />
            <Button
              icon={Plus}
              onClick={handleCreate}
              title={allCardsTaken ? `Las ${CARD_COUNT} tarjetas están asignadas` : undefined}
            >
              Nuevo paciente
            </Button>
          </>
        }
      />

      <PatientStats patients={patients} summaries={summaries} doses={doses} isLoading={isLoading} />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <CardColorFilter value={cardColor} onChange={setCardColor} />
        <p aria-live="polite" className="text-sm text-ink/60">
          {isLoading ? 'Cargando pacientes…' : `${filteredPatients.length} de ${patients.length} pacientes`}
        </p>
      </div>

      <PatientGrid
        patients={filteredPatients}
        totalCount={patients.length}
        summaries={summaries}
        isLoading={isLoading}
        error={error}
        activeId={detailId}
        onOpen={handleOpen}
        onEdit={openForm}
        onDelete={openDelete}
        onCreate={handleCreate}
        onClearFilters={clearFilters}
      />

      <PatientDetailDrawer
        patient={detailPatient}
        assignments={detailPatient ? assignmentsOf(assignments, detailPatient.id) : []}
        medications={medications}
        onClose={closeDetail}
        onEdit={openForm}
        onDelete={openDelete}
        onAssignmentSaved={saveAssignment}
        onAssignmentRemoved={removeAssignment}
      />
      <PatientFormDrawer
        open={isFormOpen}
        patient={editingPatient}
        patients={patients}
        onClose={closeForm}
        onSaved={handleSaved}
      />
      <DeletePatientDialog
        patient={isDeleteOpen ? deletingPatient : null}
        assignmentCount={deletingPatient ? assignmentsOf(assignments, deletingPatient.id).length : 0}
        onClose={closeDelete}
        onDeleted={handleDeleted}
        onRestored={addRestoredPatient}
      />
    </>
  )
}

export default Patients
