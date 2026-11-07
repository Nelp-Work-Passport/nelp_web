import { describe, expect, it } from 'vitest'
import {
  ASSURED_FROM,
  bandFor,
  bandLabel,
  bandTone,
  isAssured,
  MIN_JOBS_FOR_SCORE,
  makeScore,
  partPercent,
  totalOf,
} from './score'

describe('totalOf', () => {
  it('sums the three parts', () => {
    expect(totalOf({ variety: 40, spread: 30, repeat: 18 })).toBe(88)
  })

  it('caps out at 100 when every part is maxed', () => {
    expect(totalOf({ variety: 45, spread: 35, repeat: 20 })).toBe(100)
  })
})

describe('bandFor', () => {
  const jobs = 50

  it('is Flagged below 35', () => {
    expect(bandFor(0, jobs)).toBe('flagged')
    expect(bandFor(34, jobs)).toBe('flagged')
  })

  it('is Building from 35 to 69', () => {
    expect(bandFor(35, jobs)).toBe('building')
    expect(bandFor(55, jobs)).toBe('building')
    expect(bandFor(69, jobs)).toBe('building')
  })

  it('is Strong from 70 up', () => {
    expect(bandFor(70, jobs)).toBe('strong')
    expect(bandFor(88, jobs)).toBe('strong')
    expect(bandFor(100, jobs)).toBe('strong')
  })

  it('has no band below the evidence threshold, however high the total', () => {
    expect(bandFor(88, MIN_JOBS_FOR_SCORE - 1)).toBe('none')
    expect(bandFor(0, 0)).toBe('none')
  })

  it('starts banding exactly at the threshold', () => {
    expect(bandFor(40, MIN_JOBS_FOR_SCORE)).toBe('building')
  })
})

describe('bandLabel and bandTone', () => {
  it('names each band the way the design does', () => {
    expect(bandLabel('none')).toBe('Not enough evidence yet')
    expect(bandLabel('flagged')).toBe('Flagged, under review')
    expect(bandLabel('building')).toBe('Building')
    expect(bandLabel('strong')).toBe('Strong')
  })

  it('maps bands onto the nelp.css ring classes', () => {
    expect(bandTone('none')).toBe('neu')
    expect(bandTone('flagged')).toBe('low')
    expect(bandTone('building')).toBe('build')
    expect(bandTone('strong')).toBe('strong')
  })
})

describe('the four demo riders reproduce exactly', () => {
  it('Amina K. scores 88, Strong', () => {
    const score = makeScore(
      { variety: 40, spread: 30, repeat: 18 },
      {
        confirmedJobs: 143,
        distinctRecipients: 61,
        activeWeeks: 34,
        repeatRecipients: 27,
      },
    )
    expect(score.total).toBe(88)
    expect(score.band).toBe('strong')
  })

  it('Wanjiru M. scores 76, Strong', () => {
    const score = makeScore(
      { variety: 36, spread: 26, repeat: 14 },
      {
        confirmedJobs: 88,
        distinctRecipients: 41,
        activeWeeks: 22,
        repeatRecipients: 15,
      },
    )
    expect(score.total).toBe(76)
    expect(score.band).toBe('strong')
  })

  it('Brian O. scores 55, Building', () => {
    const score = makeScore(
      { variety: 24, spread: 19, repeat: 12 },
      {
        confirmedJobs: 31,
        distinctRecipients: 12,
        activeWeeks: 11,
        repeatRecipients: 6,
      },
    )
    expect(score.total).toBe(55)
    expect(score.band).toBe('building')
  })

  it('Samuel K., the fake, scores 13 and is Flagged despite 200 jobs', () => {
    const score = makeScore(
      { variety: 2, spread: 9, repeat: 2 },
      {
        confirmedJobs: 200,
        distinctRecipients: 3,
        activeWeeks: 1,
        repeatRecipients: 3,
      },
    )
    expect(score.total).toBe(13)
    expect(score.band).toBe('flagged')
  })

  it('ranks the genuine rider above the fake one despite far fewer jobs', () => {
    const amina = makeScore(
      { variety: 40, spread: 30, repeat: 18 },
      {
        confirmedJobs: 143,
        distinctRecipients: 61,
        activeWeeks: 34,
        repeatRecipients: 27,
      },
    )
    const samuel = makeScore(
      { variety: 2, spread: 9, repeat: 2 },
      {
        confirmedJobs: 200,
        distinctRecipients: 3,
        activeWeeks: 1,
        repeatRecipients: 3,
      },
    )
    expect(samuel.evidence.confirmedJobs).toBeGreaterThan(
      amina.evidence.confirmedJobs,
    )
    expect(amina.total).toBeGreaterThan(samuel.total)
  })
})

describe('partPercent', () => {
  it('matches the bar widths in the design', () => {
    expect(partPercent(40, 45)).toBeCloseTo(88.9, 1)
    expect(partPercent(30, 35)).toBeCloseTo(85.7, 1)
    expect(partPercent(18, 20)).toBeCloseTo(90, 1)
    expect(partPercent(2, 45)).toBeCloseTo(4.4, 1)
    expect(partPercent(9, 35)).toBeCloseTo(25.7, 1)
    expect(partPercent(2, 20)).toBeCloseTo(10, 1)
    expect(partPercent(24, 45)).toBeCloseTo(53.3, 1)
  })

  it('clamps and never divides by zero', () => {
    expect(partPercent(0, 45)).toBe(0)
    expect(partPercent(99, 45)).toBe(100)
    expect(partPercent(5, 0)).toBe(0)
  })
})

describe('isAssured', () => {
  it('needs both a verified ID and a score of 70 or more', () => {
    expect(isAssured(88, true)).toBe(true)
    expect(isAssured(ASSURED_FROM, true)).toBe(true)
    expect(isAssured(69, true)).toBe(false)
    expect(isAssured(88, false)).toBe(false)
  })
})
