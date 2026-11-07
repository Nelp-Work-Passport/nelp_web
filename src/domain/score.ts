import type { Trust } from '../api/types'

/**
 * How the API's trust score is presented.
 *
 * The score itself is computed on the server, from ratings with a prior:
 *
 *     adjusted = (sum of booking ratings + 5 x 3.5) / (rated bookings + 5)
 *     score    = round(adjusted x 20)
 *
 * The prior is why one five-star review does not make a rider a 100: a new
 * rider is pulled towards the middle until there is enough evidence to move
 * them. Below three rated bookings the API withholds the score entirely and
 * sends `null`, which must never be shown as a zero.
 *
 * Nothing in this file recomputes the score. It only decides how to say it.
 */

export type Band = 'new' | 'low' | 'building' | 'strong'

/** The ring and label classes in nelp.css. */
export type BandTone = 'neu' | 'low' | 'build' | 'strong'

export const BAND_LOW_BELOW = 35
export const BAND_STRONG_FROM = 70

/** Fewer rated bookings than this and the API sends no score. */
export const MIN_RATED_BOOKINGS = 3

export function bandFor(trust: Trust): Band {
  if (trust.is_new || trust.trust_score === null) return 'new'
  if (trust.trust_score < BAND_LOW_BELOW) return 'low'
  if (trust.trust_score < BAND_STRONG_FROM) return 'building'
  return 'strong'
}

/**
 * The words for a band.
 *
 * A new rider is not a bad rider, so the words say what is missing rather
 * than implying a verdict.
 */
export function bandLabel(band: Band): string {
  switch (band) {
    case 'new':
      return 'Not enough ratings yet'
    case 'low':
      return 'Low'
    case 'building':
      return 'Building'
    case 'strong':
      return 'Strong'
  }
}

export function bandTone(band: Band): BandTone {
  switch (band) {
    case 'new':
      return 'neu'
    case 'low':
      return 'low'
    case 'building':
      return 'build'
    case 'strong':
      return 'strong'
  }
}

/**
 * The line under a score saying what it is made of.
 *
 * Every number in Nelp is shown with its source. For a rider with no score
 * that means saying how many more ratings it takes, not leaving a blank.
 */
export function trustSource(trust: Trust): string {
  if (trust.is_new || trust.trust_score === null) {
    const needed = MIN_RATED_BOOKINGS - trust.rated_bookings
    if (needed > 0) {
      return `From ${ratingsWord(trust.rated_bookings)}. A score shows after ${MIN_RATED_BOOKINGS}.`
    }
    return `From ${ratingsWord(trust.rated_bookings)}.`
  }
  const parts = [
    `From ${ratingsWord(trust.rated_bookings)}`,
    `${trust.completed_deliveries} completed ${trust.completed_deliveries === 1 ? 'delivery' : 'deliveries'}`,
  ]
  if (trust.average_stars !== null) {
    parts.push(`averaging ${trust.average_stars.toFixed(1)} stars`)
  }
  return `${parts.join(', ')}.`
}

export function ratingsWord(count: number): string {
  return `${count} ${count === 1 ? 'rating' : 'ratings'}`
}

/** `{ punctual: 20 }` to `20 said punctual`, highest first. */
export function tagSummary(
  tagCounts: Partial<Record<string, number>>,
): { tag: string; label: string; count: number }[] {
  const labels: Record<string, string> = {
    punctual: 'punctual',
    careful: 'careful',
    communicative: 'good at communicating',
  }
  return Object.entries(tagCounts)
    .filter((entry): entry is [string, number] => Boolean(entry[1]))
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({
      tag,
      count,
      label: labels[tag] ?? tag.replace(/_/g, ' '),
    }))
}
