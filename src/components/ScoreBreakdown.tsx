import type { Trust } from '../api/types'
import { tagSummary, trustSource } from '../domain/score'
import { formatDay } from '../lib/dates'
import { SourceLine, Stat } from './SourceLine'

export interface BreakdownRowProps {
  label: React.ReactNode
  value: number
  max: number
  /** The sentence under the bar saying where the number came from. */
  source?: React.ReactNode
  /** What the value is counted in, for the figure beside the bar. */
  unit?: string
  plain?: boolean
}

/**
 * One measure as a bar with its value beside it.
 *
 * The bar is decorative: the figure next to it is the real value, so nothing
 * depends on reading a bar's length.
 */
export function BreakdownRow({
  label,
  value,
  max,
  source,
  unit,
  plain,
}: BreakdownRowProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const row = (
    <div className="bk">
      {plain ? <span>{label}</span> : <b>{label}</b>}
      <div className="bar" aria-hidden="true">
        <i style={{ width: `${percent}%` }} />
      </div>
      <span className="v">{unit ? `${value} ${unit}` : `${value} / ${max}`}</span>
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

export interface TrustEvidenceProps {
  trust: Trust
  /** The API's written explanation of the score, when it has been fetched. */
  explanation?: string
}

/**
 * What a trust score is actually made of.
 *
 * The API computes the score from ratings, so this shows the counts behind
 * it rather than inventing a breakdown: how many ratings, how many
 * deliveries, the star average, how recent the feedback is, and what people
 * said. Every figure here is a field the API sent.
 */
export function TrustEvidence({ trust, explanation }: TrustEvidenceProps) {
  const tags = tagSummary(trust.tag_counts)

  return (
    <div className="col" style={{ gap: 20 }}>
      <div
        className="cards"
        style={{
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(140px,100%),1fr))',
          gap: 16,
        }}
      >
        <Stat
          value={trust.trust_score ?? '—'}
          label="Trust score out of 100"
        />
        <Stat value={trust.rated_bookings} label="Rated deliveries" />
        <Stat value={trust.completed_deliveries} label="Completed deliveries" />
        <Stat
          value={
            trust.average_stars === null ? (
              '—'
            ) : (
              <>
                {trust.average_stars.toFixed(1)}{' '}
                <span style={{ color: '#B87500' }}>{'★'}</span>
              </>
            )
          }
          label="Average stars"
        />
      </div>

      <SourceLine>{trustSource(trust)}</SourceLine>

      {explanation ? (
        <div className="statebox col" style={{ gap: 6 }}>
          <div className="b">How this score is worked out</div>
          <p className="muted">{explanation}</p>
        </div>
      ) : null}

      {tags.length > 0 ? (
        <div className="col" style={{ gap: 10 }}>
          <div className="lab">What people said</div>
          {tags.map((tag) => (
            <BreakdownRow
              key={tag.tag}
              label={tag.label}
              value={tag.count}
              max={Math.max(trust.rated_bookings, tag.count)}
              unit={`of ${trust.rated_bookings}`}
              plain
            />
          ))}
        </div>
      ) : null}

      <div className="col" style={{ gap: 6 }}>
        <BreakdownRow
          label="Ratings in the last 30 days"
          value={trust.ratings_last_30_days}
          max={Math.max(trust.rated_bookings, trust.ratings_last_30_days, 1)}
          unit={`of ${trust.rated_bookings}`}
          plain
        />
        {trust.last_rated_at ? (
          <SourceLine icon={false}>
            Last rated {formatDay(trust.last_rated_at)}. Recent feedback counts
            the same as older feedback, but it shows the rider is still working.
          </SourceLine>
        ) : (
          <SourceLine icon={false}>
            No ratings yet, so there is nothing to date.
          </SourceLine>
        )}
      </div>
    </div>
  )
}
