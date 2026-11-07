import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './index'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

/** Every route, with the layout each one should land in. */
const routes: [path: string, nav: string | null][] = [
  ['/', 'Main'],
  ['/r/amina-k', 'Main'],
  ['/verify', 'Main'],
  ['/v/amina-k-7nov', 'Main'],
  ['/sender/signin', 'Sender'],
  ['/sender/code', 'Sender'],
  ['/sender/session', 'Sender'],
  ['/sender/new', 'Sender'],
  ['/sender/choose', 'Sender'],
  ['/sender/quote', 'Sender'],
  ['/sender/bookings', 'Sender'],
  ['/sender/bookings/b1', 'Sender'],
  ['/rider/signup', 'Rider'],
  ['/rider/login', 'Rider'],
  ['/rider/dashboard', 'Rider'],
  ['/rider/jobs', 'Rider'],
  ['/rider/log-job', 'Rider'],
  ['/rider/balance', 'Rider'],
  ['/rider/verification', 'Rider'],
  ['/rider/share', 'Rider'],
  ['/admin/login', null],
  ['/admin/queue', 'Admin'],
  ['/admin/attack-demo', 'Admin'],
  ['/admin/sms', 'Admin'],
  // Opened from a text: no navigation at all.
  ['/j/4k8m', null],
  ['/rider/job/j1', null],
  ['/t/8f2k', null],
  ['/c/8f2k', null],
  ['/s/3m9q', null],
  ['/b/6w2p', null],
  ['/dev/components', null],
  ['/this-path-does-not-exist', 'Main'],
]

describe('every route renders', () => {
  it.each(routes)('%s', (path, nav) => {
    renderAt(path)
    // A main landmark is the skip link's target and the page's content.
    expect(screen.getByRole('main')).toBeInTheDocument()
    if (nav) {
      expect(screen.getByRole('navigation', { name: nav })).toBeInTheDocument()
    }
  })
})

describe('layouts', () => {
  it('gives an SMS-link page the wordmark and no navigation', () => {
    renderAt('/t/8f2k')
    expect(screen.getByRole('link', { name: 'Nelp' })).toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'Rider' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'Sender' }),
    ).not.toBeInTheDocument()
  })

  it('offers both doors on the landing page only', () => {
    renderAt('/')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav).toContainElement(
      screen.getByRole('link', { name: 'Sender sign in' }),
    )
    expect(nav).toContainElement(
      screen.getByRole('link', { name: 'Rider log in' }),
    )
  })

  it('drops the sign-in doors on an inner public page', () => {
    renderAt('/verify')
    expect(
      screen.queryByRole('link', { name: 'Sender sign in' }),
    ).not.toBeInTheDocument()
  })

  it('shows the sender their name and a way out once signed in', () => {
    renderAt('/sender/new')
    expect(screen.getAllByText('Grace W.').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Log out' })).toBeInTheDocument()
  })

  it('keeps the sender bar clear of an account chip before sign-in', () => {
    renderAt('/sender/signin')
    expect(screen.queryByText('Grace W.')).not.toBeInTheDocument()
  })

  it('reports the rider online state without a switch in the bar', () => {
    renderAt('/rider/dashboard')
    // The bar reports; the switch a rider operates lives on the dashboard.
    expect(screen.getByRole('img', { name: 'Online' })).toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it('shows admin tools only once past the login page', () => {
    renderAt('/admin/login')
    expect(
      screen.queryByRole('link', { name: 'SMS inbox' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Nelp' })).toBeInTheDocument()
  })

  it('redirects a role root to its first page', () => {
    renderAt('/sender')
    expect(screen.getByRole('navigation', { name: 'Sender' })).toBeInTheDocument()
    renderAt('/admin')
    expect(screen.getByRole('navigation', { name: 'Admin' })).toBeInTheDocument()
  })

  it('offers a skip link ahead of the navigation', () => {
    renderAt('/')
    const skip = screen.getByRole('link', { name: 'Skip to content' })
    expect(skip).toHaveAttribute('href', '#main')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })
})

describe('not found', () => {
  it('explains what to check rather than only saying no', () => {
    renderAt('/t/')
    expect(
      screen.getByRole('heading', { name: 'We could not find that page' }),
    ).toBeInTheDocument()
  })
})
