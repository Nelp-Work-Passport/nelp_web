/**
 * The API contract, mirroring app/schemas.py in the nelp_api repository.
 *
 * Two conventions run through all of it:
 *
 * - **Money is in integer minor units.** `19000` is KES 190.00. Every field
 *   ending `_minor` goes through `formatKes`, never into the page raw.
 * - **Times are UTC ISO strings.** They are shown in Africa/Nairobi.
 */

export type Role = 'rider' | 'customer' | 'merchant' | 'admin'

export type BookingStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'DECLINED'
  | 'CANCELLED'

export type VerificationStatus =
  | 'UNVERIFIED'
  | 'PHONE_CONFIRMED'
  | 'DOCUMENTS_MANUALLY_CHECKED'

export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'

export type SmsStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED'

export type DocumentType = 'RIDER_CARD' | 'DRIVING_LICENCE'

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type RatingTag = 'punctual' | 'careful' | 'communicative'

export type Sort = 'trust' | 'availability' | 'distance'

export interface User {
  id: string
  phone: string
  display_name: string
  roles: Role[]
  phone_confirmed: boolean
  profile_image_url: string | null
}

export interface Auth {
  access_token: string
  token_type: string
  user: User
  sms_status: SmsStatus | null
}

export interface Area {
  id: string
  name: string
  city: string
}

export interface Fare {
  distance_km: number
  fare_minor: number
  platform_fee_minor: number
  rider_earning_minor: number
  currency: string
  is_estimate: boolean
}

/**
 * A rider's reputation.
 *
 * `label` is the headline the API asks us to show: "89 · 20 ratings" or
 * "New · 1 rating". For a new rider `trust_score` and `average_stars` are
 * deliberately `null` — showing them as 0 would read as a bad rider rather
 * than an unrated one, so nothing here ever falls back to a zero.
 */
export interface Trust {
  label: string
  is_new: boolean
  trust_score: number | null
  average_stars: number | null
  adjusted_rating: number | null
  rated_bookings: number
  completed_deliveries: number
  last_rated_at: string | null
  ratings_last_30_days: number
  tag_counts: Partial<Record<string, number>>
}

export interface Verification {
  status: VerificationStatus
  /** Shown as written, e.g. "Documents manually checked". */
  label: string
}

export interface Slot {
  id: string
  service_area_id: string
  starts_at: string
  ends_at: string
}

export interface RiderListItem {
  id: string
  display_name: string
  vehicle_type: string
  is_demo: boolean
  trust: Trust
  verification: Verification
  service_areas: Area[]
  available_now: boolean
  availability_updated_at: string | null
  current_area: Area | null
  approx_distance_km: number | null
  /** Expires after an hour. Fetch it fresh; never store it. */
  profile_image_url: string | null
}

export interface RiderDetail extends RiderListItem {
  upcoming_slots: Slot[]
}

export interface MyRider extends RiderDetail {
  balance_minor: number
}

export interface PublicReview {
  stars: number
  tags: string[]
  created_at: string
}

export interface MyReview extends PublicReview {
  id: string
  comment: string | null
  status: string
}

export interface Explanation {
  text: string
  source: 'claude' | 'template'
}

export interface PaymentSummary {
  id: string
  status: PaymentStatus
  amount_minor: number
  currency: string
  /** While true the UI must label the payment as simulated. */
  is_simulated: boolean
}

export interface Payment extends PaymentSummary {
  booking_id: string
  provider: string
  provider_reference: string | null
}

export interface BookingRider {
  id: string
  display_name: string
  is_demo: boolean
  profile_image_url: string | null
}

export interface StatusHistory {
  old_status: BookingStatus | null
  new_status: BookingStatus
  reason: string | null
  created_at: string
}

export interface Booking {
  id: string
  status: BookingStatus
  rider: BookingRider
  requester_name: string
  pickup_area: Area
  dropoff_area: Area
  scheduled_at: string
  ends_at: string
  fare_minor: number
  platform_fee_minor: number
  currency: string
  item_notes: string | null
  /** The link that goes into the text. Public, read-only. */
  tracking_url: string
  /** Masked unless you are the requester. */
  recipient_phone: string
  /** Shared between participants only while the booking is active. */
  contact_phones: Partial<Record<string, string>>
  /** `FAILED` means offer the resend. */
  delivery_code_sms: SmsStatus | null
  cancellation_pending: boolean
  cancellation_reason: string | null
  can_rate: boolean
  payment: PaymentSummary | null
  history: StatusHistory[]
  created_at: string
}

/** What the public tracking link shows. No private detail. */
export interface Tracking {
  status: BookingStatus
  rider_name: string
  pickup_area: string
  dropoff_area: string
  scheduled_at: string
  updated_at: string
}

export interface Rating {
  id: string
  booking_id: string
  stars: number
  tags: string[]
  rider_trust: Trust
}

export interface InboxMessage {
  phone: string
  body: string
  created_at: string
}

export interface Document {
  id: string
  document_type: DocumentType
  content_type: string
  size_bytes: number
  status: DocumentStatus
  review_note: string | null
  created_at: string
}

export interface AdminDocument extends Document {
  rider_id: string
  reviewed_by: string | null
  reviewed_at: string | null
}

export interface DocumentLink {
  url: string
  expires_in_seconds: number
}

export interface DocumentReview {
  document: AdminDocument
  verification: Verification
}

/** A pattern a person should look at. It never changes a score by itself. */
export interface Flag {
  type: string
  rider_id: string
  author_id: string | null
  detail: string
}

export interface LedgerEntry {
  account_type: string
  owner_type: string
  side: 'DEBIT' | 'CREDIT'
  amount_minor: number
}

export interface LedgerTransaction {
  id: string
  event_type: string
  created_at: string
  entries: LedgerEntry[]
}

export interface BookingLedger {
  transactions: LedgerTransaction[]
  total_debits_minor: number
  total_credits_minor: number
  balanced: boolean
}

export interface Health {
  status: string
  sms_provider: string
  payments_simulated: boolean
  storage_configured: boolean
}
