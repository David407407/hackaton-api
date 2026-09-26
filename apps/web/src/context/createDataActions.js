import * as assignmentsService from '../services/assignmentsService'
import * as demoDataService from '../services/demoDataService'
import * as medicationsService from '../services/medicationsService'
import * as patientsService from '../services/patientsService'
import { normalizeAssignment } from '../validation/assignment'
import { normalizeMedication } from '../validation/medication'
import { normalizePatient } from '../validation/patient'

let txSequence = 0
const nextTxId = () => `tx-${(txSequence += 1)}`

/**
 * Acciones del DataProvider. Cada una llama al servicio y después actualiza el
 * estado.
 *
 * Las ediciones, bajas y cambios de stock son optimistas: el cambio se ve al
 * instante (el reducer guarda cómo deshacerlo) y, si el servicio falla, se
 * revierte y el error se relanza para que la UI lo muestre. Las altas esperan
 * al servicio porque el id lo genera él.
 *
 * @param {import('react').Dispatch<import('./dataReducer').DataAction>} dispatch
 */
export function createDataActions(dispatch) {
  const upsert = (collection, item) => dispatch({ type: 'UPSERT', collection, item })
  const insert = (collection, items) => dispatch({ type: 'INSERT', collection, items })

  /**
   * @template T
   * @param {import('./dataReducer').OptimisticChange[]} changes
   * @param {() => Promise<T>} request
   * @param {(result: T) => void} [onSuccess]
   * @returns {Promise<T>}
   */
  async function optimistic(changes, request, onSuccess) {
    const txId = nextTxId()
    dispatch({ type: 'OPTIMISTIC', txId, changes })
    try {
      const result = await request()
      onSuccess?.(result)
      dispatch({ type: 'COMMIT', txId })
      return result
    } catch (error) {
      dispatch({ type: 'ROLLBACK', txId })
      throw error
    }
  }

  return {
    /* ---------- Pacientes ---------- */

    async createPatient(input) {
      const patient = await patientsService.create(input)
      upsert('patients', patient)
      return patient
    },

    updatePatient(id, patch) {
      return optimistic(
        [{ collection: 'patients', op: 'patch', id, patch, normalize: normalizePatient }],
        () => patientsService.update(id, patch),
        (saved) => upsert('patients', saved),
      )
    },

    /** Borra al paciente y sus asignaciones. Devuelve el snapshot para "Deshacer". */
    deletePatient(id) {
      return optimistic(
        [
          { collection: 'patients', op: 'removeWhere', field: 'id', value: id },
          { collection: 'assignments', op: 'removeWhere', field: 'patientId', value: id },
        ],
        () => patientsService.remove(id),
      )
    },

    async restorePatient(snapshot) {
      const restored = await patientsService.restore(snapshot)
      insert('patients', [restored.patient])
      insert('assignments', restored.assignments)
      return restored
    },

    /* ---------- Medicamentos ---------- */

    async createMedication(input) {
      const medication = await medicationsService.create(input)
      upsert('medications', medication)
      return medication
    },

    updateMedication(id, patch) {
      return optimistic(
        [{ collection: 'medications', op: 'patch', id, patch, normalize: normalizeMedication }],
        () => medicationsService.update(id, patch),
        (saved) => upsert('medications', saved),
      )
    },

    /** Descuenta las pastillas que entregó el dispensador. */
    dispenseMedication(id, quantity) {
      return optimistic(
        [{ collection: 'medications', op: 'adjust', id, field: 'stock', delta: -quantity, min: 0 }],
        () => medicationsService.dispense(id, quantity),
        (saved) => upsert('medications', saved),
      )
    },

    /**
     * Borra el medicamento y sus asignaciones inactivas. Si está en uso, el
     * servicio lanza InUseError y el cambio se revierte.
     */
    deleteMedication(id) {
      return optimistic(
        [
          { collection: 'medications', op: 'removeWhere', field: 'id', value: id },
          { collection: 'assignments', op: 'removeWhere', field: 'medicationId', value: id },
        ],
        () => medicationsService.remove(id),
      )
    },

    async restoreMedication(snapshot) {
      const restored = await medicationsService.restore(snapshot)
      insert('medications', [restored.medication])
      insert('assignments', restored.assignments)
      return restored
    },

    /* ---------- Asignaciones ---------- */

    async createAssignment(input) {
      const assignment = await assignmentsService.create(input)
      upsert('assignments', assignment)
      return assignment
    },

    updateAssignment(id, patch) {
      return optimistic(
        [{ collection: 'assignments', op: 'patch', id, patch, normalize: normalizeAssignment }],
        () => assignmentsService.update(id, patch),
        (saved) => upsert('assignments', saved),
      )
    },

    /** Devuelve la asignación borrada para "Deshacer". */
    deleteAssignment(id) {
      return optimistic(
        [{ collection: 'assignments', op: 'removeWhere', field: 'id', value: id }],
        () => assignmentsService.remove(id),
      )
    },

    async restoreAssignment(assignment) {
      const restored = await assignmentsService.restore(assignment)
      insert('assignments', [restored])
      return restored
    },

    /* ---------- Demo ---------- */

    async resetDemoData() {
      const data = await demoDataService.resetDemoData()
      dispatch({ type: 'LOADED', data })
    },
  }
}
