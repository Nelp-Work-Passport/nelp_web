import { Outlet, useLocation } from 'react-router-dom'
import { Nav, type NavItem } from './Nav'
import { Footer } from './Footer'
import { RoleChip } from '../components/RoleChip'
import { SkipLink } from './SkipLink'

/** The landing page's nav, which offers both doors. */
const landingItems: NavItem[] = [
  { to: '/#how', label: 'How it works' },
  { to: '/verify', label: 'Verify a rider' },
  { to: '/rider/login', label: 'Rider log in' },
  { to: '/sender/signin', label: 'Sender sign in' },
]

/** Everywhere else, where the two sign-in doors are not the point. */
const innerItems: NavItem[] = [
  { to: '/#how', label: 'How it works' },
  { to: '/verify', label: 'Verify a rider' },
]

/** Marketing pages and public profiles. No accent, no account needed. */
export function PublicLayout() {
  const { pathname } = useLocation()
  const isLanding = pathname === '/'

  return (
    <>
      <RoleChip role="public" />
      <SkipLink />
      <Nav
        home="/"
        items={isLanding ? landingItems : innerItems}
        label="Main"
      />
      <Outlet />
      <Footer full={isLanding} />
    </>
  )
}
