import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, PageHeader } from '../../components/Page'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { PhoneInput } from '../../components/PhoneInput'
import { PinInput } from '../../components/PinInput'
import { SourceLine } from '../../components/SourceLine'
import { useMutation } from '../../lib/useApi'
import { useAuth } from '../../state/useAuth'
import { parsePhone } from '../../domain/phone'

/**
 * Design: AdminLogin.dc.html
 *
 * Staff sign in with the same phone-and-PIN as everyone else; what makes
 * them staff is the admin role on the account, not a separate login. So a
 * sign-in that succeeds without that role is refused here with its reason,
 * rather than landing on tools that would all return 403.
 */
export function AdminLogin() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [touched, setTouched] = useState(false)
  const [notStaff, setNotStaff] = useState(false)

  const navigate = useNavigate()
  const { signIn, signOut } = useAuth()
  const call = useMutation(signIn)

  const parsed = parsePhone(phone)
  const phoneError = touched && !parsed.ok ? parsed.error : null

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setTouched(true)
    setNotStaff(false)
    if (!parsed.ok || pin.length < 4) return

    const user = await call.run(parsed.e164, pin)
    if (!user) return

    if (!user.roles.includes('admin')) {
      // Signing in worked, but this is not a staff account. Do not leave a
      // half-privileged session behind.
      signOut()
      setNotStaff(true)
      return
    }
    navigate('/admin/queue', { replace: true })
  }

  return (
    <Page>
      <div className="wrap col" style={{ gap: 24 }}>
        <div className="narrowc col" style={{ gap: 24 }}>
          <PageHeader eyebrow="Admin" title="Admin log in">
            <p className="muted">
              For Nelp staff. You can review rider documents, cancellations
              and abuse flags.
            </p>
          </PageHeader>

          <form className="card lg col" style={{ gap: 20 }} onSubmit={submit} noValidate>
            {notStaff ? (
              <Banner tone="bad" live title="That account is not a staff account">
                The sign-in worked, but it has no admin role, so none of the
                staff tools would open. You have been signed out again.
              </Banner>
            ) : call.error ? (
              <Banner
                tone="bad"
                live
                icon={call.error.status === 429 ? 'lock' : 'error'}
                title={
                  call.error.status === 429
                    ? 'Locked for a while'
                    : 'Those details are not right'
                }
              >
                {call.error.message}
              </Banner>
            ) : null}

            <PhoneInput
              label="Phone number"
              value={phone}
              onChange={setPhone}
              error={phoneError}
            />

            <PinInput
              label="PIN"
              value={pin}
              onChange={setPin}
              autoComplete="current-password"
            />

            <Button type="submit" size="lg" block loading={call.pending}>
              Log in
            </Button>

            <SourceLine>
              The demo admin is the ADMIN_PHONE in the API&rsquo;s .env, with
              the PIN set there before seeding.
            </SourceLine>
          </form>
        </div>
      </div>
    </Page>
  )
}
