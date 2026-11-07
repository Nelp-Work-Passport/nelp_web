import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Page, PageHeader } from '../../components/Page'
import { Badge } from '../../components/Badge'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { CopyLink } from '../../components/CopyLink'
import { EmptyState } from '../../components/EmptyState'
import { KeyValue, SourceLine } from '../../components/SourceLine'
import { Modal } from '../../components/Modal'
import { SkeletonCard } from '../../components/Skeleton'
import { TextArea } from '../../components/TextInput'
import { SmsLinkFooter } from '../../layouts/SmsLinkLayout'
import {
  BookingStatusBadge,
  BookingTimeline,
} from '../../components/BookingStatusBadge'
import { useApi, useMutation } from '../../lib/useApi'
import { formatDateTime } from '../../lib/dates'
import { formatKes } from '../../domain/money'
import * as api from '../../api/endpoints'

/**
 * Design: RiderProgress.dc.html and RiderInvite.dc.html
 *
 * One job, with exactly one thing to do at each step: accept, collect, then
 * wait. The rider has no way to mark a job delivered — only the recipient's
 * code does that — and the page says so rather than leaving them hunting for
 * a button that does not exist.
 */
export function JobProgress() {
  const { id = '', token = '' } = useParams()
  const bookingId = id || token
  const booking = useApi(() => api.getBooking(bookingId), [bookingId])

  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')

  const accept = useMutation(api.acceptBooking)
  const decline = useMutation(api.declineBooking)
  const pickUp = useMutation(api.markPickedUp)
  const resend = useMutation(api.resendDeliveryCode)

  if (booking.loading) {
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

  if (booking.error || !booking.data) {
    return (
      <Page>
        <div className="wrap">
          <div className="narrowc col" style={{ gap: 20 }}>
            <EmptyState
              title="This link does not work"
              icon="error"
              actions={
                <>
                  <Button to="/rider/login">Log in to my dashboard</Button>
                  <Button variant="secondary" onClick={booking.reload}>
                    Try again
                  </Button>
                </>
              }
            >
              {booking.error?.isUnauthorized
                ? 'Log in as the rider for this job to open it.'
                : (booking.error?.message ??
                  'It may be mistyped, already taken, or no longer yours.')}
            </EmptyState>
            <SmsLinkFooter />
          </div>
        </div>
      </Page>
    )
  }

  const data = booking.data
  const earning = data.fare_minor - data.platform_fee_minor
  const smsFailed = data.delivery_code_sms === 'FAILED'
  const busy = accept.pending || decline.pending || pickUp.pending
  const actionError = accept.error ?? decline.error ?? pickUp.error

  const details = (
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
          key: 'item',
          label: 'Item',
          value: data.item_notes ?? 'Not described',
        },
        { key: 'sender', label: 'Sender', value: data.requester_name },
        {
          key: 'recipient',
          label: 'Recipient',
          value: data.recipient_phone,
        },
        {
          key: 'earn',
          label: 'You earn',
          note: `${formatKes(data.fare_minor)} fare, less Nelp's ${formatKes(data.platform_fee_minor)} fee`,
          value: formatKes(earning),
        },
      ]}
    />
  )

  return (
    <Page>
      <div className="wrap">
        <div className="narrowc col" style={{ gap: 20 }}>
          <PageHeader
            eyebrow={data.status === 'REQUESTED' ? 'New job for you' : 'Your job'}
            title={`${data.requester_name}'s delivery`}
            aside={<BookingStatusBadge status={data.status} />}
          />

          {actionError ? (
            <Banner tone="bad" live title="That did not work">
              {actionError.message}
            </Banner>
          ) : null}

          <div className="card lg col" style={{ gap: 18 }}>
            <BookingTimeline
              status={data.status}
              history={data.history}
              label="Delivery progress"
            />

            {data.status === 'REQUESTED' ? (
              <>
                <div>
                  <div className="b" style={{ fontSize: 20 }}>
                    Take this job?
                  </div>
                  <div className="muted">
                    Accepting reserves the time and texts the recipient their
                    tracking link and delivery code.
                  </div>
                </div>
                {details}
                <SourceLine>
                  {data.payment?.status === 'SUCCEEDED'
                    ? `${data.requester_name} has paid. Nelp holds it until the recipient confirms.`
                    : 'The sender has not paid yet. You will be told when they do.'}
                </SourceLine>
                <Button
                  variant="rdr"
                  size="lg"
                  block
                  loading={accept.pending}
                  onClick={async () => {
                    const next = await accept.run(data.id)
                    if (next) booking.reload()
                  }}
                >
                  Accept job
                </Button>
                <Button
                  variant="danger-o"
                  block
                  disabled={busy}
                  onClick={() => setDeclining(true)}
                >
                  Decline
                </Button>
              </>
            ) : data.status === 'ACCEPTED' ? (
              <>
                <div>
                  <div className="b" style={{ fontSize: 20 }}>
                    Collect the item
                  </div>
                  <div className="muted">
                    Tap collected once you have it, so the sender and recipient
                    can see you are on the way.
                  </div>
                </div>
                {details}
                <Button
                  variant="rdr"
                  size="lg"
                  block
                  loading={pickUp.pending}
                  onClick={async () => {
                    const next = await pickUp.run(data.id)
                    if (next) booking.reload()
                  }}
                >
                  I have collected it
                </Button>
              </>
            ) : data.status === 'PICKED_UP' ? (
              <>
                <div>
                  <div className="b" style={{ fontSize: 20 }}>
                    Waiting for the recipient&rsquo;s code
                  </div>
                  <div className="muted">
                    Nelp texted them a 6-digit code. Entering it is what marks
                    the delivery complete.
                  </div>
                </div>
                {details}
                <Banner tone="warn" title="You cannot confirm this job yourself">
                  That is the point of the code: the person who received the
                  item is the one who says it arrived. Ask them to open their
                  text, or to read you the code.
                </Banner>
                <Button
                  variant="secondary"
                  block
                  loading={resend.pending}
                  onClick={async () => {
                    const next = await resend.run(data.id)
                    if (next) booking.reload()
                  }}
                >
                  Resend the code text
                </Button>
              </>
            ) : data.status === 'DELIVERED' ? (
              <>
                <Banner tone="ok" title="Delivered and confirmed">
                  The recipient entered their code. This job now counts towards
                  your score, and{' '}
                  {formatKes(earning)} has been added to your balance.
                </Banner>
                {details}
                <Button variant="rdr" block to="/rider/dashboard">
                  Back to my dashboard
                </Button>
              </>
            ) : (
              <>
                <Banner
                  tone={data.status === 'DECLINED' ? 'neu' : 'warn'}
                  title={
                    data.status === 'DECLINED'
                      ? 'You declined this job'
                      : 'This job was cancelled'
                  }
                >
                  {data.status === 'DECLINED'
                    ? 'The sender can pick another rider. Nothing is held against your score.'
                    : (data.cancellation_reason ??
                      'The sender cancelled it. Nothing is held against your score.')}
                </Banner>
                <Button variant="rdr" block to="/rider/dashboard">
                  Back to my dashboard
                </Button>
              </>
            )}
          </div>

          {smsFailed ? (
            <div className="card col" style={{ gap: 12 }}>
              <Badge tone="warn" icon="alert" style={{ alignSelf: 'flex-start' }}>
                Text not delivered
              </Badge>
              <Banner tone="warn" title="SMS not delivered">
                The text to {data.recipient_phone} did not arrive. The delivery
                can carry on. Resend it, or share the tracking link yourself.
              </Banner>
              <CopyLink
                value={data.tracking_url}
                label="Tracking link"
                note="The recipient can follow the delivery from this link."
              />
              <Button
                loading={resend.pending}
                onClick={async () => {
                  const next = await resend.run(data.id)
                  if (next) booking.reload()
                }}
              >
                Resend SMS
              </Button>
            </div>
          ) : null}

          {resend.error ? (
            <Banner tone="bad" live title="We could not resend it">
              {resend.error.message}
            </Banner>
          ) : null}

          {data.contact_phones.requester || data.contact_phones.recipient ? (
            <div className="card col" style={{ gap: 10 }}>
              <div className="lab">Who to call</div>
              <KeyValue
                items={[
                  ...(data.contact_phones.requester
                    ? [
                        {
                          key: 'sender',
                          label: 'Sender',
                          value: data.contact_phones.requester,
                        },
                      ]
                    : []),
                  ...(data.contact_phones.recipient
                    ? [
                        {
                          key: 'recipient',
                          label: 'Recipient',
                          value: data.contact_phones.recipient,
                        },
                      ]
                    : []),
                ]}
              />
              <SourceLine>
                Shared only while the booking is active, and taken away again
                afterwards.
              </SourceLine>
            </div>
          ) : null}

          <Modal
            open={declining}
            onClose={() => setDeclining(false)}
            title="Decline this job?"
            actions={
              <>
                <Button
                  variant="danger"
                  loading={decline.pending}
                  onClick={async () => {
                    const next = await decline.run(
                      data.id,
                      reason.trim() || undefined,
                    )
                    if (next) {
                      setDeclining(false)
                      booking.reload()
                    }
                  }}
                >
                  Decline the job
                </Button>
                <Button variant="secondary" onClick={() => setDeclining(false)}>
                  Keep it
                </Button>
              </>
            }
          >
            <p className="muted">
              The sender is told so they can pick someone else. Declining is
              not held against your score.
            </p>
            <TextArea
              label="Reason"
              optional
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              hint="The sender reads this."
            />
          </Modal>

          <SmsLinkFooter />
        </div>
      </div>
    </Page>
  )
}
