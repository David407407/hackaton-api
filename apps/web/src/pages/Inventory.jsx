import InventoryDashboard from '../components/inventory/InventoryDashboard'
import InventorySkeleton from '../components/inventory/InventorySkeleton'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useInventory from '../hooks/useInventory'

function Inventory() {
  useDocumentTitle('Inventario')
  const dispenser = useInventory()

  if (dispenser.isLoading || dispenser.error) return <InventorySkeleton error={dispenser.error} />
  return <InventoryDashboard dispenser={dispenser} />
}

export default Inventory
