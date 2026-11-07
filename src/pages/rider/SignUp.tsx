import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, PageHeader } from '../../components/Page'
import { Avatar } from '../../components/Avatar'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { PhoneInput } from '../../components/PhoneInput'
import { PinInput } from '../../components/PinInput'
import { TextInput } from '../../components/TextInput'
import { SkeletonCard } from '../../components/Skeleton'
import { SourceLine } from '../../components/SourceLine'
import { ScoreBox } from '../../components/ScoreRing'
import { useApi, useMutation } from '../../lib/useApi'
import { useAuth } from '../../state/useAuth'
import { parsePhone } from '../../domain/phone'
import { checkPinStrength } from '../../domain/codes'
import * as api from '../../api/endpoints'

/**
 * Design: RiderSignup.dc.html
 *
 * Creating a rider account is two calls: the account itself, then the rider
 * profile with a vehicle and the areas they work. Both happen here, so a
 * rider is listable the moment they finish rather than landing on a
 * dashboard that cannot take bookings yet.
 */
export function RiderSignUp() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [vehicle, setVehicle] = useState('Motorbike')
  const [areaIds, setAreaIds] = useState<string[]>([])
  const [consent, setConsent] = useState(false)
  const [touched, setTouched] = useState(false)

  const navigate = useNavigate()
  const { signUp } = useAuth()
  const areas = useApi(() => api.listAreas(), [])

  const createAccount = useMutation(signUp)
  const createProfile = useMutation(api.saveRiderProfile)

  const parsed = parsePhone(phone)
  const phoneError = touched && !parsed.ok ? parsed.error : null
  const nameError =
    touched && name.trim().length < 2 ? 'Enter your full name.' : null
  const pinError = touched ? checkPinStrength(pin) : null
  const matchError =
    touched && confirmPin && pin !== confirmPin
      ? 'The two PINs are different. Check them and try again.'
      : null
  const areaError =
    touched && areaIds.length === 0 ? 'Choose at least one area you work.' : null
  const consentError =
    touched && !consent ? 'Please agree before creating an account.' : null

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setTouched(true)
    if (
      !parsed.ok ||
      nameError ||
      pinError ||
      matchError ||
      areaError ||
      !consent ||
      pin !== confirmPin
    ) {
      return
    }

    const user = await createAccount.run({
      phone: parsed.e164,
      pin,
      display_name: name.trim(),
      roles: ['rider'],
    })
    if (!user) return

    // The account exists; now the profile, so senders can find them.
    const profile = await createProfile.run({
      display_name: name.trim(),
      vehicle_type: vehicle,
      service_area_ids: areaIds,
    })
    if (profile) navigate('/rider/dashboard', { replace: true })
  }

  const pending = createAccount.pending || createProfile.pending
  const error = createAccount.error ?? createProfile.error

  return (
    <Page>
      <div className="wrap">
        <div className="g12" style={{ alignItems: 'start' }}>
          <div className="s7 col" style={{ gap: 24 }}>
            <PageHeader eyebrow="Rider sign-up" title="Start your work history">
              <p className="muted">
                It takes a minute. You log in with your phone number and a PIN.
              </p>
            </PageHeader>

            <form className="card lg col" style={{ gap: 20 }} onSubmit={submit} noValidate>
              {error ? (
                <Banner tone="bad" live title="We could not create your account">
                  {error.message}
                </Banner>
              ) : null}

              <TextInput
                label="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                error={nameError}
                autoComplete="name"
                hint="Senders and recipients see this."
              />

              <PhoneInput
                label="Phone number"
                value={phone}
                onChange={setPhone}
                error={phoneError}
              />

              <PinInput
                label="Create a PIN"
                value={pin}
                onChange={setPin}
                error={pinError}
                showStrength
                autoComplete="new-password"
                hint="4 to 6 digits."
              />

              <PinInput
                label="Confirm PIN"
                value={confirmPin}
                onChange={setConfirmPin}
                error={matchError}
                autoComplete="new-password"
              />

              <TextInput
                label="What do you ride?"
                value={vehicle}
                onChange={(event) => setVehicle(event.target.value)}
                placeholder="Motorbike"
                maxLength={40}
              />

              <div>
                <span className="lbl" id="areas-label">
                  Which areas do you work?
                </span>
                {areas.loading ? (
                  <SkeletonCard lines={2} />
                ) : (
                  <div
                    className="row"
                    style={{ gap: 10 }}
                    role="group"
                    aria-labelledby="areas-label"
                  >
                    {(areas.data ?? []).map((area) => (
                      <Chip
                        key={area.id}
                        selected={areaIds.includes(area.id)}
                        onClick={() =>
                          setAreaIds((current) =>
                            current.includes(area.id)
                              ? current.filter((id) => id !== area.id)
                              : [...current, area.id],
                          )
                        }
                      >
                        {area.name}
                      </Chip>
                    ))}
                  </div>
                )}
                <div className="hint">
                  Senders in these areas see you first. You can change them
                  any time.
                </div>
                <div aria-live="polite">
                  {areaError ? (
                    <div className="emsg">
                      <span>{areaError}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <label className="consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <span>
                  I understand that a delivery is only complete once the
                  recipient enters their code, that only rated deliveries count
                  towards my score, and that recipients see my name.
                </span>
              </label>
              <div aria-live="polite">
                {consentError ? (
                  <div className="emsg">
                    <span>{consentError}</span>
                  </div>
                ) : null}
              </div>

              <Button type="submit" size="lg" block loading={pending}>
                Create my account
              </Button>

              <p className="cap tc">
                Already have an account?{' '}
                <Button variant="text" size="sm" to="/rider/login">
                  Log in
                </Button>
              </p>
            </form>
          </div>

          <aside className="s5 col" style={{ gap: 16 }}>
            <div className="card col" style={{ gap: 14 }}>
              <div className="h3">What a sender will see</div>
              <div className="row" style={{ gap: 14, flexWrap: 'nowrap' }}>
                <Avatar name={name || 'Your name'} size="lg" />
                <div>
                  <div className="b" style={{ fontSize: 20 }}>
                    {name || 'Your name'}
                  </div>
                  <div className="muted">{vehicle || 'Motorbike'}</div>
                </div>
                <ScoreBox score={null} band="new" />
              </div>
              <SourceLine>
                Your score shows after 3 rated deliveries. Until then senders
                see &ldquo;New&rdquo;, which is not held against you.
              </SourceLine>
            </div>

            <Banner tone="info" title="Getting verified">
              Confirming your phone is the first step. Uploading your licence
              and rider card for a person to check is the second, and it earns
              the &ldquo;Documents manually checked&rdquo; badge.
            </Banner>
          </aside>
        </div>
      </div>
    </Page>
  )
}
