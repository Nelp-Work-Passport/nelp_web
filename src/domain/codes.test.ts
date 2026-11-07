import { describe, expect, it } from 'vitest'
import {
  checkCode,
  checkPinStrength,
  generateCode,
  isComplete,
  MAX_TRIES,
  sanitizeCode,
} from './codes'

describe('isComplete', () => {
  it('needs exactly the field length, all digits', () => {
    expect(isComplete('4821', 4)).toBe(true)
    expect(isComplete('482', 4)).toBe(false)
    expect(isComplete('48210', 4)).toBe(false)
    expect(isComplete('48a1', 4)).toBe(false)
    expect(isComplete('482913', 6)).toBe(true)
    expect(isComplete('4821', 6)).toBe(false)
  })
})

describe('sanitizeCode', () => {
  it('keeps digits only', () => {
    expect(sanitizeCode('4a8b2c1', 4)).toBe('4821')
  })

  it('truncates a long paste to the field length', () => {
    expect(sanitizeCode('482913', 4)).toBe('4829')
    expect(sanitizeCode('4829137', 6)).toBe('482913')
  })

  it('handles a pasted code with spaces or dashes', () => {
    expect(sanitizeCode('48 21', 4)).toBe('4821')
    expect(sanitizeCode('482-913', 6)).toBe('482913')
  })

  it('returns empty for input with no digits', () => {
    expect(sanitizeCode('abcd', 4)).toBe('')
  })
})

describe('checkCode', () => {
  it('accepts the right code', () => {
    const result = checkCode('4821', '4821', 0)
    expect(result.ok).toBe(true)
    expect(result.locked).toBe(false)
  })

  it('counts down the tries in the design wording', () => {
    expect(checkCode('4819', '4821', 0).error).toBe(
      'That code is not right. You have 2 tries left.',
    )
    expect(checkCode('4819', '4821', 1).error).toBe(
      'That code is not right. You have 1 try left.',
    )
  })

  it('locks on the third wrong try', () => {
    const third = checkCode('4819', '4821', 2)
    expect(third.ok).toBe(false)
    expect(third.locked).toBe(true)
    expect(third.triesLeft).toBe(0)
    expect(third.error).toContain('locked')
  })

  it('stays locked once used up, even with the right code', () => {
    const result = checkCode('4821', '4821', MAX_TRIES)
    expect(result.ok).toBe(false)
    expect(result.locked).toBe(true)
  })

  it('honours a custom try budget', () => {
    expect(checkCode('0000', '4821', 0, 1).locked).toBe(true)
  })
})

describe('checkPinStrength', () => {
  it('accepts a 4 to 6 digit PIN that is not a pattern', () => {
    expect(checkPinStrength('4821')).toBeNull()
    expect(checkPinStrength('48210')).toBeNull()
    expect(checkPinStrength('482107')).toBeNull()
  })

  it('rejects the wrong length or non-digits', () => {
    expect(checkPinStrength('482')).toBe('Use 4 to 6 digits.')
    expect(checkPinStrength('4821079')).toBe('Use 4 to 6 digits.')
    expect(checkPinStrength('48a1')).toBe('Use 4 to 6 digits.')
  })

  it('rejects runs and repeats with the design wording', () => {
    const tooEasy =
      'That PIN is too easy to guess. Use 4 to 6 digits that are not in a row.'
    expect(checkPinStrength('1234')).toBe(tooEasy)
    expect(checkPinStrength('4321')).toBe(tooEasy)
    expect(checkPinStrength('1111')).toBe(tooEasy)
    expect(checkPinStrength('123456')).toBe(tooEasy)
  })
})

describe('generateCode', () => {
  it('is deterministic with a seed, so the demo codes are stable', () => {
    expect(generateCode(4, 4821)).toBe('4821')
    expect(generateCode(4, 7390)).toBe('7390')
    expect(generateCode(6, 482913)).toBe('482913')
  })

  it('pads a short seed to the field length', () => {
    expect(generateCode(4, 7)).toBe('0007')
  })

  it('produces a code of the right shape without a seed', () => {
    expect(generateCode(4)).toMatch(/^\d{4}$/)
    expect(generateCode(6)).toMatch(/^\d{6}$/)
  })
})
