/**
 * Kenyan mobile numbers, and the one masked shape the product shows.
 *
 * A number is never displayed in full outside the person who owns it:
 * every list, table, SMS log and profile shows `07** *** 481`.
 */

const MASK_DOT = '•'

/** 9 digits after +254, starting 7 (Safaricom/Airtel) or 1 (newer ranges). */
const NATIONAL = /^[71]\d{8}$/

export interface PhoneParse {
  ok: boolean
  /** The 9 national digits, e.g. `712345678`. */
  national: string
  /** `+254712345678`, only when `ok`. */
  e164: string
  error?: string
}

export function digitsOnly(input: string): string {
  return input.replace(/\D/g, '')
}

/**
 * Accepts the shapes people actually type: `0712 345 678`, `712345678`,
 * `+254 712 345 678`, `254712345678`.
 */
export function parsePhone(input: string): PhoneParse {
  const digits = digitsOnly(input)
  let national = digits

  if (national.startsWith('254')) national = national.slice(3)
  else if (national.startsWith('0')) national = national.slice(1)

  const fail = (error: string): PhoneParse => ({
    ok: false,
    national,
    e164: '',
    error,
  })

  if (national.length === 0) return fail('Enter a phone number.')
  if (national.length < 9)
    return fail('That number looks too short. Use 9 digits after +254.')
  if (national.length > 9)
    return fail('That number looks too long. Use 9 digits after +254.')
  if (!NATIONAL.test(national))
    return fail('That does not look like a Kenyan mobile number. It starts with 7 or 1.')

  return { ok: true, national, e164: `+254${national}` }
}

export function isValidPhone(input: string): boolean {
  return parsePhone(input).ok
}

/**
 * The masked form: `07** *** 481`. Keeps the leading `07` and the last three
 * digits, hides the rest. Anything unparseable masks to a safe placeholder
 * rather than leaking the raw input.
 */
export function maskPhone(input: string): string {
  const parsed = parsePhone(input)
  const national = parsed.ok ? parsed.national : digitsOnly(input)
  if (national.length < 9) return `0${MASK_DOT.repeat(2)} ${MASK_DOT.repeat(3)} ${MASK_DOT.repeat(3)}`
  const lead = national.slice(0, 1)
  const last3 = national.slice(-3)
  return `0${lead}${MASK_DOT.repeat(2)} ${MASK_DOT.repeat(3)} ${last3}`
}

/** `712 345 678`, for the field the owner types into. */
export function formatNational(input: string): string {
  const d = digitsOnly(input).slice(0, 12)
  let national = d
  if (national.startsWith('254')) national = national.slice(3)
  else if (national.startsWith('0')) national = national.slice(1)
  national = national.slice(0, 9)
  const parts = [national.slice(0, 3), national.slice(3, 6), national.slice(6, 9)]
  return parts.filter(Boolean).join(' ')
}
