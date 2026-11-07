import { Outlet } from 'react-router-dom'
import { Nav, type NavItem } from './Nav'
import { RoleChip } from '../components/RoleChip'
import { SkipLink } from './SkipLink'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'
import { useAuth } from '../state/useAuth'

const items: NavItem[] = [
  { to: '/admin/queue', label: 'Verification queue' },
  { to: '/admin/attack-demo', label: 'Abuse review' },
  { to: '/admin/sms', label: 'SMS inbox' },
]

export interface AdminLayoutProps {
  /** `login` shows only a way back out; `app` shows the three tools. */
  mode?: 'login' | 'app'
}

/** Admin pages. Accent: the ink bar, so staff tools never look like the app. */
export function AdminLayout({ mode = 'app' }: AdminLayoutProps) {
  const { user, signOut } = useAuth()

  return (
    <>
      <RoleChip role="admin" />
      <SkipLink />
      <Nav
        home={mode === 'app' ? '/admin/queue' : '/'}
        accent="admin"
        brandSuffix={
          <Badge tone="neu" style={{ marginLeft: 6 }}>
            Admin
          </Badge>
        }
        items={mode === 'app' ? items : undefined}
        label="Admin"
        aside={
          mode === 'app' && user ? (
            <>
              <b>{user.display_name}</b>
              <Button variant="text" size="sm" onClick={signOut}>
                Log out
              </Button>
            </>
          ) : (
            <Button variant="text" size="sm" to="/">
              Back to Nelp
            </Button>
          )
        }
      />
      <Outlet />
    </>
  )
}
