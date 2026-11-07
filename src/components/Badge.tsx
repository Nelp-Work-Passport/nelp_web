import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

export type BadgeTone = 'ok' | 'warn' | 'bad' | 'info' | 'neu'

export interface BadgeProps {
  tone?: BadgeTone
  /** Paired with the tone so colour is never the only signal. */
  icon?: IconName
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Badge({ tone = 'neu', icon, children, className, style }: BadgeProps) {
  return (
    <span className={cx('badge', tone, className)} style={style}>
      {icon ? <Icon name={icon} /> : null}
      {children}
    </span>
  )
}

/**
 * The dashed "Demo" marker. Insurance quotes are never real, and every
 * place one appears says so with this.
 */
export function DemoBadge({ children = 'Demo' }: { children?: React.ReactNode }) {
  return <span className="badge demo">{children}</span>
}

/** The blue tick a rider gets once an admin approves their ID. */
export function VerifiedTick({ withLabel }: { withLabel?: boolean }) {
  const tick = (
    <span className="vt" role={withLabel ? undefined : 'img'} aria-label={withLabel ? undefined : 'Verified'}>
      <Icon name="check" />
    </span>
  )
  if (!withLabel) return tick
  return (
    <span className="vtl">
      {tick}
      Verified
    </span>
  )
}

/** Verified ID plus a score of 70 or more. Gates the demo insurance quote. */
export function AssuredBadge({
  children = 'Assured',
  style,
}: {
  children?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <span className="assured" style={style}>
      <Icon name="shield" />
      {children}
    </span>
  )
}
