/**
 * Currency is always KES.
 *
 * The API sends money in **integer minor units**: `19000` means KES 190.00.
 * Nothing here takes a major-unit number, so a field ending `_minor` cannot
 * be rendered a hundred times too small by accident.
 */

const MINOR_PER_MAJOR = 100

/** `19000` to `KES 190`. Whole shillings, grouped, no decimals. */
export function formatKes(minor: number): string {
  const sign = minor < 0 ? '− ' : ''
  const major = Math.round(Math.abs(minor) / MINOR_PER_MAJOR)
  return `${sign}KES ${major.toLocaleString('en-KE')}`
}

/** The same, with cents when a value is not a whole number of shillings. */
export function formatKesExact(minor: number): string {
  const sign = minor < 0 ? '− ' : ''
  const abs = Math.abs(minor)
  if (abs % MINOR_PER_MAJOR === 0) return formatKes(minor)
  return `${sign}KES ${(abs / MINOR_PER_MAJOR).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** A balance entry's direction, for the rider's ledger. */
export function formatEffect(minor: number): string {
  const sign = minor < 0 ? '−' : '+'
  const major = Math.round(Math.abs(minor) / MINOR_PER_MAJOR)
  return `${sign} KES ${major.toLocaleString('en-KE')}`
}

/** Reads a KES field a person typed, and returns minor units. */
export function parseKesToMinor(input: string): number {
  const cleaned = input.replace(/[^\d.]/g, '')
  if (!cleaned) return 0
  return Math.round(Number(cleaned) * MINOR_PER_MAJOR)
}

export function toMinor(major: number): number {
  return Math.round(major * MINOR_PER_MAJOR)
}
