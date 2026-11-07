import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

export interface EmptyStateProps {
  title: React.ReactNode
  children?: React.ReactNode
  icon?: IconName
  /** One action, as the one-main-action rule expects. */
  actions?: React.ReactNode
  /** Heading level, so the page's outline stays in order. */
  as?: 'h2' | 'h3'
  className?: string
  style?: React.CSSProperties
}

/** Nothing here yet, with a reason and a way forward. */
export function EmptyState({
  title,
  children,
  icon,
  actions,
  as: Heading = 'h2',
  className,
  style,
}: EmptyStateProps) {
  return (
    <div className={cx('empty', className)} style={style}>
      {icon ? (
        <div className="eic">
          <Icon name={icon} size="xl" />
        </div>
      ) : null}
      <Heading className="h3">{title}</Heading>
      {children ? <p className="muted">{children}</p> : null}
      {actions ? <div className="row ctr">{actions}</div> : null}
    </div>
  )
}
