import type { Band, BandTone, Score, ScoreEvidence, ScoreParts } from './types'

/** Each part's ceiling. They sum to 100. */
export const MAX_VARIETY = 45
export const MAX_SPREAD = 35
export const MAX_REPEAT = 20

/** Below this many confirmed jobs a rider has no score, only a reason. */
export const MIN_JOBS_FOR_SCORE = 5

export const BAND_FLAGGED_BELOW = 35
export const BAND_STRONG_FROM = 70

/** A score of 70 or more plus a verified ID makes a rider Assured. */
export const ASSURED_FROM = 70

export function totalOf(parts: ScoreParts): number {
  return parts.variety + parts.spread + parts.repeat
}

/**
 * Bands: Flagged below 35, Building 35 to 69, Strong 70 and up.
 * Fewer than 5 confirmed jobs is not a bad sign, so it gets its own band
 * rather than a low score.
 */
export function bandFor(total: number, confirmedJobs: number): Band {
  if (confirmedJobs < MIN_JOBS_FOR_SCORE) return 'none'
  if (total < BAND_FLAGGED_BELOW) return 'flagged'
  if (total < BAND_STRONG_FROM) return 'building'
  return 'strong'
}

export function bandLabel(band: Band): string {
  switch (band) {
    case 'none':
      return 'Not enough evidence yet'
    case 'flagged':
      return 'Flagged, under review'
    case 'building':
      return 'Building'
    case 'strong':
      return 'Strong'
  }
}

/** Maps a band onto the ring and label classes in nelp.css. */
export function bandTone(band: Band): BandTone {
  switch (band) {
    case 'none':
      return 'neu'
    case 'flagged':
      return 'low'
    case 'building':
      return 'build'
    case 'strong':
      return 'strong'
  }
}

export function makeScore(parts: ScoreParts, evidence: ScoreEvidence): Score {
  const total = totalOf(parts)
  return { total, band: bandFor(total, evidence.confirmedJobs), parts, evidence }
}

/** Percentage a breakdown bar should fill, for `width: x%`. */
export function partPercent(value: number, max: number): number {
  if (max <= 0) return 0
  return clamp((value / max) * 100, 0, 100)
}

export const partMaximums: Record<keyof ScoreParts, number> = {
  variety: MAX_VARIETY,
  spread: MAX_SPREAD,
  repeat: MAX_REPEAT,
}

export function isAssured(total: number, verified: boolean): boolean {
  return verified && total >= ASSURED_FROM
}

/**
 * Derives the three parts from evidence.
 *
 * Variety rewards how many *different* people confirmed the work, not how
 * much work there was: the ratio of distinct recipients to jobs is what a
 * padded history cannot fake. Spread rewards weeks worked. Repeat rewards
 * recipients who came back.
 *
 * The demo riders carry their parts explicitly, because they are fixed
 * reference data. This is what a real backend would compute.
 */
export function deriveParts(evidence: ScoreEvidence): ScoreParts {
  const { confirmedJobs, distinctRecipients, activeWeeks, repeatRecipients } =
    evidence
  if (confirmedJobs <= 0) return { variety: 0, spread: 0, repeat: 0 }

  const varietyRatio = distinctRecipients / confirmedJobs
  const variety = Math.round(
    MAX_VARIETY * clamp(varietyRatio / 0.45, 0, 1),
  )
  const spread = Math.round(MAX_SPREAD * clamp(activeWeeks / 36, 0, 1))
  const repeat = Math.round(
    MAX_REPEAT *
      clamp(repeatRecipients / Math.max(distinctRecipients, 1) / 0.5, 0, 1),
  )
  return { variety, spread, repeat }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}
