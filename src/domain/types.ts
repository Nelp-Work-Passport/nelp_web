/** Shared domain vocabulary. One word per role, as the product uses them. */

export type Role = 'sender' | 'rider' | 'recipient' | 'admin' | 'public'

/** Trust-score bands. `none` is "not enough evidence yet" (fewer than 5 confirmed jobs). */
export type Band = 'none' | 'flagged' | 'building' | 'strong'

/** The visual weight nelp.css gives a ring or band label. */
export type BandTone = 'neu' | 'low' | 'build' | 'strong'

export interface ScoreParts {
  /** Recipient variety, out of 45. */
  variety: number
  /** Time spread, out of 35. */
  spread: number
  /** Repeat recipients, out of 20. */
  repeat: number
}

export interface ScoreEvidence {
  /** Jobs a recipient confirmed with their code. Only these count. */
  confirmedJobs: number
  /** Distinct recipient phone numbers across those jobs. */
  distinctRecipients: number
  /** Distinct calendar weeks those jobs fall in. */
  activeWeeks: number
  /** Recipients who booked more than once. */
  repeatRecipients: number
}

export interface Score {
  total: number
  band: Band
  parts: ScoreParts
  evidence: ScoreEvidence
}

/** A reason a profile was held for human review. */
export interface Flag {
  id: string
  text: string
  severity: 'bad' | 'warn'
}

export type VerificationStatus =
  | 'not-submitted'
  | 'under-review'
  | 'verified'
  | 'rejected'

export interface Rider {
  id: string
  slug: string
  name: string
  initials: string
  /** Avatar palette variant from nelp.css: `av`, `av a2`, `av a3`, `av a4`. */
  avatarVariant: '' | 'a2' | 'a3' | 'a4'
  area: string
  phone: string
  score: Score
  rating: number | null
  ratingCount: number
  verification: VerificationStatus
  /** Verified ID and a score of 70 or more. Gates the demo insurance quote. */
  assured: boolean
  flagged: boolean
  flags: Flag[]
  online: boolean
  availableFrom?: string
}

export type BookingState =
  | 'requested'
  | 'accepted'
  | 'picked-up'
  | 'in-transit'
  | 'delivered'
  | 'receipt-confirmed'
  | 'rated'
  | 'declined'
  | 'expired'
  | 'cancelled'

export type PaymentMethod = 'mpesa' | 'cash'

export type PaymentState =
  | 'unpaid'
  | 'waiting'
  | 'success'
  | 'failed'
  | 'timeout'

export type JobSource = 'dashboard' | 'sms-link' | 'off-platform'

export type JobStatus = 'pending' | 'confirmed' | 'expired' | 'disputed'
