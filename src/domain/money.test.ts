import { describe, expect, it } from 'vitest'
import {
  formatEffect,
  formatKes,
  formatKesExact,
  parseKesToMinor,
  toMinor,
} from './money'

describe('formatKes', () => {
  it('reads the API minor units the API actually sends', () => {
    expect(formatKes(19000)).toBe('KES 190')
    expect(formatKes(1900)).toBe('KES 19')
    expect(formatKes(17100)).toBe('KES 171')
    expect(formatKes(0)).toBe('KES 0')
  })

  it('groups thousands', () => {
    expect(formatKes(450000)).toBe('KES 4,500')
    expect(formatKes(2000000)).toBe('KES 20,000')
  })

  it('uses a true minus sign for a negative amount', () => {
    expect(formatKes(-1500)).toBe('− KES 15')
  })

  it('never shows decimals', () => {
    expect(formatKes(19050)).toBe('KES 191')
  })
})

describe('formatKesExact', () => {
  it('matches formatKes on whole shillings', () => {
    expect(formatKesExact(19000)).toBe('KES 190')
  })

  it('shows cents only when there are any', () => {
    expect(formatKesExact(19050)).toBe('KES 190.50')
    expect(formatKesExact(-19050)).toBe('− KES 190.50')
  })
})

describe('formatEffect', () => {
  it('shows the direction of a ledger entry', () => {
    expect(formatEffect(17100)).toBe('+ KES 171')
    expect(formatEffect(-1900)).toBe('− KES 19')
  })
})

describe('parseKesToMinor', () => {
  it('turns what a person types into minor units', () => {
    expect(parseKesToMinor('190')).toBe(19000)
    expect(parseKesToMinor('4,500')).toBe(450000)
    expect(parseKesToMinor('KES 190')).toBe(19000)
    expect(parseKesToMinor('190.50')).toBe(19050)
  })

  it('reads an empty or junk field as nothing', () => {
    expect(parseKesToMinor('')).toBe(0)
    expect(parseKesToMinor('abc')).toBe(0)
  })
})

describe('toMinor', () => {
  it('converts major units without floating-point drift', () => {
    expect(toMinor(190)).toBe(19000)
    expect(toMinor(190.1)).toBe(19010)
  })
})
