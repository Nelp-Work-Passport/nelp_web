import { Outlet } from 'react-router-dom'
import { Nav, type NavItem } from './Nav'
import { Footer } from './Footer'
import { RoleChip } from '../components/RoleChip'
import { SkipLink } from './SkipLink'
import { Avatar } from '../components/Avatar'
import { ToggleIndicator } from '../components/Chip'

const authItems: NavItem[] = [
  { to: '/#how', label: 'How it works' },
  { to: '/verify', label: 'Verify a rider' },
  { to: '/rider/login', label: 'Rider log in' },
]

const signupItems: NavItem[] = [
  { to: '/#how', label: 'How it works' },
  { to: '/verify', label: 'Verify a rider' },
  { to: '/rider/signup', label: 'Join as a rider' },
]

const appItems: NavItem[] = [
  { to: '/rider/dashboard', label: 'Dashboard' },
  { to: '/rider/jobs', label: 'My jobs' },
  { to: '/rider/balance', label: 'Balance' },
  { to: '/rider/share', label: 'My profile' },
]

export interface RiderLayoutProps {
  /** `signup` and `login` differ only by which door the nav offers. */
  mode?: 'signup' | 'login' | 'app'
  rider?: { name: string }
  online?: boolean
}

/**
 * Rider pages. Accent: the dark teal bar.
 *
 * The online switch lives in the bar, because being bookable or not is the
 * one piece of state a rider changes from anywhere.
 */
export function RiderLayout({
  mode = 'app',
  rider,
  online = true,
}: RiderLayoutProps) {
  const name = rider?.name ?? 'Amina K.'
  const items =
    mode === 'app' ? appItems : mode === 'signup' ? authItems : signupItems

  return (
    <>
      <RoleChip role="rider" />
      <SkipLink />
      <Nav
        accent="rider"
        home={mode === 'app' ? '/rider/dashboard' : '/'}
        items={items}
        label="Rider"
        aside={
          mode === 'app' ? (
            <div className="rswitch">
              <ToggleIndicator
                on={online}
                label={online ? 'Online' : 'Offline'}
              />
              {online ? 'Online' : 'Offline'}
              <Avatar name={name} size="sm" />
            </div>
          ) : undefined
        }
      />
      <Outlet />
      <Footer home={mode === 'app' ? '/rider/dashboard' : '/'} />
    </>
  )
}
