import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './index'
import { AuthProvider } from '../state/AuthProvider'

/**
 * Every route renders without throwing, with the API answering as it would
 * for a signed-out visitor.
 *
 * Nothing here asserts on data — it asserts that each page reaches a usable
 * state (a main landmark) rather than a blank screen or a thrown error,
 * which is the failure these tests exist to catch.
 */

function stubFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      })

    if (url.includes('/api/auth/me')) {
      return json({ detail: 'Please sign in again.', code: 'NO_TOKEN' }, 401)
    }
    const path = new URL(url, 'http://localhost').pathname
    const notFound = () =>
      json({ detail: 'We could not find that.', code: 'NOT_FOUND' }, 404)

    // The collection endpoints answer with a list; a single item by id does
    // not exist for a signed-out visitor, so it answers 404 as the API does.
    if (path === '/api/areas') return json([])
    if (path === '/api/riders') return json([])
    if (path === '/api/bookings') return json([])
    if (path.startsWith('/api/riders/')) return notFound()
    if (path.startsWith('/api/bookings/')) return notFound()
    if (url.includes('/api/demo/inbox')) return json([])
    if (url.includes('/api/admin')) {
      return json({ detail: 'Staff only.', code: 'FORBIDDEN' }, 403)
    }
    if (url.includes('/api/track/')) {
      return json({ detail: 'Booking not found', code: 'NOT_FOUND' }, 404)
    }
    if (url.includes('/health')) {
      return json({
        status: 'ok',
        sms_provider: 'demo',
        payments_simulated: true,
        storage_configured: false,
      })
    }
    return json(null)
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', stubFetch())
  window.localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderAt(path: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AuthProvider>,
  )
}

/** Every path, with the layout a signed-out visitor should land in. */
const routes: [path: string, nav: string | null][] = [
  ['/', 'Main'],
  ['/r/some-rider-id', 'Main'],
  ['/verify', 'Main'],
  ['/v/some-rider-id', 'Main'],
  ['/this-path-does-not-exist', 'Main'],

  ['/sender/signin', 'Sender'],
  ['/sender/code', 'Sender'],
  ['/sender/session', 'Sender'],

  ['/rider/signup', 'Rider'],
  ['/rider/login', 'Rider'],

  ['/admin/login', null],

  // Opened from a text: no navigation at all.
  ['/j/4k8m', null],
  ['/rider/job/some-id', null],
  ['/t/8f2k', null],
  ['/c/8f2k', null],
  ['/s/some-id', null],
  ['/b/6w2p', null],

  ['/dev/components', null],
]

describe('every route renders', () => {
  it.each(routes)('%s', async (path, nav) => {
    renderAt(path)
    expect(await screen.findByRole('main')).toBeInTheDocument()
    if (nav) {
      expect(screen.getByRole('navigation', { name: nav })).toBeInTheDocument()
    }
  })
})

describe('guarded areas', () => {
  it.each([
    ['/sender/new', '/sender/signin', 'Sender'],
    ['/sender/bookings', '/sender/signin', 'Sender'],
    ['/rider/dashboard', '/rider/login', 'Rider'],
    ['/rider/jobs', '/rider/login', 'Rider'],
    ['/admin/queue', '/admin/login', null],
  ])('sends a signed-out visitor from %s to the sign-in page', async (path, _to, nav) => {
    renderAt(path)
    expect(await screen.findByRole('main')).toBeInTheDocument()
    if (nav) {
      expect(screen.getByRole('navigation', { name: nav })).toBeInTheDocument()
    }
    // The sign-in form is what they land on, not the guarded page.
    expect(
      await screen.findByLabelText('Phone number', { exact: false }),
    ).toBeInTheDocument()
  })
})

describe('layouts', () => {
  it('gives an SMS-link page the wordmark and no navigation', async () => {
    renderAt('/t/8f2k')
    await screen.findByRole('main')
    expect(screen.getByRole('link', { name: 'Nelp' })).toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'Rider' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('navigation', { name: 'Sender' }),
    ).not.toBeInTheDocument()
  })

  it('offers both doors on the landing page only', async () => {
    renderAt('/')
    await screen.findByRole('main')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav).toContainElement(
      screen.getByRole('link', { name: 'Sender sign in' }),
    )
    expect(nav).toContainElement(
      screen.getByRole('link', { name: 'Rider log in' }),
    )
  })

  it('drops the sign-in doors on an inner public page', async () => {
    renderAt('/verify')
    await screen.findByRole('main')
    expect(
      screen.queryByRole('link', { name: 'Sender sign in' }),
    ).not.toBeInTheDocument()
  })

  it('shows no account chip while signed out', async () => {
    renderAt('/sender/signin')
    await screen.findByRole('main')
    expect(screen.queryByRole('link', { name: 'Account' })).not.toBeInTheDocument()
  })

  it('shows admin tools only once past the login page', async () => {
    renderAt('/admin/login')
    await screen.findByRole('main')
    expect(
      screen.queryByRole('link', { name: 'SMS inbox' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to Nelp' })).toBeInTheDocument()
  })

  it('offers a skip link ahead of the navigation', async () => {
    renderAt('/')
    await screen.findByRole('main')
    const skip = screen.getByRole('link', { name: 'Skip to content' })
    expect(skip).toHaveAttribute('href', '#main')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })
})

describe('a failing API does not blank the page', () => {
  it('explains a tracking link that cannot be read', async () => {
    renderAt('/t/8f2k')
    expect(
      await screen.findByRole('heading', { name: 'This link does not work' }),
    ).toBeInTheDocument()
  })

  it('explains an unknown path', async () => {
    renderAt('/nope')
    expect(
      await screen.findByRole('heading', { name: 'We could not find that page' }),
    ).toBeInTheDocument()
  })
})
