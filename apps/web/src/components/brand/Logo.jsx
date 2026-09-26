/**
 * Logotipo: cuadro teal con una cápsula blanca (mitad derecha mist) rotada -40°.
 * Es decorativo salvo que se pase `title`.
 *
 * @param {object} props
 * @param {number} [props.size=52] Lado en px.
 * @param {string} [props.title] Nombre accesible; si se omite, el SVG queda aria-hidden.
 * @param {string} [props.className]
 */
function Logo({ size = 52, title, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <rect width="36" height="36" rx="11" className="fill-teal" />
      <g transform="rotate(-40 18 18)">
        <rect x="8" y="13.5" width="20" height="9" rx="4.5" className="fill-white" />
        <path d="M18 13.5h5.5a4.5 4.5 0 0 1 0 9H18z" className="fill-mist" />
      </g>
    </svg>
  )
}

export default Logo
