import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Page, PageHeader } from '../../components/Page'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { CodeInput } from '../../components/CodeInput'
import { CopyLink } from '../../components/CopyLink'
import { DemoInbox } from '../../components/DemoInbox'
import { EmptyState } from '../../components/EmptyState'
import { KeyValue, SourceLine } from '../../components/SourceLine'
import { Modal } from '../../components/Modal'
import { SkeletonCard } from '../../components/Skeleton'
import { StarRating } from '../../components/StarRating'
import { TextArea } from '../../components/TextInput'
import {
  BookingStatusBadge,
  BookingTimeline,
} from '../../components/BookingStatusBadge'
import { useApi, useMutation } from '../../lib/useApi'
import { formatDateTime } from '../../lib/dates'
import { formatKes } from '../../domain/money'
import { starWord } from '../../domain/rating'
import * as api from '../../api/endpoints'
import type { RatingTag } from '../../api/types'

const TAGS: { id: RatingTag; label: string }[] = [
  { id: 'punctual', label: 'On time' },
  { id: 'careful', label: 'Careful' },
  { id: 'communicative', label: 'Good communication' },
]

/**
 * Design: BookingStatus.dc.html, with Rating.dc.html folded in
 *
 * One booking, start to finish. The sender can watch it, confirm it with the
 * recipient's code if the recipient hands the code over in person, resend
 * that code when the text failed, cancel, and rate it once delivered.
 */
