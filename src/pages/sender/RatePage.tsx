import { Navigate, useParams } from 'react-router-dom'

/**
 * Design: Rating.dc.html
 *
 * The rating link from a text. The API ties rating to the booking rather
 * than to a separate token, so this hands over to the booking page, where
 * the rating form appears once the API says `can_rate`.
 */
export function RatePage() {
  const { token = '' } = useParams()
  return <Navigate to={`/sender/bookings/${token}`} replace />
}
