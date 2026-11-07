import { describe, expect, it } from 'vitest'
import type { Trust } from '../api/types'
import {
  BAND_LOW_BELOW,
  BAND_STRONG_FROM,
  bandFor,
  bandLabel,
  bandTone,
  ratingsWord,
  tagSummary,
  trustSource,
} from './score'

function trust(over: Partial<Trust> = {}): Trust {
  return {
    label: '89 · 20 ratings',
    is_new: false,
    trust_score: 89,
    average_stars: 4.7,
    adjusted_rating: 4.46,
    rated_bookings: 20,
    completed_deliveries: 20,
    last_rated_at: '2026-11-05T16:09:48Z',
    ratings_last_30_days: 4,
    tag_counts: { punctual: 20 },
    ...over,
  }
}

describe('bandFor', () => {
  it('reads the seeded demo riders as the API scores them', () => {
    expect(bandFor(trust({ trust_score: 89 }))).toBe('strong')
    expect(bandFor(trust({ trust_score: 83 }))).toBe('strong')
    expect(bandFor(trust({ trust_score: 75 }))).toBe('strong')
  })

  it('bands on the score, not on the star average', () => {
    expect(bandFor(trust({ trust_score: BAND_LOW_BELOW - 1 }))).toBe('low')
    expect(bandFor(trust({ trust_score: BAND_LOW_BELOW }))).toBe('building')
    expect(bandFor(trust({ trust_score: BAND_STRONG_FROM - 1 }))).toBe('building')
    expect(bandFor(trust({ trust_score: BAND_STRONG_FROM }))).toBe('strong')
  })

  it('treats a new rider as new, never as zero', () => {
    const fresh = trust({ is_new: true, trust_score: null, average_stars: null })
    expect(bandFor(fresh)).toBe('new')
    expect(bandTone(bandFor(fresh))).toBe('neu')
  })

  it('is new whenever the score is withheld, whatever the flag says', () => {
    expect(bandFor(trust({ trust_score: null }))).toBe('new')
  })
})

describe('bandLabel', () => {
  it('does not call a new rider bad', () => {
    expect(bandLabel('new')).toBe('Not enough ratings yet')
  })

  it('names the other bands plainly', () => {
    expect(bandLabel('low')).toBe('Low')
    expect(bandLabel('building')).toBe('Building')
    expect(bandLabel('strong')).toBe('Strong')
  })
})

describe('trustSource', () => {
  it('says what a score is built from', () => {
    expect(trustSource(trust())).toBe(
      'From 20 ratings, 20 completed deliveries, averaging 4.7 stars.',
    )
  })

  it('says how many more ratings a new rider needs', () => {
    const fresh = trust({
      is_new: true,
      trust_score: null,
      average_stars: null,
      rated_bookings: 1,
    })
    expect(trustSource(fresh)).toBe('From 1 rating. A score shows after 3.')
  })

  it('handles a rider with no ratings at all', () => {
    const none = trust({
      is_new: true,
      trust_score: null,
      average_stars: null,
      rated_bookings: 0,
    })
    expect(trustSource(none)).toBe('From 0 ratings. A score shows after 3.')
  })

  it('omits the star average when the API withholds it', () => {
    expect(trustSource(trust({ average_stars: null }))).toBe(
      'From 20 ratings, 20 completed deliveries.',
    )
  })

  it('uses the singular for one delivery', () => {
    expect(trustSource(trust({ completed_deliveries: 1 }))).toContain(
      '1 completed delivery',
    )
  })
})

describe('ratingsWord', () => {
  it('matches the API label wording', () => {
    expect(ratingsWord(1)).toBe('1 rating')
    expect(ratingsWord(0)).toBe('0 ratings')
    expect(ratingsWord(20)).toBe('20 ratings')
  })
})

describe('tagSummary', () => {
  it('orders tags by how many people said them', () => {
    expect(tagSummary({ careful: 1, punctual: 21 })).toEqual([
      { tag: 'punctual', count: 21, label: 'punctual' },
      { tag: 'careful', count: 1, label: 'careful' },
    ])
  })

  it('spells out the communicative tag', () => {
    expect(tagSummary({ communicative: 3 })[0].label).toBe(
      'good at communicating',
    )
  })

  it('drops empty counts and survives an unknown tag', () => {
    expect(tagSummary({ punctual: 0 })).toEqual([])
    expect(tagSummary({ very_fast: 2 })[0].label).toBe('very fast')
  })
})
