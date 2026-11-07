import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Page, PageHeader } from '../../components/Page'
import { Avatar } from '../../components/Avatar'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { CodeInput } from '../../components/CodeInput'
import { EmptyState } from '../../components/EmptyState'
import { KeyValue, SourceLine } from '../../components/SourceLine'
import { SkeletonCard } from '../../components/Skeleton'
import { SmsLinkFooter } from '../../layouts/SmsLinkLayout'
import { useApi, useMutation } from '../../lib/useApi'
import { useAuth } from '../../state/useAuth'
import { formatDateTime } from '../../lib/dates'
import * as api from '../../api/endpoints'

/**
 * Design: ConfirmReceipt.dc.html, with the states from ReceiptStates.dc.html
 *
 * The code is what marks a delivery complete.
 *
 * One thing differs from the design on purpose. Nelp's API requires whoever
 * enters the code to be signed in and part of the booking — the sender, the
 * rider, or a recipient who happens to have a Nelp account. A recipient with
 * no account cannot submit it. So this page reads the public tracking link
 * for context, and is honest about who can finish the job: either the
 * recipient reads the code out, or they sign in. It does not pretend to
 * accept a code it cannot send.
 */
export function ConfirmReceipt() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [code, setCode] = useState('')
  const [done, setDone] = useState(false)

  const tracking = useApi(() => api.track(token), [token])

  // The tracking link carries no booking id, so a signed-in participant is
  // matched to their own booking by the same token.
  const mine = useApi(
    () => (user ? api.listBookings({ limit: 100 }) : Promise.resolve(null)),
    [user?.id],
  )
  const booking = (mine.data ?? []).find((item) =>
    item.tracking_url.endsWith(`/t/${token}`),
  )

  const confirm = useMutation(api.confirmDelivery)

  if (tracking.loading) {
    return (
      <Page>
        <div className="wrap">
          <div className="narrowc col" style={{ gap: 20 }}>
            <SkeletonCard lines={4} />
          </div>
        </div>
      </Page>
    )
  }

  if (tracking.error || !tracking.data) {
    return (
      <Page>
        <div className="wrap">
          <div className="narrowc col" style={{ gap: 20 }}>
            <EmptyState
              title="This link does not work"
              icon="error"
              actions={
                <Button variant="secondary" onClick={tracking.reload}>
                  Try again
                </Button>
              }
            >
              It may be mistyped or too old. Ask the sender to send it again.
            </EmptyState>
            <SmsLinkFooter />
          </div>
        </div>
      </Page>
    )
  }

  const data = tracking.data

  if (done || data.status === 'DELIVERED') {
    return (
      <Page>
        <div className="wrap">
          <div className="narrowc col" style={{ gap: 20 }}>
            <PageHeader eyebrow="Confirmed" title="Thank you. Receipt confirmed." />
            <div className="card lg col" style={{ gap: 14 }}>
              <Banner tone="ok" title="This delivery is complete">
                {data.rider_name}&rsquo;s work on this job now counts towards
                their trust score. Nothing more to do.
              </Banner>
              <Button variant="secondary" block to={`/t/${token}`}>
                See the delivery
              </Button>
            </div>
            <SmsLinkFooter />
          </div>
        </div>
      </Page>
    )
  }

  const notYetCollected = data.status === 'REQUESTED' || data.status === 'ACCEPTED'
  const ended = data.status === 'DECLINED' || data.status === 'CANCELLED'

  return (
    <Page>
      <div className="wrap">
        <div className="narrowc col" style={{ gap: 20 }}>
          <PageHeader
            eyebrow="Confirm you got it"
            title="Did you receive your item?"
          />

          <div className="card lg col" style={{ gap: 20 }}>
            <div className="row" style={{ gap: 14, flexWrap: 'nowrap' }}>
              <Avatar name={data.rider_name} size="lg" />
              <div className="col" style={{ gap: 2 }}>
                <div className="b" style={{ fontSize: 20 }}>
                  {data.rider_name}
                </div>
                <span className="muted">brought this delivery</span>
              </div>
            </div>

            <KeyValue
              items={[
                { key: 'from', label: 'From', value: data.pickup_area },
                { key: 'to', label: 'To', value: data.dropoff_area },
                {
                  key: 'when',
                  label: 'Pickup time',
                  value: formatDateTime(data.scheduled_at),
                },
              ]}
            />

            {ended ? (
              <Banner
                tone="warn"
                title={
                  data.status === 'DECLINED'
                    ? 'This job was declined'
                    : 'This delivery was cancelled'
                }
              >
                There is nothing to confirm.
              </Banner>
            ) : notYetCollected ? (
              <Banner tone="neu" title="Not collected yet">
                The rider has not picked the item up, so there is nothing to
                confirm yet. Your code works once it is on the way.
              </Banner>
            ) : booking ? (
              <>
                {confirm.error ? (
                  <Banner
                    tone="bad"
                    live
                    title={
                      confirm.error.code === 'CODE_LOCKED'
                        ? 'This code is locked'
                        : confirm.error.code === 'CODE_EXPIRED'
                          ? 'This code has expired'
                          : 'That code is not right'
                    }
                  >
                    {confirm.error.message}
                  </Banner>
                ) : null}

                <CodeInput
                  label="Enter the 6-digit code from your SMS"
                  value={code}
                  onChange={setCode}
                  length={6}
                  hint="Five wrong tries locks it. Ask for a resend rather than guessing."
                  onComplete={(value) => void submit(value)}
                  autoFocus
                />

                <Button
                  size="lg"
                  block
                  disabled={code.length !== 6}
                  loading={confirm.pending}
                  onClick={() => void submit(code)}
                >
                  Confirm I received it
                </Button>

                <p className="cap tc">
                  Only confirm if you are holding the item. This confirms the
                  rider&rsquo;s work and cannot be undone.
                </p>
              </>
            ) : user ? (
              <Banner tone="warn" title="This is not one of your bookings">
                You are signed in as {user.display_name}, who is not part of
                this delivery. Nelp only lets the sender, the rider or a
                recipient with an account enter the code.
              </Banner>
            ) : (
              <>
                <Banner tone="info" title="Who can enter the code">
                  Nelp needs whoever submits the code to be signed in and part
                  of this booking. If you have no Nelp account, read the
                  6-digit code from your text to the rider or the sender, and
                  they will enter it.
                </Banner>
                <Button
                  size="lg"
                  block
                  onClick={() => navigate('/sender/signin', { state: { from: `/c/${token}` } })}
                >
                  Sign in to enter it myself
                </Button>
                <SourceLine>
                  Reading the code out is safe: it only proves this delivery
                  arrived, and it works once.
                </SourceLine>
              </>
            )}
          </div>

          <SmsLinkFooter />
        </div>
      </div>
    </Page>
  )

  async function submit(value: string) {
    if (!booking) return
    const next = await confirm.run(booking.id, value)
    if (next) {
      setDone(true)
      setCode('')
    }
  }
}
