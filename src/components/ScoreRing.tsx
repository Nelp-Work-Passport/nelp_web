import { cx } from '../lib/cx'
import type { Band } from '../domain/types'
import { bandLabel, bandTone } from '../domain/score'

export interface ScoreRingProps {
  /** 0 to 100, or null when there is not enough evidence for a score. */
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
 */
export function ScoreRing({ score, band, size = 88, className }: ScoreRingProps) {
  const tone = bandTone(band)
  const percent = score ?? 0
  return (
    <div
      className={cx('ring', tone, className)}
      style={{ '--p': percent, '--s': `${size}px` } as React.CSSProperties}
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

export interface ScoreBoxProps {
  score: number | null
  band: Band
  size?: number
  /** A line under the band, e.g. "From 143 confirmed jobs". */
  note?: React.ReactNode
  /** Enlarges the band label, as the bigger rings in the design do. */
  bandFontSize?: number
  className?: string
}

/** Ring, band label and an optional note, stacked. */
export function ScoreBox({
  score,
  band,
  size,
  note,
  bandFontSize,
  className,
}: ScoreBoxProps) {
  const tone = bandTone(band)
  return (
    <div className={cx('scorebox', className)}>
      <ScoreRing score={score} band={band} size={size} />
      <span
        className={cx('band', band === 'flagged' ? 'flag' : tone)}
        style={bandFontSize ? { fontSize: bandFontSize } : undefined}
      >
        {bandLabel(band)}
      </span>
      {note ? <span className="cap">{note}</span> : null}
    </div>
  )
}
