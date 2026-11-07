import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Page, PageHeader } from '../../components/Page'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { KeyValue, SourceLine } from '../../components/SourceLine'
import { SkeletonCard } from '../../components/Skeleton'
import { useApi, useMutation } from '../../lib/useApi'
import { formatDateTime } from '../../lib/dates'
import { formatKes } from '../../domain/money'
import * as api from '../../api/endpoints'
import type { Payment } from '../../api/types'

type Stage = 'review' | 'waiting' | 'done' | 'failed'

/**
 * Design: Quote.dc.html, with the payment states from MpesaStates.dc.html
 *
 * Step three. Payment is in two parts, as the API has it: an intent, then a
 * simulated outcome. The intent carries an idempotency key derived from the
 * booking, so pressing Pay twice cannot charge twice.
 *
 * Payments are simulated and every screen here says so.
 */
export function Quote() {
  const [params] = useSearchParams()
  const bookingId = params.get('booking') ?? ''
  const navigate = useNavigate()

  const [stage, setStage] = useState<Stage>('review')
  const [payment, setPayment] = useState<Payment | null>(null)

  const booking = useApi(
    () => (bookingId ? api.getBooking(bookingId) : Promise.resolve(null)),
    [bookingId],
  )

  const intent = useMutation(api.createPaymentIntent)
  const simulate = useMutation(api.simulatePayment)

  if (!bookingId) {
    return (
      <Page>
        <div className="wrap">
          <div className="wide">
            <EmptyState
              title="There is no booking to pay for"
              icon="calendar"
              actions={<Button to="/sender/new">Start a booking</Button>}
            >
              Choose a rider first, and we will bring you here to pay.
            </EmptyState>
          </div>
        </div>
      </Page>
    )
  }

  if (booking.loading) {
    return (
      <Page>
        <div className="wrap col" style={{ gap: 24 }}>
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </div>
      </Page>
    )
  }

  if (booking.error || !booking.data) {
    return (
      <Page>
        <div className="wrap">
          <div className="wide">
            <EmptyState
              title="We could not open that booking"
              icon="search"
              actions={
                <>
                  <Button onClick={booking.reload}>Try again</Button>
                  <Button variant="secondary" to="/sender/bookings">
                    My deliveries
                  </Button>
                </>
              }
            >
              {booking.error?.message ?? 'It may have been cancelled.'}
            </EmptyState>
          </div>
        </div>
      </Page>
    )
  }

  const data = booking.data
  const total = data.fare_minor
  const alreadyPaid = data.payment?.status === 'SUCCEEDED'

  async function pay() {
    setStage('waiting')
    // The key is derived from the booking, so a repeat press returns the
    // same payment rather than creating a second one.
    const created = await intent.run(bookingId, `booking-${bookingId}`)
    if (!created) {
      setStage('failed')
      return
    }
    setPayment(created)
    const settled = await simulate.run(created.id, 'SUCCEEDED')
    if (!settled) {
      setStage('failed')
      return
    }
    setPayment(settled)
    setStage(settled.status === 'SUCCEEDED' ? 'done' : 'failed')
  }

  async function failOnPurpose() {
    setStage('waiting')
    const created = await intent.run(bookingId, `booking-${bookingId}`)
    if (!created) {
      setStage('failed')
      return
    }
    const settled = await simulate.run(created.id, 'FAILED')
    setPayment(settled ?? created)
    setStage('failed')
  }

  return (
    <Page>
      <div className="wrap">
        <div className="g12" style={{ alignItems: 'start' }}>
          <div className="s7 col" style={{ gap: 24 }}>
            <PageHeader
              eyebrow="Step 3 of 3 · Quote and payment"
              title="Check the quote"
            />

            <div className="card col" style={{ gap: 16 }}>
              <div className="row" style={{ gap: 16, flexWrap: 'nowrap' }}>
                <Avatar name={data.rider.display_name} size="lg" />
                <div className="col" style={{ gap: 6, flex: 1 }}>
                  <div
                    className="row"
                    style={{ gap: 8, fontSize: 20, fontWeight: 700 }}
                  >
                    {data.rider.display_name}
                    {data.rider.is_demo ? (
                      <Badge tone="neu">Demo rider</Badge>
                    ) : null}
                  </div>
                  <span className="muted">
                    {data.pickup_area.name} to {data.dropoff_area.name}
                  </span>
                </div>
                <Button variant="text" size="sm" to={`/r/${data.rider.id}`}>
                  See profile
                </Button>
              </div>

              <hr className="hr" />

              <KeyValue
                items={[
                  {
                    key: 'route',
                    label: 'Route',
                    value: `${data.pickup_area.name} to ${data.dropoff_area.name}`,
                  },
                  {
                    key: 'when',
                    label: 'Pickup',
                    value: formatDateTime(data.scheduled_at),
                  },
                  {
                    key: 'ends',
                    label: 'Booked until',
                    note: 'A booking lasts 60 minutes',
                    value: formatDateTime(data.ends_at),
                  },
                  {
                    key: 'item',
                    label: 'Item',
                    value: data.item_notes ?? 'Not described',
                  },
                  {
                    key: 'recipient',
                    label: 'Recipient',
                    value: data.recipient_phone,
                  },
                ]}
              />
            </div>

            <div className="card col" style={{ gap: 14 }}>
              <div className="h3">Fare</div>
              <KeyValue
                items={[
                  {
                    key: 'fare',
                    label: 'Delivery fare',
                    note: 'Set by distance between areas',
                    value: formatKes(data.fare_minor),
                  },
                  {
                    key: 'fee',
                    label: "Nelp's fee",
                    note: 'Taken out of what the rider is paid, not added to your fare',
                    value: formatKes(data.platform_fee_minor),
                  },
                  {
                    key: 'rider',
                    label: 'The rider is paid',
                    value: formatKes(data.fare_minor - data.platform_fee_minor),
                  },
                ]}
              />
              <div className="kv" style={{ fontSize: 20 }}>
                <span className="b">To pay</span>
                <b>{formatKes(total)}</b>
              </div>
              <SourceLine>
                Quoted by Nelp from the distance between {data.pickup_area.name}{' '}
                and {data.dropoff_area.name}.
              </SourceLine>
            </div>

            <div className="card col" style={{ gap: 12 }}>
              <div className="h3">What happens after you pay</div>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <li>
                  {data.rider.display_name} is asked to accept the booking.
                </li>
                <li>
                  On accepting, Nelp texts the recipient a tracking link and a
                  6-digit delivery code.
                </li>
                <li>
                  The rider collects, then the recipient&rsquo;s code is what
                  marks it delivered.
                </li>
                <li>You rate the rider once it is delivered.</li>
              </ol>
              <SourceLine>
                The rider cannot mark their own job delivered. Only the
                recipient&rsquo;s code can.
              </SourceLine>
            </div>
          </div>

          <aside className="s5 col" style={{ gap: 16 }}>
            <div className="card col" style={{ gap: 14 }}>
              <div className="row sb">
                <div className="h3">Payment</div>
                <Badge tone="warn" icon="info">
                  Simulated
                </Badge>
              </div>

              <Banner tone="warn" title="Payments are simulated">
                No money moves. Nelp runs the same code a real provider would
                trigger, so the booking and the books behave exactly as they
                would in production.
              </Banner>

              {alreadyPaid || stage === 'done' ? (
                <>
                  <Banner tone="ok" live title="Payment received">
                    {formatKes(payment?.amount_minor ?? total)} paid.{' '}
                    {data.rider.display_name} has been asked to accept.
                  </Banner>
                  <Button
                    size="lg"
                    block
                    onClick={() => navigate(`/sender/bookings/${bookingId}`)}
                  >
                    View my booking
                  </Button>
                </>
              ) : stage === 'failed' ? (
                <>
                  <Banner tone="bad" live title="Payment did not go through">
                    {intent.error?.message ??
                      simulate.error?.message ??
                      'Nothing was charged. You can try again.'}
                  </Banner>
                  <Button size="lg" block onClick={() => void pay()}>
                    Try again
                  </Button>
                  <Button variant="secondary" block to="/sender/bookings">
                    Leave it for now
                  </Button>
                </>
              ) : (
                <>
                  <div className="kv" style={{ fontSize: 20 }}>
                    <span className="b">To pay</span>
                    <b>{formatKes(total)}</b>
                  </div>
                  <Button
                    size="lg"
                    block
                    loading={stage === 'waiting'}
                    onClick={() => void pay()}
                  >
                    {stage === 'waiting' ? 'Taking payment' : 'Pay and confirm booking'}
                  </Button>
                  <Button
                    variant="secondary"
                    block
                    disabled={stage === 'waiting'}
                    onClick={() => void failOnPurpose()}
                  >
                    Simulate a failed payment
                  </Button>
                  <p className="cap">
                    The second button is here so the failure path can be shown
                    on demand. It exists because payments are simulated.
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </Page>
  )
}
