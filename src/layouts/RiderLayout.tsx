import { Outlet } from 'react-router-dom'
import { Nav, type NavItem } from './Nav'
import { Footer } from './Footer'
import { RoleChip } from '../components/RoleChip'
import { SkipLink } from './SkipLink'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { ToggleIndicator } from '../components/Chip'
import { useApi } from '../lib/useApi'
import { useAuth } from '../state/useAuth'
import * as api from '../api/endpoints'

const loginItems: NavItem[] = [
  { to: '/#how', label: 'How it works' },
  { to: '/verify', label: 'Verify a rider' },
  { to: '/rider/signup', label: 'Join as a rider' },
]

const signupItems: NavItem[] = [
  { to: '/#how', label: 'How it works' },
  { to: '/verify', label: 'Verify a rider' },
  { to: '/rider/login', label: 'Rider log in' },
]

const appItems: NavItem[] = [
  { to: '/rider/dashboard', label: 'Dashboard' },
  { to: '/rider/jobs', label: 'My jobs' },
  { to: '/rider/balance', label: 'Balance' },
  { to: '/rider/verification', label: 'Verification' },
  { to: '/rider/share', label: 'My profile' },
]

export interface RiderLayoutProps {
  /** `signup` and `login` differ only by which door the nav offers. */
  mode?: 'signup' | 'login' | 'app'
}

/**
 * Rider pages. Accent: the dark teal bar.
 *
 * The bar reports whether the rider is bookable. It only reports: the switch
 * they actually operate is on the dashboard, because nelp.css gives the bar
 * copy no pointer events.
 */
export function RiderLayout({ mode = 'app' }: RiderLayoutProps) {
  const { user, signOut } = useAuth()
  const profile = useApi(
    () => (mode === 'app' && user ? api.myRiderProfile() : Promise.resolve(null)),
    [mode, user?.id],
  )

  const online = profile.data?.available_now ?? false
  const items =
    mode === 'app' ? appItems : mode === 'signup' ? signupItems : loginItems

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
          mode === 'app' && user ? (
            <div className="rswitch">
              <ToggleIndicator on={online} label={online ? 'Online' : 'Offline'} />
              {online ? 'Online' : 'Offline'}
              <Avatar name={user.display_name} size="sm" />
              <Button variant="text" size="sm" onClick={signOut}>
                Log out
              </Button>
            </div>
          ) : undefined
        }
      />
      <Outlet />
      <Footer home={mode === 'app' ? '/rider/dashboard' : '/'} />
    </>
  )
}
