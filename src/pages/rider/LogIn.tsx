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
 * Design: RiderLogin.dc.html
 *
 * Phone number and PIN. The API locks a number after eight wrong tries in
 * fifteen minutes and says so in its own words, which is what the banner
 * shows rather than a guess at the count.
 */
export function RiderLogIn() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [touched, setTouched] = useState(false)
  const [wrongDoor, setWrongDoor] = useState(false)
  const navigate = useNavigate()
  const { signIn, signOut } = useAuth()
  const call = useMutation(signIn)

  const parsed = parsePhone(phone)
  const phoneError = touched && !parsed.ok ? parsed.error : null

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setTouched(true)
    setWrongDoor(false)
    if (!parsed.ok || pin.length < 4) return

    const user = await call.run(parsed.e164, pin)
    if (!user) return

    // The sign-in worked but this is not a rider account. Without saying so,
    // the guard would bounce them straight back here and the form would look
    // as though nothing had happened.
    if (!user.roles.includes('rider')) {
      signOut()
      setWrongDoor(true)
      return
    }
    navigate('/rider/dashboard', { replace: true })
  }

  return (
    <Page>
      <div className="wrap col" style={{ gap: 40 }}>
        <div className="narrowc col" style={{ gap: 24 }}>
          <PageHeader eyebrow="Rider log in" title="Welcome back" />

          <form className="card lg col" style={{ gap: 20 }} onSubmit={submit} noValidate>
            {wrongDoor ? (
              <Banner
                tone="warn"
                live
                title="That account is not a rider account"
                actions={
                  <Button size="sm" to="/sender/signin">
                    Sign in to send instead
                  </Button>
                }
              >
                Those details are right, but the account sends parcels rather
                than carrying them, so the rider pages would stay closed. You
                have been signed out again.
              </Banner>
            ) : call.error ? (
              <Banner
                tone="bad"
                live
                icon={call.error.status === 429 ? 'lock' : 'error'}
                title={
                  call.error.status === 429
                    ? 'Log in is locked for a while'
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

            <div className="row sb">
              <span className="cap">
                Forgotten your PIN? Ask Nelp support to reset it.
              </span>
              <Button variant="text" size="sm" to="/rider/signup">
                Create an account
              </Button>
            </div>

            <SourceLine>
              Demo riders: 0700000001 to 0700000006, PIN 1234.
            </SourceLine>
          </form>
        </div>
      </div>
    </Page>
  )
}
