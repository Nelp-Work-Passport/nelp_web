import { Navigate, useParams } from 'react-router-dom'

/**
 * Design: VerifyResult.dc.html
 *
 * A rider's share link. The backend identifies riders by id, so a verify
 * link is just another way into the public profile, which is itself the
 * record. Nothing is cached in the link, so there is no stale or tampered
 * copy to warn about.
 */
export function VerifyResultPage() {
  const { token = '' } = useParams()
  return <Navigate to={`/r/${token}`} replace />
}
