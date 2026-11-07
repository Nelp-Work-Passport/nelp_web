/**
 * The booking being put together, between the details page and the rider
 * list.
 *
 * It lives in `sessionStorage` rather than in React state so a reload or a
 * shared link does not drop a half-finished booking, and so the two pages do
 * not have to be mounted together. It is cleared as soon as the booking
 * exists on the server, which is the point at which the server owns it.
 */

const KEY = 'nelp.draft.v1'

export interface BookingDraft {
  pickup_area_id: string
  dropoff_area_id: string
  pickupName: string
  dropoffName: string
  /** An ISO string with an offset, or null to mean now. */
  scheduled_at: string | null
  recipient_phone: string
  item_notes: string
}

export function saveDraft(draft: BookingDraft): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(draft))
  } catch {
    // Without storage the flow still works within one page load.
  }
}

export function loadDraft(): BookingDraft | null {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BookingDraft
    if (!parsed.pickup_area_id || !parsed.dropoff_area_id) return null
    return parsed
  } catch {
    return null
  }
}

export function clearDraft(): void {
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    // Nothing to do.
  }
}
