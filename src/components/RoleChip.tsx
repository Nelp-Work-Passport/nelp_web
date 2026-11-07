import type { Role } from '../domain/types'
import { showRoleChip } from '../lib/env'

export interface RoleChipProps {
  role: Role
  /** Renders the chip itself, outside the dev bar. */
  bare?: boolean
  /** Overrides the label, for the design's "SENDING SOMETHING" and "TO RIDER". */
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * The role marker from the design frames.
 *
 * In the bar at the top of a page this is a development aid, shown only when
 * `VITE_SHOW_ROLE_CHIP` is on. The same chip is also used inside pages where
 * the design uses it as real content, which is what `bare` is for.
 */
export function RoleChip({ role, bare, children, className, style }: RoleChipProps) {
  const chip = (
    <span className={`rolechip ${role} ${className ?? ''}`.trim()} style={style}>
      {children ?? role.toUpperCase()}
    </span>
  )
  if (bare) return chip
  if (!showRoleChip()) return null
  return <div className="rolebar">{chip}</div>
}
