import { describe, expect, it } from 'vitest'
import { formatEffect, formatKes, parseKes } from './money'

describe('formatKes', () => {
  it('matches the amounts shown in the design', () => {
    expect(formatKes(350)).toBe('KES 350')
    expect(formatKes(390)).toBe('KES 390')
    expect(formatKes(1240)).toBe('KES 1,240')
    expect(formatKes(4500)).toBe('KES 4,500')
    expect(formatKes(20000)).toBe('KES 20,000')
    expect(formatKes(0)).toBe('KES 0')
  })

  it('uses a true minus sign for a negative balance', () => {
    expect(formatKes(-35)).toBe('− KES 35')
    expect(formatKes(-120)).toBe('− KES 120')
  })

  it('never shows decimals', () => {
    expect(formatKes(349.6)).toBe('KES 350')
  })
})

describe('formatEffect', () => {
  it('shows the direction of a balance entry', () => {
    expect(formatEffect(630)).toBe('+ KES 630')
    expect(formatEffect(315)).toBe('+ KES 315')
    expect(formatEffect(-15)).toBe('− KES 15')
    expect(formatEffect(-60)).toBe('− KES 60')
  })
})

describe('parseKes', () => {
  it('reads what a user types into a KES field', () => {
    expect(parseKes('4,500')).toBe(4500)
    expect(parseKes('4500')).toBe(4500)
    expect(parseKes('KES 4 500')).toBe(4500)
    expect(parseKes('')).toBe(0)
    expect(parseKes('abc')).toBe(0)
  })
})
