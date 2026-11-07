import { describe, expect, it } from 'vitest'
import {
  countdownLabel,
  formatCountdown,
  formatShortCountdown,
  remainingFrom,
  RIDER_ACCEPT_MS,
  shouldAnnounce,
} from './countdown'

const at = (ms: number) => remainingFrom(ms, 0)

describe('remainingFrom', () => {
  it('splits the remaining time into minutes and seconds', () => {
    const r = at(7 * 60_000 + 42_000)
    expect(r.minutes).toBe(7)
    expect(r.seconds).toBe(42)
    expect(r.expired).toBe(false)
  })

  it('never goes negative once the deadline passes', () => {
    const r = remainingFrom(1_000, 9_000)
    expect(r.totalMs).toBe(0)
    expect(r.minutes).toBe(0)
    expect(r.seconds).toBe(0)
    expect(r.expired).toBe(true)
  })

  it('is expired exactly at the deadline', () => {
    expect(remainingFrom(1_000, 1_000).expired).toBe(true)
  })

  it('rounds up, so a part-second still reads as a second left', () => {
    expect(at(1).seconds).toBe(1)
    expect(at(1).expired).toBe(false)
  })

  it('starts a rider invitation at ten minutes', () => {
    expect(formatCountdown(at(RIDER_ACCEPT_MS))).toBe('10:00')
  })
})

describe('formatCountdown', () => {
  it('pads to the shape the design shows', () => {
    expect(formatCountdown(at(7 * 60_000 + 42_000))).toBe('07:42')
    expect(formatCountdown(at(8 * 60_000 + 12_000))).toBe('08:12')
    expect(formatCountdown(at(60_000 + 28_000))).toBe('01:28')
    expect(formatCountdown(at(9_000))).toBe('00:09')
    expect(formatCountdown(at(0))).toBe('00:00')
  })
})

describe('formatShortCountdown', () => {
  it('leaves the minutes unpadded for inline use', () => {
    expect(formatShortCountdown(at(42_000))).toBe('0:42')
    expect(formatShortCountdown(at(14 * 60_000 + 32_000))).toBe('14:32')
  })
})

describe('countdownLabel', () => {
  it('speaks words rather than digits', () => {
    expect(countdownLabel(at(7 * 60_000 + 42_000))).toBe(
      '7 minutes 42 seconds left',
    )
    expect(countdownLabel(at(60_000 + 28_000))).toBe('1 minute 28 seconds left')
  })

  it('uses the singular for one second', () => {
    expect(countdownLabel(at(1_000))).toBe('1 second left')
  })

  it('drops a zero part instead of saying "0 seconds"', () => {
    expect(countdownLabel(at(120_000))).toBe('2 minutes left')
  })

  it('says time is up at zero', () => {
    expect(countdownLabel(at(0))).toBe('Time is up')
  })
})

describe('shouldAnnounce', () => {
  it('does not announce every second', () => {
    expect(shouldAnnounce(at(7 * 60_000 + 42_000))).toBe(false)
    expect(shouldAnnounce(at(7 * 60_000 + 17_000))).toBe(false)
  })

  it('announces each minute and half minute', () => {
    expect(shouldAnnounce(at(7 * 60_000))).toBe(true)
    expect(shouldAnnounce(at(7 * 60_000 + 30_000))).toBe(true)
  })

  it('announces every one of the last five seconds', () => {
    for (const ms of [5_000, 4_000, 3_000, 2_000, 1_000]) {
      expect(shouldAnnounce(at(ms)), `${ms}ms`).toBe(true)
    }
  })

  it('announces when time is up', () => {
    expect(shouldAnnounce(at(0))).toBe(true)
  })
})
