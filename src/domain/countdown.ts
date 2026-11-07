/**
 * Countdowns. A rider has 10 minutes to answer a job; an M-Pesa prompt
 * expires; a resend-code timer ticks down. All of them are the same shape:
 * remaining milliseconds rendered as `M:SS` or `MM:SS`, announced politely.
 */

export const RIDER_ACCEPT_MS = 10 * 60 * 1000
export const MPESA_PROMPT_MS = 2 * 60 * 1000
export const RESEND_CODE_MS = 60 * 1000

export interface Remaining {
  totalMs: number
  minutes: number
  seconds: number
  expired: boolean
}

export function remainingFrom(deadline: number, now: number): Remaining {
  const totalMs = Math.max(0, deadline - now)
  const totalSeconds = Math.ceil(totalMs / 1000)
  return {
    totalMs,
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
    expired: totalMs <= 0,
  }
}

/** `07:42`, padded to two minute digits: the big countdown in the design. */
export function formatCountdown(remaining: Remaining): string {
  return `${pad(remaining.minutes)}:${pad(remaining.seconds)}`
}

/** `0:42`, unpadded: the inline "Resend code in 0:42" form. */
export function formatShortCountdown(remaining: Remaining): string {
  return `${remaining.minutes}:${pad(remaining.seconds)}`
}

/**
 * What a screen reader says. Spoken words, not digits, because `07:42`
 * is read as a time of day by some readers.
 */
export function countdownLabel(remaining: Remaining): string {
  if (remaining.expired) return 'Time is up'
  const parts: string[] = []
  if (remaining.minutes > 0)
    parts.push(`${remaining.minutes} ${remaining.minutes === 1 ? 'minute' : 'minutes'}`)
  if (remaining.seconds > 0)
    parts.push(`${remaining.seconds} ${remaining.seconds === 1 ? 'second' : 'seconds'}`)
  return `${parts.join(' ')} left`
}

/**
 * How often a countdown should announce itself. Announcing every second
 * floods a screen reader, so it speaks each 30 seconds and then each of the
 * last five.
 */
export function shouldAnnounce(remaining: Remaining): boolean {
  if (remaining.expired) return true
  if (remaining.totalMs <= 5000) return true
  return remaining.seconds === 0 || remaining.seconds === 30
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}
