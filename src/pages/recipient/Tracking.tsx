import { useParams } from 'react-router-dom'
import { Page, PageHeader } from '../../components/Page'
import { Avatar } from '../../components/Avatar'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { KeyValue, SourceLine } from '../../components/SourceLine'
import { SkeletonCard } from '../../components/Skeleton'
import { Timeline } from '../../components/Timeline'
import { SmsLinkFooter } from '../../layouts/SmsLinkLayout'
import { useApi } from '../../lib/useApi'
import { formatDateTime, formatRelativeDay } from '../../lib/dates'
import type { TimelineStep } from '../../domain/steps'
import * as api from '../../api/endpoints'
import type { BookingStatus } from '../../api/types'

/**
 * Design: RecipientTracking.dc.html
 *
 * Read-only, no account. The recipient has the link from a text and nothing
 * else, so this page shows progress and the rider's name — and deliberately
 * no phone numbers, fares or codes, because a tracking link can be forwarded
 * to anyone.
 */
export function Tracking() {
  const { token = '' } = useParams()
  const { data, loading, error, reload } = useApi(
    () => api.track(token),
    [token],
  )

  if (loading) {
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

  if (error || !data) {
    return (
      <Page>
        <div className="wrap">
          <div className="narrowc col" style={{ gap: 20 }}>
            <EmptyState
              title="This link does not work"
              icon="error"
              actions={
                <>
                  <Button variant="secondary" onClick={reload}>
                    Try again
                  </Button>
                  <Button variant="text" to="/">
                    What is Nelp?
                  </Button>
                </>
              }
            >
              It may be mistyped or too old. Ask the sender to share it again.
            </EmptyState>
            <SmsLinkFooter />
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div className="wrap">
        <div className="narrowc col" style={{ gap: 20 }}>
          <PageHeader
            eyebrow="Your delivery"
            title={headline(data.status, data.rider_name)}
          />

          <div className="card lg col" style={{ gap: 18 }}>
            <div className="row" style={{ gap: 14, flexWrap: 'nowrap' }}>
              <Avatar name={data.rider_name} size="lg" />
              <div className="col" style={{ gap: 4, flex: 1 }}>
                <div className="b" style={{ fontSize: 20 }}>
                  {data.rider_name}
                </div>
                <span className="muted">is bringing your delivery</span>
              </div>
            </div>

            <Timeline label="Delivery progress" steps={stepsFor(data.status)} />

            <KeyValue
              items={[
                {
                  key: 'from',
                  label: 'From',
                  value: data.pickup_area,
                },
                { key: 'to', label: 'To', value: data.dropoff_area },
                {
                  key: 'when',
                  label: 'Pickup time',
                  value: formatDateTime(data.scheduled_at),
                },
                {
                  key: 'updated',
                  label: 'Last update',
                  value: formatRelativeDay(data.updated_at),
                },
              ]}
            />

            {data.status === 'DELIVERED' ? (
              <Banner tone="ok" title="Confirmed">
                Thank you. You entered your code, so {data.rider_name}&rsquo;s
                work on this delivery now counts.
              </Banner>
            ) : data.status === 'PICKED_UP' ? (
              <Banner tone="info" title="On the way to you">
                You were texted a 6-digit code. Enter it when the delivery
                arrives, and only then.
              </Banner>
            ) : data.status === 'ACCEPTED' ? (
              <Banner tone="info" title="Accepted, not collected yet">
                {data.rider_name} has taken the job and is on the way to
                collect it.
              </Banner>
            ) : data.status === 'DECLINED' || data.status === 'CANCELLED' ? (
              <Banner
                tone="warn"
                title={
                  data.status === 'DECLINED'
                    ? 'The rider could not take this job'
                    : 'This delivery was cancelled'
                }
              >
                Nothing is coming on this booking. The sender will be in touch.
              </Banner>
            ) : (
              <Banner tone="neu" title="Waiting for a rider to accept">
                Nothing has been collected yet.
              </Banner>
            )}

            <Button
              variant="secondary"
              block
              to={`/c/${token}`}
              disabled={data.status !== 'PICKED_UP' && data.status !== 'ACCEPTED'}
            >
              I have it — enter my code
            </Button>

            <SourceLine>
              This page shows progress only. It carries no phone numbers,
              prices or codes, because the link can be forwarded to anyone.
            </SourceLine>
          </div>

          <SmsLinkFooter />
        </div>
      </div>
    </Page>
  )
}

function headline(status: BookingStatus, rider: string): string {
  switch (status) {
    case 'REQUESTED':
      return 'Waiting for a rider'
    case 'ACCEPTED':
      return `${rider} is on the way to collect`
    case 'PICKED_UP':
      return `${rider} is on the way to you`
    case 'DELIVERED':
      return 'Delivered and confirmed'
    case 'DECLINED':
      return 'This job was declined'
    case 'CANCELLED':
      return 'This delivery was cancelled'
  }
}

const LINE: BookingStatus[] = ['REQUESTED', 'ACCEPTED', 'PICKED_UP', 'DELIVERED']
const LABELS = ['Booked', 'Accepted', 'On the way', 'Confirmed']

function stepsFor(status: BookingStatus): TimelineStep[] {
  const ended = status === 'DECLINED' || status === 'CANCELLED'
  const reached = LINE.indexOf(status)
  return LABELS.map((label, index) => {
    if (ended) {
      if (index === 0) return { label, state: 'done' }
      if (index === 1)
        return {
          label: status === 'DECLINED' ? 'Declined' : 'Cancelled',
          state: 'fail',
        }
      return { label, state: 'todo' }
    }
    if (index < reached) return { label, state: 'done' }
    if (index === reached) {
      return { label, state: status === 'DELIVERED' ? 'done' : 'now' }
    }
    return { label, state: 'todo' }
  })
}
