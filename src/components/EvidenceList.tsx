import { cx } from '../lib/cx'
import { Stat } from './SourceLine'

export interface EvidenceRow {
  key: string
  cells: readonly React.ReactNode[]
  /** Greys the row and marks it as not counted. */
  notCounted?: boolean
}

export interface EvidenceListProps {
  headers: readonly string[]
  rows: readonly EvidenceRow[]
  /** The summary line at the foot, e.g. "Showing 6 of 149 jobs". */
  footnote?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * The jobs behind a count.
 *
 * Rows that do not count towards the score are dimmed *and* labelled "not
 * counted" in the row itself, so the distinction does not rest on the
 * background shade.
 */
export function EvidenceList({
  headers,
  rows,
  footnote,
  className,
  style,
}: EvidenceListProps) {
  return (
    <div className={cx('evl', className)} style={style}>
      <div className="ev evh">
        {headers.map((header) => (
          <span key={header}>{header}</span>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row.key} className={cx('ev', row.notCounted && 'nc')}>
          {row.cells.map((cell, index) => (
            <span key={index}>{cell}</span>
          ))}
        </div>
      ))}
      {footnote ? (
        <div className="ev nc">
          <span className="cap" style={{ gridColumn: '1/-1' }}>
            {footnote}
          </span>
        </div>
      ) : null}
    </div>
  )
}

export interface ExpandableProps {
  /** The figure on the summary row. */
  value: React.ReactNode
  /** What the figure counts. */
  label: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
}

/**
 * A count that opens to show the jobs behind it.
 *
 * Built on `details`, so it works before JavaScript runs and the browser
 * handles the open state and its announcement.
 */
export function Expandable({
  value,
  label,
  defaultOpen,
  children,
}: ExpandableProps) {
  return (
    <details className="xp" open={defaultOpen}>
      <summary>
        <Stat value={value} label={label} />
        {/* "Show"/"Hide" comes from CSS; `summary` already announces the state. */}
        <span className="more" aria-hidden="true" />
      </summary>
      {children}
    </details>
  )
}

/** A masked phone number in the evidence tables' monospaced treatment. */
export function MaskedNumber({ children }: { children: React.ReactNode }) {
  return <span className="mk">{children}</span>
}
