import { Outlet } from 'react-router-dom'
import { Nav, type NavItem } from './Nav'
import { Footer } from './Footer'
import { RoleChip } from '../components/RoleChip'
import { SkipLink } from './SkipLink'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'

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
  /** The signed-in sender, shown in the bar. */
  sender?: { name: string }
}

/** Sender pages. Accent: blue, from the top border of the nav. */
export function SenderLayout({ mode = 'app', sender }: SenderLayoutProps) {
  const name = sender?.name ?? 'Grace W.'

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
          mode === 'app' ? (
            <>
              <Avatar name={name} size="sm" variant="a2" />
              <b>{name}</b>
              <Button variant="text" size="sm" to="/sender/session">
                Log out
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
