import type { RiderListItem } from '../api/types'

/** The area to name in a list row: where they are now, else where they work. */
export function areaNames(rider: RiderListItem): string {
  if (rider.current_area) return rider.current_area.name
  const names = rider.service_areas.map((area) => area.name)
  if (names.length === 0) return 'No areas set'
  if (names.length <= 2) return names.join(' and ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2}`
}

/**
 * Spreads the avatar palettes across riders so a list is not one colour.
 * Derived from the id, so a rider keeps the same colour on every page.
 */
export function avatarVariant(id: string): '' | 'a2' | 'a3' | 'a4' {
  const variants = ['', 'a2', 'a3', 'a4'] as const
  let sum = 0
  for (const char of id) sum = (sum + char.charCodeAt(0)) % 997
  return variants[sum % variants.length]
}

/** Pulls the 6-digit code out of a demo SMS body so it can be read or copied. */
export function codeFrom(body: string): string | null {
  return /(?:code|Code)[:\s]+(\d{6})/.exec(body)?.[1] ?? null
}
