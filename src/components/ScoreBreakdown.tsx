import type { ScoreParts } from '../domain/types'
import { partMaximums, partPercent } from '../domain/score'
import { SourceLine } from './SourceLine'

export interface BreakdownRowProps {
  label: React.ReactNode
  value: number
  max: number
  /** The sentence under the bar explaining where the number came from. */
  source?: React.ReactNode
  /** Renders the label as plain text rather than bold. */
  plain?: boolean
}

/**
 * One part of the score as a bar with its value over its ceiling.
 *
 * The bar is decorative: the `x / 45` text beside it is the real value, so
 * the number never depends on reading a bar's length or colour.
 */
export function BreakdownRow({ label, value, max, source, plain }: BreakdownRowProps) {
  const row = (
    <div className="bk">
      {plain ? <span>{label}</span> : <b>{label}</b>}
      <div className="bar" aria-hidden="true">
        <i style={{ width: `${partPercent(value, max)}%` }} />
      </div>
      <span className="v">
        {value} / {max}
      </span>
    </div>
  )

  if (!source) return row

  return (
    <div className="col" style={{ gap: 6 }}>
      {row}
      <SourceLine icon={false}>{source}</SourceLine>
    </div>
  )
}

export interface ScoreBreakdownProps {
  parts: ScoreParts
  /** A sentence per part saying what the number is built from. */
  sources?: Partial<Record<keyof ScoreParts, React.ReactNode>>
  plain?: boolean
}

const labels: Record<keyof ScoreParts, string> = {
  variety: 'Recipient variety',
  spread: 'Time spread',
  repeat: 'Repeat recipients',
}

const order: (keyof ScoreParts)[] = ['variety', 'spread', 'repeat']

/** The three parts of a trust score, each with its own ceiling. */
export function ScoreBreakdown({ parts, sources, plain }: ScoreBreakdownProps) {
  return (
    <>
      {order.map((key) => (
        <BreakdownRow
          key={key}
          label={labels[key]}
          value={parts[key]}
          max={partMaximums[key]}
          source={sources?.[key]}
          plain={plain}
        />
      ))}
    </>
  )
}
