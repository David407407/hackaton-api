import { BRAND } from '../../config/brand'
import Logo from './Logo'

/**
 * Logo + nombre (y tagline opcional) para fondos oscuros (`bg-ink`).
 *
 * @param {object} props
 * @param {number} [props.logoSize=38]
 * @param {boolean} [props.showTagline=true]
 */
function BrandMark({ logoSize = 38, showTagline = true }) {
  return (
    <div className="flex items-center gap-3">
      <Logo size={logoSize} className="shrink-0" />
      <div className="min-w-0">
        <p className="text-[17px] font-bold leading-tight tracking-tight">{BRAND.name}</p>
        {showTagline && <p className="text-[11px] font-medium text-white/55">{BRAND.tagline}</p>}
      </div>
    </div>
  )
}

export default BrandMark
