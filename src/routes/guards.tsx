import { Navigate, Outlet, useLocation } from 'react-router-dom'

export interface GuardProps {
  /** Whether the visitor holds the credential this area needs. */
  allowed: boolean
  /** Where to send them if they do not. */
  signInAt: string
}

/**
 * Keeps an area behind its credential.
 *
 * Recipients and anyone following an SMS link are never guarded: for those
 * pages the link plus a code or PIN *is* the credential, and demanding an
 * account would make the product unusable for the person it matters most to.
 *
 * The path they wanted is remembered, so signing in returns them to it
 * rather than dumping them on a dashboard.
 */
export function RequireRole({ allowed, signInAt }: GuardProps) {
  const location = useLocation()
  if (!allowed) {
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
