/**
 * The codes that act as credentials. A link alone is never enough: a
 * recipient needs the 4-digit receipt code, a sender needs the 4-digit
 * rating code, a rider needs their PIN, a sender signs in with a 6-digit
 * SMS code.
 */

export type CodeLength = 4 | 6

export interface CodeCheck {
  ok: boolean
  /** Tries remaining after this attempt. Zero means locked. */
  triesLeft: number
  locked: boolean
  error?: string
}

export const MAX_TRIES = 3

export function isComplete(value: string, length: CodeLength): boolean {
  return new RegExp(`^\\d{${length}}$`).test(value)
}

/** Digits only, never longer than the field. Used for typing and pasting. */
export function sanitizeCode(input: string, length: CodeLength): string {
  return input.replace(/\D/g, '').slice(0, length)
}

/**
 * Checks an attempt and reports how many tries are left, so the caller can
 * show "You have 2 tries left" without tracking the arithmetic itself.
 */
export function checkCode(
  entered: string,
  expected: string,
  attemptsUsed: number,
  maxTries: number = MAX_TRIES,
): CodeCheck {
  if (attemptsUsed >= maxTries) {
    return { ok: false, triesLeft: 0, locked: true, error: lockedMessage() }
  }
  if (entered === expected) {
    return { ok: true, triesLeft: maxTries - attemptsUsed, locked: false }
  }
  const triesLeft = maxTries - attemptsUsed - 1
  if (triesLeft <= 0) {
    return { ok: false, triesLeft: 0, locked: true, error: lockedMessage() }
  }
  return {
    ok: false,
    triesLeft,
    locked: false,
    error: `That code is not right. You have ${triesLeft} ${
      triesLeft === 1 ? 'try' : 'tries'
    } left.`,
  }
}

function lockedMessage(): string {
  return 'This link is locked. You entered a wrong code 3 times. Ask the sender to send you a new link.'
}

/** PINs are 4 to 6 digits and must not be a run or all the same digit. */
export function checkPinStrength(pin: string): string | null {
  if (!/^\d{4,6}$/.test(pin)) return 'Use 4 to 6 digits.'
  if (isSequential(pin) || allSame(pin))
    return 'That PIN is too easy to guess. Use 4 to 6 digits that are not in a row.'
  return null
}

function isSequential(pin: string): boolean {
  let up = true
  let down = true
  for (let i = 1; i < pin.length; i++) {
    const step = pin.charCodeAt(i) - pin.charCodeAt(i - 1)
    if (step !== 1) up = false
    if (step !== -1) down = false
  }
  return up || down
}

function allSame(pin: string): boolean {
  return new Set(pin).size === 1
}

/** Deterministic in the demo so the SMS inbox always shows 4821 and 7390. */
export function generateCode(length: CodeLength, seed?: number): string {
  if (seed === undefined) {
    let out = ''
    for (let i = 0; i < length; i++) out += Math.floor(Math.random() * 10)
    return out
  }
  return String(seed % 10 ** length).padStart(length, '0')
}