export function BookingStatus() {
  const { id = '' } = useParams()
  const booking = useApi(() => api.getBooking(id), [id])

  const [code, setCode] = useState('')
  const [stars, setStars] = useState(0)
  const [tags, setTags] = useState<RatingTag[]>([])
  const [comment, setComment] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [reason, setReason] = useState('')
  const [rated, setRated] = useState(false)

  const confirm = useMutation(api.confirmDelivery)
  const resend = useMutation(api.resendDeliveryCode)
  const cancel = useMutation(api.cancelBooking)
  const rate = useMutation(api.rateBooking)

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
              {booking.error?.message ?? 'It may have been removed.'}
            </EmptyState>
          </div>
        </div>
      </Page>
    )
  }

  const data = booking.data
  const trackingToken = data.tracking_url.split('/t/')[1] ?? ''
  const smsFailed = data.delivery_code_sms === 'FAILED'
  const open = ['REQUESTED', 'ACCEPTED', 'PICKED_UP'].includes(data.status)

  return (
    <Page>
      <div className="wrap col" style={{ gap: 24 }}>
        <PageHeader
          back={
            <Button
              variant="text"
              size="sm"
              to="/sender/bookings"
              style={{ alignSelf: 'flex-start', paddingLeft: 0 }}
            >
              All deliveries
            </Button>
          }
          title={`${data.pickup_area.name} to ${data.dropoff_area.name}`}
          aside={<BookingStatusBadge status={data.status} />}
        >
          <p className="muted">
            {formatDateTime(data.scheduled_at)}
            {data.item_notes ? ` · ${data.item_notes}` : ''} ·{' '}
            {formatKes(data.fare_minor)}
            {data.payment
              ? ` · payment ${data.payment.status.toLowerCase()}`
              : ' · not paid yet'}
          </p>
        </PageHeader>

        <div className="card lg col" style={{ gap: 28 }}>
          <BookingTimeline status={data.status} history={data.history} />

          {data.status === 'REQUESTED' ? (
            <Banner tone="warn" title={`Waiting for ${data.rider.display_name} to accept`}>
              A request reserves nothing until the rider accepts. If they do
              not, you can choose another rider.
            </Banner>
          ) : data.status === 'DECLINED' ? (
            <Banner
              tone="warn"
              title={`${data.rider.display_name} could not take this job`}
              actions={
                <Button size="sm" to="/sender/new">
                  Choose another rider
                </Button>
              }
            >
              {data.history.find((h) => h.new_status === 'DECLINED')?.reason ??
                'No reason was given.'}
            </Banner>
          ) : data.status === 'DELIVERED' ? (
            <Banner tone="ok" title="Delivered and confirmed">
              The recipient entered their code, which is what marks a delivery
              complete. This job now counts on{' '}
              {data.rider.display_name}&rsquo;s profile.
            </Banner>
          ) : data.cancellation_pending ? (
            <Banner tone="warn" title="Cancellation waiting for review">
              You asked to cancel after the item was collected, so a person at
              Nelp is looking at it.
              {data.cancellation_reason
                ? ` Your reason: ${data.cancellation_reason}`
                : ''}
            </Banner>
          ) : null}

          {open ? (
            <div className="row end">
              <Button variant="secondary" onClick={() => setCancelling(true)}>
                Cancel booking
              </Button>
            </div>
          ) : null}
        </div>

        <div className="g12" style={{ alignItems: 'start' }}>
          <div
            className="s6 card row"
            style={{ gap: 16, flexWrap: 'nowrap' }}
          >
            <Avatar name={data.rider.display_name} size="lg" />
            <div className="col" style={{ gap: 4, flex: 1 }}>
              <div className="b" style={{ fontSize: 20 }}>
                {data.rider.display_name}
              </div>
              {data.rider.is_demo ? <Badge tone="neu">Demo rider</Badge> : null}
              {data.contact_phones.rider ? (
                <SourceLine>
                  Call the rider on {data.contact_phones.rider}. Shared only
                  while the booking is active.
                </SourceLine>
              ) : null}
            </div>
            <Button variant="secondary" size="sm" to={`/r/${data.rider.id}`}>
              Profile
            </Button>
          </div>

          <div className="s6 card">
            <KeyValue
              items={[
                {
                  key: 'recipient',
                  label: 'Recipient',
                  value: data.recipient_phone,
                },
                { key: 'fare', label: 'Fare', value: formatKes(data.fare_minor) },
                {
                  key: 'fee',
                  label: "Nelp's fee",
                  value: formatKes(data.platform_fee_minor),
                },
                {
                  key: 'payment',
                  label: 'Payment',
                  note: data.payment?.is_simulated ? 'Simulated' : undefined,
                  value: data.payment ? data.payment.status : 'Not paid',
                },
              ]}
            />
          </div>
        </div>

        {/* The code text, and what to do when it did not arrive. */}
        {data.status !== 'REQUESTED' && data.status !== 'DECLINED' ? (
          <section className="card lg col" style={{ gap: 14 }}>
            <div className="row sb">
              <h2 className="h3">The delivery code</h2>
              <Badge
                tone={
                  smsFailed
                    ? 'bad'
                    : data.delivery_code_sms === 'DELIVERED'
                      ? 'ok'
                      : 'neu'
                }
                icon={smsFailed ? 'alert' : 'info'}
              >
                {data.delivery_code_sms ?? 'Not sent yet'}
              </Badge>
            </div>
            <p className="muted">
              Nelp texted the recipient a 6-digit code when the rider
              accepted. Entering it is the only thing that marks the delivery
              complete, which is why a rider cannot close their own job.
            </p>

            {smsFailed ? (
              <>
                <Banner
                  tone="warn"
                  title="SMS not delivered"
                  actions={
                    <Button
                      size="sm"
                      loading={resend.pending}
                      onClick={async () => {
                        const next = await resend.run(data.id)
                        if (next) booking.reload()
                      }}
                    >
                      Resend
                    </Button>
                  }
                >
                  The text to {data.recipient_phone} did not arrive. The
                  delivery can carry on. Three resends are allowed.
                </Banner>
                <CopyLink
                  value={data.tracking_url}
                  label="Tracking link"
                  note="Copy the tracking link and send it to the recipient yourself."
                />
              </>
            ) : null}

            {resend.error ? (
              <Banner tone="bad" live title="We could not resend it">
                {resend.error.message}
              </Banner>
            ) : null}

            {data.status === 'PICKED_UP' || data.status === 'ACCEPTED' ? (
              <div className="col" style={{ gap: 12 }}>
                <hr className="hr" />
                <div className="lab">
                  Holding the item in front of you? Enter their code
                </div>
                {confirm.error ? (
                  <Banner tone="bad" live title="That code did not work">
                    {confirm.error.message}
                  </Banner>
                ) : null}
                <CodeInput
                  label="Recipient's 6-digit code"
                  value={code}
                  onChange={setCode}
                  length={6}
                  hint="Five wrong tries locks it. Ask for a resend instead of guessing."
                />
                <Button
                  disabled={code.length !== 6}
                  loading={confirm.pending}
                  onClick={async () => {
                    const next = await confirm.run(data.id, code)
                    if (next) {
                      setCode('')
                      booking.reload()
                    }
                  }}
                >
                  Confirm delivery
                </Button>
              </div>
            ) : null}

            <DemoInbox
              phone={data.recipient_phone}
              title="What the recipient was sent"
              quiet
            />
          </section>
        ) : null}

        {/* Rating, once the API says it is allowed. */}
        {data.can_rate && !rated ? (
          <section className="card lg col" style={{ gap: 20 }}>
            <div className="col" style={{ gap: 4 }}>
              <h2 className="h3">How was {data.rider.display_name}?</h2>
              <p className="muted">
                Your rating is what the trust score is built from, so it is
                worth a moment.
              </p>
            </div>

            {rate.error ? (
              <Banner tone="bad" live title="We could not save your rating">
                {rate.error.message}
              </Banner>
            ) : null}

            <div>
              <span className="lbl" id="rating-label">
                Your rating
              </span>
              <StarRating
                value={stars}
                onChange={setStars}
                label="Your rating"
              />
              <div className="cap" aria-live="polite">
                {stars > 0
                  ? `${stars} of 5 stars · ${starWord(stars)}`
                  : 'Choose between 1 and 5 stars'}
              </div>
            </div>

            <div>
              <span className="lbl">
                What went well? <span className="opt">(optional)</span>
              </span>
              <div className="row" style={{ gap: 10 }}>
                {TAGS.map((tag) => (
                  <Chip
                    key={tag.id}
                    selected={tags.includes(tag.id)}
                    onClick={() =>
                      setTags((current) =>
                        current.includes(tag.id)
                          ? current.filter((item) => item !== tag.id)
                          : current.length >= 3
                            ? current
                            : [...current, tag.id],
                      )
                    }
                  >
                    {tag.label}
                  </Chip>
                ))}
              </div>
              <div className="hint">Up to three.</div>
            </div>

            <TextArea
              label="Anything to add?"
              optional
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength={280}
              hint="Not shown on the public profile."
            />

            <Button
              size="lg"
              block
              disabled={stars === 0}
              loading={rate.pending}
              onClick={async () => {
                const result = await rate.run(
                  data.id,
                  stars,
                  tags,
                  comment.trim() || undefined,
                )
                if (result) {
                  setRated(true)
                  booking.reload()
                }
              }}
            >
              Submit rating
            </Button>
          </section>
        ) : rated ? (
          <Banner tone="ok" live title={`Thank you for rating ${data.rider.display_name}`}>
            Your rating is now part of their trust score.
          </Banner>
        ) : null}

        <Modal
          open={cancelling}
          onClose={() => setCancelling(false)}
          title="Cancel this booking?"
          actions={
            <>
              <Button
                variant="danger"
                loading={cancel.pending}
                disabled={data.status === 'PICKED_UP' && !reason.trim()}
                onClick={async () => {
                  const next = await cancel.run(data.id, reason.trim() || undefined)
                  if (next) {
                    setCancelling(false)
                    booking.reload()
                  }
                }}
              >
                Cancel the booking
              </Button>
              <Button variant="secondary" onClick={() => setCancelling(false)}>
                Keep it
              </Button>
            </>
          }
        >
          <p className="muted">
            {data.status === 'PICKED_UP'
              ? 'The item has already been collected, so a reason is needed and a person at Nelp will review it.'
              : 'The rider will be told. Nothing is charged for a booking that never ran.'}
          </p>
          {data.status === 'PICKED_UP' ? (
            <TextArea
              label="Why are you cancelling?"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              error={
                reason.trim() ? null : 'Write a short reason to cancel after collection.'
              }
            />
          ) : null}
          {cancel.error ? (
            <Banner tone="bad" live title="We could not cancel it">
              {cancel.error.message}
            </Banner>
          ) : null}
        </Modal>

        <SourceLine>
          Public tracking link: {trackingToken ? `/t/${trackingToken}` : 'not issued yet'}.
          It needs no account and shows no private detail.
        </SourceLine>
      </div>
    </Page>
  )
}
