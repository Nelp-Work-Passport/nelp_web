import { Outlet } from 'react-router-dom'
import { Nav, type NavItem } from './Nav'
import { Footer } from './Footer'
import { RoleChip } from '../components/RoleChip'
import { SkipLink } from './SkipLink'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { useAuth } from '../state/useAuth'

/** Before sign-in: the accent is already Sender blue, but the links are public. */
const authItems: NavItem[] = [
  { to: '/#how', label: 'How it works' },
  { to: '/verify', label: 'Verify a rider' },
]

const appItems: NavItem[] = [
  { to: '/sender/new', label: 'New booking' },
  { to: '/sender/bookings', label: 'My bookings' },
  { to: '/sender/session', label: 'Account' },
]

export interface SenderLayoutProps {
  /** `auth` before sign-in, `app` after. */
  mode?: 'auth' | 'app'
}

/** Sender pages. Accent: blue, from the top border of the nav. */
export function SenderLayout({ mode = 'app' }: SenderLayoutProps) {
  const { user } = useAuth()

  return (
    <>
      <RoleChip role="sender" />
      <SkipLink />
      <Nav
        accent="sender"
        home="/"
        items={mode === 'auth' ? authItems : appItems}
        label="Sender"
        aside={
          mode === 'app' && user ? (
            <>
              <Avatar name={user.display_name} size="sm" variant="a2" />
              <b>{user.display_name}</b>
              <Button variant="text" size="sm" to="/sender/session">
                Account
              </Button>
            </>
          ) : undefined
        }
      />
      <Outlet />
      <Footer />
    </>
  )
}
