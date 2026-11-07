import { describe, expect, it } from 'vitest'
import { formatNational, isValidPhone, maskPhone, parsePhone } from './phone'

describe('parsePhone', () => {
  it('accepts the shapes people type', () => {
    for (const input of [
      '712345678',
      '0712345678',
      '0712 345 678',
      '+254712345678',
      '+254 712 345 678',
      '254712345678',
    ]) {
      const parsed = parsePhone(input)
      expect(parsed.ok, input).toBe(true)
      expect(parsed.e164).toBe('+254712345678')
      expect(parsed.national).toBe('712345678')
    }
  })

  it('accepts the newer 1 ranges', () => {
    expect(parsePhone('0110234567').ok).toBe(true)
  })

  it('rejects a short number with the design wording', () => {
    const parsed = parsePhone('712 34')
    expect(parsed.ok).toBe(false)
    expect(parsed.error).toBe(
      'That number looks too short. Use 9 digits after +254.',
    )
  })

  it('rejects a long number', () => {
    expect(parsePhone('7123456789').error).toContain('too long')
  })

  it('rejects a number that does not start 7 or 1', () => {
    expect(parsePhone('312345678').error).toBe(
      'That does not look like a Kenyan mobile number. It starts with 7 or 1.',
    )
  })

  it('rejects empty input', () => {
    expect(parsePhone('').error).toBe('Enter a phone number.')
    expect(parsePhone('   ').ok).toBe(false)
  })
})

describe('maskPhone', () => {
  it('produces the one masked shape the product shows', () => {
    expect(maskPhone('0712345481')).toBe('07•• ••• 481')
  })

  it('masks every accepted input form identically', () => {
    const expected = '07•• ••• 678'
    expect(maskPhone('712345678')).toBe(expected)
    expect(maskPhone('+254712345678')).toBe(expected)
    expect(maskPhone('0712 345 678')).toBe(expected)
  })

  it('keeps the leading digit so a 1-range number is not shown as 07', () => {
    expect(maskPhone('0110234567')).toBe('01•• ••• 567')
  })

  it('never leaks digits from an unparseable number', () => {
    const masked = maskPhone('712 34')
    expect(masked).not.toContain('3')
    expect(masked).not.toContain('4')
    expect(masked).toBe('0•• ••• •••')
  })

  it('reveals only the leading 07 and the last three digits', () => {
    // `07** *** 481` from `0712345481`: the four middle digits never appear.
    expect(maskPhone('0712345481').replace(/\D/g, '')).toBe('07481')
    for (const leaked of ['1234', '2345', '123', '234', '345']) {
      expect(maskPhone('0712345481'), leaked).not.toContain(leaked)
    }
  })
})

describe('formatNational', () => {
  it('groups digits as the field shows them', () => {
    expect(formatNational('712345678')).toBe('712 345 678')
    expect(formatNational('0712345678')).toBe('712 345 678')
    expect(formatNational('+254712345678')).toBe('712 345 678')
  })

  it('formats partial input without padding', () => {
    expect(formatNational('712')).toBe('712')
    expect(formatNational('71234')).toBe('712 34')
    expect(formatNational('')).toBe('')
  })

  it('drops anything past 9 national digits', () => {
    expect(formatNational('71234567899999')).toBe('712 345 678')
  })
})

describe('isValidPhone', () => {
  it('agrees with parsePhone', () => {
    expect(isValidPhone('0712345678')).toBe(true)
    expect(isValidPhone('712 34')).toBe(false)
  })
})
