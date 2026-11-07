import { cx } from '../lib/cx'
import type { Trust } from '../api/types'
import { bandFor, bandLabel, bandTone, type Band } from '../domain/score'

export interface ScoreRingProps {
  /** 0 to 100, or null when the API withholds a score for a new rider. */
  score: number | null
  band: Band
  /** Diameter in pixels. The design uses 64 to 168. */
  size?: number
  className?: string
}

/**
 * The conic-gradient score ring.
 *
 * `--p` is the fill percentage and `--s` the diameter, both read by
 * nelp.css. Note that `--p` is also the primary brand colour on `:root`;
 * `.ring` shadows it on itself, so nothing inside a ring may read
 * `var(--p)` as a colour.
 *
 * A withheld score shows a dash on an empty ring, never a zero: a new rider
 * drawn at 0 would read as a terrible one.
 */
export function ScoreRing({ score, band, size = 88, className }: ScoreRingProps) {
  const tone = bandTone(band)
  return (
    <div
      className={cx('ring', tone, className)}
      style={{ '--p': score ?? 0, '--s': `${size}px` } as React.CSSProperties}
      role="img"
      aria-label={
        score === null
          ? bandLabel(band)
          : `Trust score ${score} out of 100, ${bandLabel(band)}`
      }
    >
      <b aria-hidden="true">{score === null ? '—' : score}</b>
    </div>
  )
}

export interface TrustRingProps {
  trust: Trust
  size?: number
  /** A line under the band label. */
  note?: React.ReactNode
  bandFontSize?: number
  className?: string
}

/**
 * The ring with the API's own headline under it.
 *
 * `trust.label` is used as written — "89 · 20 ratings" or "New · 1 rating" —
 * because it already carries the count the score rests on.
 */
export function TrustRing({
  trust,
  size,
  note,
  bandFontSize,
  className,
}: TrustRingProps) {
  const band = bandFor(trust)
  return (
    <div className={cx('scorebox', className)}>
      <ScoreRing score={trust.trust_score} band={band} size={size} />
      <span
        className={cx('band', bandTone(band))}
        style={bandFontSize ? { fontSize: bandFontSize } : undefined}
      >
        {trust.label}
      </span>
      {note ? <span className="cap">{note}</span> : null}
    </div>
  )
}

export interface ScoreBoxProps {
  score: number | null
  band: Band
  size?: number
  note?: React.ReactNode
  bandFontSize?: number
  className?: string
}

/** Ring, band words and an optional note, stacked. */
export function ScoreBox({
  score,
  band,
  size,
  note,
  bandFontSize,
  className,
}: ScoreBoxProps) {
  return (
    <div className={cx('scorebox', className)}>
      <ScoreRing score={score} band={band} size={size} />
      <span
        className={cx('band', bandTone(band))}
        style={bandFontSize ? { fontSize: bandFontSize } : undefined}
      >
        {bandLabel(band)}
      </span>
      {note ? <span className="cap">{note}</span> : null}
    </div>
  )
}
