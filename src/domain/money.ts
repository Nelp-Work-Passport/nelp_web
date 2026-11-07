/** Currency is always KES, always grouped, never with decimals. */

export function formatKes(amount: number): string {
  const sign = amount < 0 ? '− ' : ''
  const whole = Math.round(Math.abs(amount))
  return `${sign}KES ${whole.toLocaleString('en-KE')}`
}

/** A balance entry's effect, with its own sign and direction. */
export function formatEffect(amount: number): string {
  const whole = Math.round(Math.abs(amount))
  const sign = amount < 0 ? '−' : '+'
  return `${sign} KES ${whole.toLocaleString('en-KE')}`
}

export function parseKes(input: string): number {
  const digits = input.replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}
