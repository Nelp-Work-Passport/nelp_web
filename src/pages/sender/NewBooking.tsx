import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, PageHeader } from '../../components/Page'
import { Button } from '../../components/Button'
import { Banner } from '../../components/Banner'
import { PhoneInput } from '../../components/PhoneInput'
import { Select, TextInput } from '../../components/TextInput'
import { PillOption } from '../../components/Chip'
import { KeyValue, SourceLine } from '../../components/SourceLine'
import { AvatarIcon } from '../../components/Avatar'
import { SkeletonCard } from '../../components/Skeleton'
import { useApi } from '../../lib/useApi'
import { fromLocalInputValue, toLocalInputValue } from '../../lib/dates'
import { formatKes } from '../../domain/money'
import { parsePhone, maskPhone } from '../../domain/phone'
import { saveDraft } from '../../api/draft'
import * as api from '../../api/endpoints'
import type { Area } from '../../api/types'

type When = 'now' | 'later'

/**
 * Design: NewBooking.dc.html
 *
 * Step one of three. Areas come from the API, and the fare is quoted from
 * the API as soon as both areas are chosen, so the price shown is the price
 * the booking will carry.
 */
export function NewBooking() {
  const navigate = useNavigate()
  const areas = useApi(() => api.listAreas(), [])

  // Null means "not chosen yet", which falls back to the first two areas
  // once they have loaded. Deriving it avoids an effect that writes state.
  const [pickupChoice, setPickup] = useState<string | null>(null)
  const [dropoffChoice, setDropoff] = useState<string | null>(null)
  const [when, setWhen] = useState<When>('now')
  const [at, setAt] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 45 * 60 * 1000)),
  )
  const [recipient, setRecipient] = useState('')
  const [item, setItem] = useState('')
  const [touched, setTouched] = useState(false)

  const names = useMemo(
    () => new Map((areas.data ?? []).map((area) => [area.id, area.name])),
    [areas.data],
  )

  const list = areas.data ?? []
  const pickup = pickupChoice ?? list[0]?.id ?? ''
  const dropoff = dropoffChoice ?? list[1]?.id ?? ''

  const sameArea = Boolean(pickup && dropoff && pickup === dropoff)

  const fare = useApi(
    () =>
      pickup && dropoff && !sameArea
        ? api.estimateFare(pickup, dropoff)
        : Promise.resolve(null),
    [pickup, dropoff, sameArea],
  )

  const parsedRecipient = recipient.trim() ? parsePhone(recipient) : null
  const recipientError =
    touched && parsedRecipient && !parsedRecipient.ok
      ? parsedRecipient.error
      : null

  // Checked on submit rather than during render: reading the clock while
  // rendering makes the output depend on when React happens to re-render.
  const [timeError, setTimeError] = useState<string | null>(null)

  const areaError = touched && sameArea ? 'Pick two different areas.' : null

  function submit(event: React.FormEvent) {
    event.preventDefault()
    setTouched(true)

    const past =
      when === 'later' && isInPast(at) ? 'Pick a time in the future.' : null
    setTimeError(past)

    if (!pickup || !dropoff || sameArea) return
    if (recipientError || past) return

    saveDraft({
      pickup_area_id: pickup,
      dropoff_area_id: dropoff,
      pickupName: names.get(pickup) ?? '',
      dropoffName: names.get(dropoff) ?? '',
      scheduled_at: when === 'now' ? null : fromLocalInputValue(at),
      recipient_phone: parsedRecipient?.ok ? parsedRecipient.e164 : '',
      item_notes: item.trim(),
    })
    navigate('/sender/choose')
  }

  const areaOptions = list.map((area) => area.name)

  return (
    <Page>
      <div className="wrap">
        <div className="g12" style={{ alignItems: 'start' }}>
          <div className="s8 col" style={{ gap: 24 }}>
            <PageHeader
              eyebrow="Step 1 of 3 · Details"
              title="Where is the item going?"
            />

            {areas.error ? (
              <Banner
                tone="bad"
                title="We could not load the areas"
                actions={
                  <Button size="sm" onClick={areas.reload}>
                    Try again
                  </Button>
                }
              >
                {areas.error.message}
              </Banner>
            ) : null}

            {areas.loading ? (
              <SkeletonCard lines={5} />
            ) : (
              <form className="card lg col" style={{ gap: 20 }} onSubmit={submit} noValidate>
                <div
                  className="cards"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))',
                    gap: 20,
                  }}
                >
                  <Select
                    label="Pickup area"
                    value={names.get(pickup) ?? ''}
                    onChange={(event) =>
                      setPickup(idFor(list, event.target.value))
                    }
                    options={areaOptions}
                  />
                  <Select
                    label="Drop-off area"
                    value={names.get(dropoff) ?? ''}
                    onChange={(event) =>
                      setDropoff(idFor(list, event.target.value))
                    }
                    options={areaOptions}
                    error={areaError}
                  />
                </div>

                <div>
                  <span className="lbl" id="when-label">
                    When?
                  </span>
                  <div
                    className="cards"
                    style={{
                      gridTemplateColumns: 'repeat(auto-fit,minmax(min(200px,100%),1fr))',
                      gap: 12,
                    }}
                    role="radiogroup"
                    aria-labelledby="when-label"
                  >
                    <PillOption
                      name="when"
                      title="Now"
                      description="Riders who are online"
                      selected={when === 'now'}
                      onSelect={() => setWhen('now')}
                    />
                    <PillOption
                      name="when"
                      title="Later today"
                      description="Needs an open slot"
                      selected={when === 'later'}
                      onSelect={() => setWhen('later')}
                    />
                  </div>
                </div>

                {when === 'later' ? (
                  <TextInput
                    label="Pickup time"
                    type="datetime-local"
                    value={at}
                    onChange={(event) => setAt(event.target.value)}
                    error={timeError}
                    hint="A booking lasts 60 minutes from the pickup time."
                  />
                ) : null}

                <PhoneInput
                  label="Recipient's phone number"
                  value={recipient}
                  onChange={setRecipient}
                  error={recipientError}
                  hint={
                    parsedRecipient?.ok
                      ? `They get the delivery code by SMS. We show it as ${maskPhone(parsedRecipient.e164)} from now on.`
                      : 'Leave it blank to use your own number. They get the delivery code by SMS.'
                  }
                />

                <TextInput
                  label="What are you sending?"
                  optional
                  value={item}
                  onChange={(event) => setItem(event.target.value)}
                  placeholder="Box of 6 shirts"
                  maxLength={280}
                />

                <Button type="submit" size="lg" block>
                  See riders
                </Button>
              </form>
            )}
          </div>

          <aside className="s4 col" style={{ gap: 16 }}>
            <div className="card col" style={{ gap: 14 }}>
              <div className="h3">Fare</div>
              {sameArea ? (
                <p className="muted">Pick two different areas for a quote.</p>
              ) : fare.loading ? (
                <SkeletonCard lines={2} />
              ) : fare.data ? (
                <>
                  <KeyValue
                    items={[
                      {
                        key: 'distance',
                        label: 'Distance',
                        value: `${fare.data.distance_km} km`,
                      },
                      {
                        key: 'fare',
                        label: 'Delivery fare',
                        note: 'Set by distance between areas',
                        value: formatKes(fare.data.fare_minor),
                      },
                      {
                        key: 'fee',
                        label: "Nelp's fee",
                        note: 'Taken out of what the rider is paid',
                        value: formatKes(fare.data.platform_fee_minor),
                      },
                      {
                        key: 'rider',
                        label: 'The rider earns',
                        value: formatKes(fare.data.rider_earning_minor),
                      },
                    ]}
                  />
                  <SourceLine>
                    Quoted by Nelp for {names.get(pickup)} to{' '}
                    {names.get(dropoff)}. {fare.data.is_estimate ? 'An estimate until you book.' : ''}
                  </SourceLine>
                </>
              ) : (
                <p className="muted">Choose both areas to see the fare.</p>
              )}
            </div>

            <div className="card col" style={{ gap: 14 }}>
              <div className="h3">What happens next</div>
              {[
                'Pick a rider from a list ranked by trust score.',
                'Pay, and the rider is asked to accept.',
                'Your recipient confirms with a 6-digit code. Then you rate the rider.',
              ].map((text, index) => (
                <div
                  key={text}
                  className="row"
                  style={{ gap: 12, flexWrap: 'nowrap', alignItems: 'flex-start' }}
                >
                  <AvatarIcon size="sm">{index + 1}</AvatarIcon>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <Banner tone="info" title="Phone numbers stay private">
              A rider sees the recipient&rsquo;s number only while the booking
              is active, and the public pages never show it in full.
            </Banner>
          </aside>
        </div>
      </div>
    </Page>
  )
}

/**
 * Whether a datetime-local value has already gone by.
 *
 * Kept outside the component because reading the clock during render would
 * make the output depend on when React happens to re-render.
 */
function isInPast(value: string): boolean {
  return new Date(value).getTime() <= Date.now()
}

/** The selects show area names; the API wants ids. */
function idFor(areas: Area[], name: string): string {
  return areas.find((area) => area.name === name)?.id ?? ''
}
