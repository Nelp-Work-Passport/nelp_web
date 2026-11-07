import { cx } from '../lib/cx'
import { Icon } from './Icon'

export interface SourceLineProps {
  children: React.ReactNode
  /** The info icon. Set false for a bare line under a bar. */
  icon?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * Where a number came from.
 *
 * Every figure in Nelp is shown with its source, so a reader can tell what a
 * score or a count is actually made of: "From 143 confirmed jobs and 61
 * different recipients".
 */
export function SourceLine({ children, icon = true, className, style }: SourceLineProps) {
  return (
    <div className={cx('src', className)} style={style}>
      {icon ? <Icon name="info" /> : null}
      <span>{children}</span>
    </div>
  )
}

export interface StatProps {
  /** The figure. */
  value: React.ReactNode
  /** What it counts. */
  label: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

/** A big figure over its label. */
export function Stat({ value, label, className, style }: StatProps) {
  return (
    <div className={cx('stat', className)} style={style}>
      <span className="n">{value}</span>
      <span className="l">{label}</span>
    </div>
  )
}

export interface KeyValueProps {
  items: readonly {
    key: string
    label: React.ReactNode
    value: React.ReactNode
    /** A caption under the label. */
    note?: React.ReactNode
  }[]
  className?: string
  style?: React.CSSProperties
}

/** The label-and-value list used for job and fare details. */
export function KeyValue({ items, className, style }: KeyValueProps) {
  return (
    <dl className={className} style={{ margin: 0, ...style }}>
      {items.map((item) => (
        <div className="kv" key={item.key}>
          <dt>
            {item.label}
            {item.note ? <div className="cap">{item.note}</div> : null}
          </dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
