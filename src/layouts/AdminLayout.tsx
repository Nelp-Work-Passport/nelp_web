import { Outlet } from 'react-router-dom'
import { Nav, type NavItem } from './Nav'
import { RoleChip } from '../components/RoleChip'
import { SkipLink } from './SkipLink'
import { Badge } from '../components/Badge'
import { Button } from '../components/Button'

const items: NavItem[] = [
  { to: '/admin/queue', label: 'Verification queue' },
  { to: '/admin/attack-demo', label: 'Attack demo' },
  { to: '/admin/sms', label: 'SMS inbox' },
]

export interface AdminLayoutProps {
  /** `login` shows only a way back out; `app` shows the three tools. */
  mode?: 'login' | 'app'
  username?: string
}

/** Admin pages. Accent: the ink bar, so staff tools never look like the app. */
export function AdminLayout({ mode = 'app', username = 'admin.demo' }: AdminLayoutProps) {
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
          mode === 'app' ? (
            <>
              <b>{username}</b>
              <Button variant="text" size="sm" to="/admin/login">
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
