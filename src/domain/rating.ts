/**
 * Ratings. Shown next to a trust score but never folded into it: a score
 * counts only jobs a recipient confirmed, while a rating is an opinion.
 */

const words = ['', 'Poor', 'Not great', 'Fine', 'Good', 'Excellent'] as const

/** The word for a star count, for the caption under the stars. */
export function starWord(value: number): string {
  return words[value] ?? ''
}

/** `4.8`, as every rating is shown. */
export function formatRating(value: number): string {
  return value.toFixed(1)
}
