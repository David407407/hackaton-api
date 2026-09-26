import Logo from '../brand/Logo'
import { BRAND } from '../../config/brand'

/**
 * Encabezado del panel de login: logo, nombre de la marca, título y subtítulo.
 *
 * @param {object} props
 * @param {string} [props.titleId] Id del `<h1>`, para usarlo en aria-labelledby.
 */
function LoginHeader({ titleId }) {
  return (
    <header className="flex flex-col items-center text-center">
      <Logo size={52} />
      <p className="mt-3 text-[15px] font-bold tracking-tight text-ink">{BRAND.name}</p>
      <h1 id={titleId} className="mt-4 text-[26px] font-bold leading-tight tracking-tight text-ink">
        Bienvenido de nuevo
      </h1>
      <p className="mt-2 text-sm text-ink/65">
        Monitorea a tus pacientes y el dispensador en tiempo real.
      </p>
    </header>
  )
}

export default LoginHeader
