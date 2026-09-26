/** @type {import('./dataContext').DataState} */
export const INITIAL_DATA_STATE = {
  status: 'loading',
  error: null,
  patients: [],
  medications: [],
  assignments: [],
  /** Cambios optimistas en curso: txId → lo necesario para deshacerlos. */
  pending: {},
}

/**
 * @typedef {'patients' | 'medications' | 'assignments'} Collection
 *
 * Cambio optimista (se aplica ya y se puede deshacer con ROLLBACK):
 * @typedef {(
 *   | { collection: Collection, op: 'patch', id: string, patch: object, normalize?: (item: object) => object }
 *   | { collection: Collection, op: 'adjust', id: string, field: string, delta: number, min?: number }
 *   | { collection: Collection, op: 'removeWhere', field: string, value: unknown }
 * )} OptimisticChange
 *
 * @typedef {(
 *   | { type: 'LOADED', data: Pick<import('./dataContext').DataState, Collection> }
 *   | { type: 'LOAD_FAILED', error: Error }
 *   | { type: 'UPSERT', collection: Collection, item: { id: string } }
 *   | { type: 'INSERT', collection: Collection, items: { id: string }[] }
 *   | { type: 'OPTIMISTIC', txId: string, changes: OptimisticChange[] }
 *   | { type: 'COMMIT', txId: string }
 *   | { type: 'ROLLBACK', txId: string }
 * )} DataAction
 */

const upsertItem = (list, item) =>
  list.some((current) => current.id === item.id)
    ? list.map((current) => (current.id === item.id ? item : current))
    : [...list, item]

/** Aplica un cambio y devuelve el estado nuevo y cómo deshacerlo. */
function applyChange(state, change) {
  const list = state[change.collection]

  if (change.op === 'removeWhere') {
    const removed = list.filter((item) => item[change.field] === change.value)
    return {
      state: { ...state, [change.collection]: list.filter((item) => item[change.field] !== change.value) },
      undo: removed.map((item) => ({ collection: change.collection, item })),
    }
  }

  const current = list.find((item) => item.id === change.id)
  if (!current) return { state, undo: [] }

  const next =
    change.op === 'adjust'
      ? { ...current, [change.field]: Math.max(change.min ?? -Infinity, current[change.field] + change.delta) }
      : { ...current, ...(change.normalize ? change.normalize({ ...current, ...change.patch }) : change.patch) }

  return {
    state: { ...state, [change.collection]: list.map((item) => (item.id === change.id ? next : item)) },
    undo: [{ collection: change.collection, item: current }],
  }
}

/**
 * @param {import('./dataContext').DataState} state
 * @param {DataAction} action
 */
export function dataReducer(state, action) {
  switch (action.type) {
    case 'LOADED':
      return { ...state, ...action.data, status: 'ready', error: null, pending: {} }

    case 'LOAD_FAILED':
      return { ...state, status: 'error', error: action.error }

    case 'UPSERT':
      return { ...state, [action.collection]: upsertItem(state[action.collection], action.item) }

    case 'INSERT': {
      const existing = new Set(state[action.collection].map((item) => item.id))
      const items = action.items.filter((item) => !existing.has(item.id))
      return items.length ? { ...state, [action.collection]: [...state[action.collection], ...items] } : state
    }

    case 'OPTIMISTIC': {
      let next = state
      const undo = []
      for (const change of action.changes) {
        const result = applyChange(next, change)
        next = result.state
        undo.push(...result.undo)
      }
      return { ...next, pending: { ...next.pending, [action.txId]: undo } }
    }

    case 'COMMIT': {
      if (!(action.txId in state.pending)) return state
      const pending = { ...state.pending }
      delete pending[action.txId]
      return { ...state, pending }
    }

    case 'ROLLBACK': {
      const undo = state.pending[action.txId]
      if (!undo) return state
      let next = state
      // Cada registro vuelve a como estaba antes del cambio (o se reinserta si se había borrado).
      for (const { collection, item } of undo) {
        next = { ...next, [collection]: upsertItem(next[collection], item) }
      }
      const pending = { ...next.pending }
      delete pending[action.txId]
      return { ...next, pending }
    }

    default:
      return state
  }
}
