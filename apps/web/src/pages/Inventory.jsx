import InventoryDashboard from '../components/inventory/InventoryDashboard'
import InventorySkeleton from '../components/inventory/InventorySkeleton'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { useEffect, useState } from 'react'
import * as pillService from '../services/pillService'
import * as taskService from '../services/taskService'

function Inventory() {
  useDocumentTitle('Inventario')
  const [pills, setPills] = useState([])
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    setIsLoading(true)
    Promise.all([pillService.list(), taskService.list()])
      .then(([pillData, taskData]) => {
        if (ignore) return
        setPills(pillData)
        setTasks(taskData)
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

  if (isLoading || error) return <InventorySkeleton error={error} />
  return <InventoryDashboard pills={pills} tasks={tasks} />
}

export default Inventory
