/**
 * Globo de la gráfica. Se posiciona en porcentaje sobre su contenedor
 * (`relative`) y queda centrado arriba del punto (x, y).
 *
 * @param {object} props
 * @param {number} props.x Posición horizontal, 0–100 (%).
 * @param {number} props.y Posición vertical, 0–100 (%).
 * @param {string} props.title
 * @param {string} props.detail
 */
function ChartTooltip({ x, y, title, detail }) {
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-lg motion-safe:transition-[left,top] motion-safe:duration-200"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <p className="font-bold">{title}</p>
      <p className="text-white/75">{detail}</p>
    </div>
  )
}

export default ChartTooltip
