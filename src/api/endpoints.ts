import { query, request } from './client'
import type {
  AdminDocument,
  Area,
  Auth,
  Booking,
  BookingLedger,
  BookingStatus,
  Document,
  DocumentLink,
  DocumentReview,
  DocumentType,
  Explanation,
  Fare,
  Flag,
  Health,
  InboxMessage,
  MyRider,
  MyReview,
  Payment,
  PublicReview,
  Rating,
  RatingTag,
  RiderDetail,
  RiderListItem,
  Role,
  Sort,
  Tracking,
  User,
} from './types'

/**
 * One function per endpoint, named for what a person is doing rather than
 * for the HTTP verb. This is the whole surface the pages are allowed to use.
 */

/* ---------------------------------------------------------------- meta */

export const health = () => request<Health>('/health', { anonymous: true })

export const listAreas = () =>
  request<Area[]>('/api/areas', { anonymous: true })

export const estimateFare = (pickupAreaId: string, dropoffAreaId: string) =>
  request<Fare>(
    `/api/fares/estimate${query({
      pickup_area_id: pickupAreaId,
      dropoff_area_id: dropoffAreaId,
    })}`,
    { anonymous: true },
  )

/* ---------------------------------------------------------------- auth */

export interface RegisterInput {
  phone: string
  pin: string
  display_name: string
  roles: Exclude<Role, 'admin'>[]
}

export const register = (body: RegisterInput) =>
  request<Auth>('/api/auth/register', { method: 'POST', body, anonymous: true })

export const login = (phone: string, pin: string) =>
  request<Auth>('/api/auth/login', {
    method: 'POST',
    body: { phone, pin },
    anonymous: true,
  })

export const me = () => request<User>('/api/auth/me')

/** The 6-digit code texted on sign-up. */
export const confirmPhone = (code: string) =>
  request<User>('/api/auth/confirm-phone', { method: 'POST', body: { code } })

export const resendPhoneCode = () =>
  request<{ sms_status: string }>('/api/auth/resend-code', { method: 'POST' })

/* -------------------------------------------------------------- riders */

export interface RiderSearch {
  area?: string
  /** An ISO string with an offset. Omit to mean now. */
  time?: string
  sort?: Sort
  include_demo?: boolean
}

export const listRiders = (search: RiderSearch = {}) =>
  request<RiderListItem[]>(`/api/riders${query({ ...search })}`, {
    anonymous: true,
  })

export const getRider = (riderId: string) =>
  request<RiderDetail>(`/api/riders/${riderId}`, { anonymous: true })

export const getRiderReviews = (riderId: string) =>
  request<PublicReview[]>(`/api/riders/${riderId}/reviews`, { anonymous: true })

/** The written explanation of a score. Falls back to a fixed template. */
export const getRiderExplanation = (riderId: string) =>
  request<Explanation>(`/api/riders/${riderId}/explanation`, {
    anonymous: true,
  })

export const myRiderProfile = () => request<MyRider>('/api/riders/me')

export interface RiderProfileInput {
  display_name: string
  vehicle_type: string
  service_area_ids: string[]
}

export const saveRiderProfile = (body: RiderProfileInput) =>
  request<MyRider>('/api/riders/me', { method: 'PUT', body })

export interface AvailabilityInput {
  is_available?: boolean
  current_area_id?: string
  slots?: { service_area_id: string; starts_at: string; ends_at: string }[]
}

export const setAvailability = (body: AvailabilityInput) =>
  request<MyRider>('/api/riders/me/availability', { method: 'PUT', body })

export const myReviews = () => request<MyReview[]>('/api/riders/me/reviews')

/* ------------------------------------------------------------ bookings */

export interface BookingInput {
  rider_id: string
  pickup_area_id: string
  dropoff_area_id: string
  /** Omit to book now. */
  scheduled_at?: string
  /** Defaults to your own phone. */
  recipient_phone?: string
  item_notes?: string
}

export const createBooking = (body: BookingInput) =>
  request<Booking>('/api/bookings', { method: 'POST', body })

export const listBookings = (
  params: {
    role?: 'all' | 'requester' | 'rider'
    status?: BookingStatus
    limit?: number
  } = {},
) => request<Booking[]>(`/api/bookings${query({ ...params })}`)

export const getBooking = (bookingId: string) =>
  request<Booking>(`/api/bookings/${bookingId}`)

export const acceptBooking = (bookingId: string) =>
  request<Booking>(`/api/bookings/${bookingId}/accept`, { method: 'POST' })

export const declineBooking = (bookingId: string, reason?: string) =>
  request<Booking>(`/api/bookings/${bookingId}/decline`, {
    method: 'POST',
    body: { reason: reason ?? null },
  })

export const markPickedUp = (bookingId: string) =>
  request<Booking>(`/api/bookings/${bookingId}/status`, {
    method: 'POST',
    body: { status: 'PICKED_UP' },
  })

