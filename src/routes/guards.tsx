import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../state/useAuth'
import { SkeletonCard } from '../components/Skeleton'
import { Page } from '../components/Page'
import type { Role } from '../api/types'

export interface RequireRoleProps {
  /** Any one of these roles is enough. */
  roles: Role[]
  /** Where to send someone who does not hold one. */
  signInAt: string
}

/**
 * Keeps an area behind its role.
 *
 * Recipients and anyone following an SMS link are never guarded: for those
 * pages the link, plus a code, is the credential, and demanding an account
 * would make the product unusable for the person it matters most to.
 *
 * The path they wanted is remembered, so signing in returns them to it
 * rather than dumping them on a dashboard.
 */
export function RequireRole({ roles, signInAt }: RequireRoleProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // The stored token has not been checked yet. Redirecting now would bounce
  // a signed-in person out of their own page on every reload.
  if (loading) {
    return (
      <Page>
        <div className="wrap col" style={{ gap: 24 }}>
          <SkeletonCard lines={4} />
        </div>
      </Page>
    )
  }

  if (!user || !roles.some((role) => user.roles.includes(role))) {
    return (
      <Navigate
        to={signInAt}
        replace
        state={{ from: location.pathname + location.search }}
      />
    )
  }

  return <Outlet />
}
