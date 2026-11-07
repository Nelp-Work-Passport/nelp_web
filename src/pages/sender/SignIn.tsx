import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Page, PageHeader } from '../../components/Page'
import { Button } from '../../components/Button'
import { Banner } from '../../components/Banner'
import { PhoneInput } from '../../components/PhoneInput'
import { PinInput } from '../../components/PinInput'
import { TextInput } from '../../components/TextInput'
import { Tabs, TabPanel } from '../../components/Tabs'
import { SourceLine } from '../../components/SourceLine'
import { useMutation } from '../../lib/useApi'
import { useAuth } from '../../state/useAuth'
import { parsePhone } from '../../domain/phone'
import { checkPinStrength } from '../../domain/codes'

type Mode = 'signin' | 'signup'

interface LocationState {
  from?: string
}

/**
 * Design: SenderSignin.dc.html
 *
 * Phone number and a PIN. The design called for a code-only sign-in, but the
 * API authenticates on phone plus PIN and uses the texted code once, to
 * confirm the number — so that is what this does, and the code page follows
 * sign-up rather than sign-in.
 */
export function SenderSignIn() {
  const [mode, setMode] = useState<Mode>('signin')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)

  const [wrongDoor, setWrongDoor] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp, signOut } = useAuth()

  const signInCall = useMutation(signIn)
  const signUpCall = useMutation(signUp)
  const pending = signInCall.pending || signUpCall.pending
  const error = signInCall.error ?? signUpCall.error

  const parsed = parsePhone(phone)
  const phoneError = touched && !parsed.ok ? parsed.error : null
  const pinError = touched && mode === 'signup' ? checkPinStrength(pin) : null
  const nameError =
    touched && mode === 'signup' && name.trim().length < 2
      ? 'Enter your name, at least 2 characters.'
      : null

  const after = (location.state as LocationState | null)?.from ?? '/sender/new'

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setTouched(true)
    if (!parsed.ok) return

    if (mode === 'signin') {
      if (pin.length < 4) return
      const user = await signInCall.run(parsed.e164, pin)
      if (!user) return

      // A rider-only account cannot book, so the guard would bounce them
      // back here with nothing on screen to explain why.
      const canSend = user.roles.some(
        (role) => role === 'customer' || role === 'merchant' || role === 'admin',
      )
      if (!canSend) {
        signOut()
        setWrongDoor(true)
        return
      }
      navigate(after, { replace: true })
      return
    }

    if (pinError || nameError) return
    const user = await signUpCall.run({
      phone: parsed.e164,
      pin,
      display_name: name.trim(),
      roles: ['customer'],
    })
    // A new account needs its phone confirmed with the texted code.
    if (user) navigate('/sender/code', { replace: true })
  }

  return (
    <Page>
      <div className="wrap col" style={{ gap: 32 }}>
        <div className="narrowc col" style={{ gap: 24 }}>
          <PageHeader
            eyebrow={mode === 'signin' ? 'Sender sign in' : 'Create an account'}
            title={
              mode === 'signin' ? 'Sign in with your phone' : 'Start sending parcels'
            }
          >
            <p className="muted">
              {mode === 'signin'
                ? 'Your phone number and the PIN you set.'
                : 'We text a 6-digit code to confirm the number is yours.'}
            </p>
          </PageHeader>

          <Tabs
            label="Sign in or create an account"
            value={mode}
            onChange={(next) => {
              setMode(next)
              setTouched(false)
              setWrongDoor(false)
              signInCall.reset()
              signUpCall.reset()
            }}
            items={[
              { id: 'signin', label: 'I have an account' },
              { id: 'signup', label: 'I am new' },
            ]}
          />

          <TabPanel id={mode}>
            <form className="card lg col" style={{ gap: 20 }} onSubmit={submit} noValidate>
              {wrongDoor ? (
                <Banner
                  tone="warn"
                  live
                  title="That account is a rider account"
                  actions={
                    <Button size="sm" to="/rider/login">
                      Go to rider log in
                    </Button>
                  }
                >
                  Those details are right, but the account carries parcels
                  rather than sending them. You have been signed out again.
                </Banner>
              ) : error ? (
                <Banner tone="bad" live title="We could not sign you in">
                  {error.message}
                </Banner>
              ) : null}

              {mode === 'signup' ? (
                <TextInput
                  label="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  error={nameError}
                  autoComplete="name"
                  hint="Riders see this when you book them."
                />
              ) : null}

              <PhoneInput
                label="Phone number"
                value={phone}
                onChange={setPhone}
                error={phoneError}
                hint="We only use it to sign you in and send booking updates."
              />

              <PinInput
                label={mode === 'signin' ? 'PIN' : 'Create a PIN'}
                value={pin}
                onChange={setPin}
                error={pinError}
                showStrength={mode === 'signup'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                hint={mode === 'signup' ? '4 to 6 digits.' : undefined}
              />

              <Button type="submit" size="lg" block loading={pending}>
                {mode === 'signin' ? 'Sign in' : 'Create my account'}
              </Button>

              <SourceLine>
                Demo accounts: 0700000101 to 0700000108, PIN 1234.
              </SourceLine>
            </form>
          </TabPanel>
        </div>
      </div>
    </Page>
  )
}