export const cancelBooking = (bookingId: string, reason?: string) =>
  request<Booking>(`/api/bookings/${bookingId}/cancel`, {
    method: 'POST',
    body: { reason: reason ?? null },
  })

/**
 * The only way a booking becomes DELIVERED.
 *
 * It takes the recipient's 6-digit code, which is why a rider cannot mark
 * their own job complete.
 */
export const confirmDelivery = (bookingId: string, code: string) =>
  request<Booking>(`/api/bookings/${bookingId}/confirm-delivery`, {
    method: 'POST',
    body: { code },
  })

/** Offer this when `delivery_code_sms` is `FAILED`. Three resends allowed. */
export const resendDeliveryCode = (bookingId: string) =>
  request<Booking>(`/api/bookings/${bookingId}/resend-code`, { method: 'POST' })

export const rateBooking = (
  bookingId: string,
  stars: number,
  tags: RatingTag[],
  comment?: string,
) =>
  request<Rating>(`/api/bookings/${bookingId}/ratings`, {
    method: 'POST',
    body: { stars, tags, comment: comment ?? null },
  })

export const getBookingLedger = (bookingId: string) =>
  request<BookingLedger>(`/api/bookings/${bookingId}/ledger`)

/** The SMS link. No account needed, so it shows no private detail. */
export const track = (token: string) =>
  request<Tracking>(`/api/track/${token}`, { anonymous: true })

/* ------------------------------------------------------------ payments */

/**
 * Payment is in two steps, and both are simulated.
 *
 * The intent needs an idempotency key: sending the same key again returns
 * the same payment rather than charging twice.
 */
export const createPaymentIntent = (bookingId: string, idempotencyKey: string) =>
  request<Payment>('/api/payments/intent', {
    method: 'POST',
    body: { booking_id: bookingId },
    headers: { 'Idempotency-Key': idempotencyKey },
  })

/** Plays the provider's part, down the same path a real webhook would take. */
export const simulatePayment = (
  paymentId: string,
  outcome: 'SUCCEEDED' | 'FAILED' = 'SUCCEEDED',
) =>
  request<Payment>(`/api/payments/${paymentId}/simulate`, {
    method: 'POST',
    body: { outcome },
  })

/* ---------------------------------------------------------------- demo */

/**
 * The demo SMS inbox, which is how a code reaches the demo.
 *
 * It is public and per-phone: anyone who knows a number can read its codes.
 * That is acceptable for demo data only, and the page says so.
 */
export const demoInbox = (phone: string) =>
  request<InboxMessage[]>(`/api/demo/inbox${query({ phone })}`, {
    anonymous: true,
  })

/* --------------------------------------------------------------- files */

export const uploadProfileImage = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return request<{ profile_image_url: string; expires_in_seconds: number }>(
    '/api/users/me/profile-image',
    { method: 'PUT', form },
  )
}

export const removeProfileImage = () =>
  request<void>('/api/users/me/profile-image', { method: 'DELETE' })

export const uploadVerificationDocument = (
  documentType: DocumentType,
  file: File,
) => {
  const form = new FormData()
  form.append('document_type', documentType)
  form.append('file', file)
  return request<Document>('/api/riders/me/verification-documents', {
    method: 'POST',
    form,
  })
}

export const myDocuments = () =>
  request<Document[]>('/api/riders/me/verification-documents')

/* --------------------------------------------------------------- admin */

export const adminDocuments = (status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING') =>
  request<AdminDocument[]>(
    `/api/admin/verification-documents${query({ status })}`,
  )

export const adminDocumentLink = (documentId: string) =>
  request<DocumentLink>(
    `/api/admin/verification-documents/${documentId}/link`,
  )

export const reviewDocument = (
  documentId: string,
  approve: boolean,
  note?: string,
) =>
  request<DocumentReview>(
    `/api/admin/verification-documents/${documentId}/review`,
    { method: 'POST', body: { approve, note: note ?? null } },
  )

/** Patterns for a person to look at. They never change a score on their own. */
export const adminFlags = () => request<Flag[]>('/api/admin/flags')

export const adminCancellations = () =>
  request<Booking[]>('/api/admin/cancellations')

export const resolveCancellation = (
  bookingId: string,
  approve: boolean,
  note?: string,
) =>
  request<Booking>(`/api/admin/bookings/${bookingId}/resolve-cancellation`, {
    method: 'POST',
    body: { approve, note: note ?? null },
  })

export const setRiderVerification = (
  riderId: string,
  status: 'PHONE_CONFIRMED' | 'DOCUMENTS_MANUALLY_CHECKED',
  note?: string,
) =>
  request<{ status: string; label: string }>(
    `/api/admin/riders/${riderId}/verification`,
    { method: 'POST', body: { status, note: note ?? null } },
  )
