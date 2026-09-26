import CompartmentTile from './CompartmentTile'
import EmptyCompartmentTile from './EmptyCompartmentTile'
import Panel from '../ui/Panel'

/**
 * Panel "Compartimentos": nivel de cada compartimento del dispensador (los
 * vacíos también se muestran).
 *
 * @param {object} props
 * @param {import('../../hooks/useInventory').CompartmentTileData[]} props.tiles
 * @param {string} [props.className]
 */
function CompartmentsPanel({ tiles, className }) {
  return (
    <Panel
      title="Compartimentos"
      className={className}
      actions={<p className="text-xs font-medium text-ink/60">Stock descontado con cada toma entregada</p>}
    >
      <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {tiles.map((tile) =>
          tile.compartment ? (
            <CompartmentTile key={tile.id} compartment={tile.compartment} />
          ) : (
            <EmptyCompartmentTile key={tile.id} id={tile.id} />
          ),
        )}
      </ul>
    </Panel>
  )
}

export default CompartmentsPanel
