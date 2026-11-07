import { Page, PageHeader } from '../../components/Page'
import { Badge } from '../../components/Badge'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { Select } from '../../components/TextInput'
import { SkeletonCard } from '../../components/Skeleton'
import { SourceLine, Stat } from '../../components/SourceLine'
import { Toggle } from '../../components/Chip'
import { TrustRing } from '../../components/ScoreRing'
import { BookingStatusBadge } from '../../components/BookingStatusBadge'
import { useApi, useMutation } from '../../lib/useApi'
import { formatDateTime, formatRelativeDay } from '../../lib/dates'
import { formatKes } from '../../domain/money'
import { trustSource } from '../../domain/score'
import * as api from '../../api/endpoints'

/**
 * Design: Dashboard.dc.html
 *
 * A rider's home. The one thing they change from anywhere is whether they
 * are bookable, so the switch is the first control on the page. Everything
 * else is the work in front of them and what their record is worth.
 */
export function RiderDashboard() {
  const profile = useApi(() => api.myRiderProfile(), [])
  const jobs = useApi(() => api.listBookings({ role: 'rider' }), [])
  const areas = useApi(() => api.listAreas(), [])

  const availability = useMutation(api.setAvailability)

  if (profile.loading) {
    return (
      <Page>
        <div className="wrap col" style={{ gap: 24 }}>
          <SkeletonCard lines={3} />
          <SkeletonCard lines={4} />
        </div>
      </Page>
    )
  }

  // A rider account with no profile yet cannot be booked, so say that
  // plainly rather than showing an empty dashboard.
  if (profile.error?.code === 'NO_PROFILE' || (!profile.data && profile.error)) {
    return (
      <Page>
        <div className="wrap">
          <div className="wide">
            <EmptyState
              title="Finish your rider profile"
              icon="info"
              actions={<Button to="/rider/signup">Set up my profile</Button>}
            >
              Senders can only find you once you have set a vehicle and the
              areas you work.
            </EmptyState>
          </div>
        </div>
      </Page>
    )
  }

  const data = profile.data
  if (!data) return null

  const list = jobs.data ?? []
  const waiting = list.filter((job) => job.status === 'REQUESTED')
  const active = list.filter((job) =>
    ['ACCEPTED', 'PICKED_UP'].includes(job.status),
  )
  const today = list.filter((job) => isToday(job.scheduled_at))

  return (
    <Page>
      <div className="wrap col" style={{ gap: 24 }}>
        <PageHeader
          title={`Hello, ${firstWord(data.display_name)}`}
          aside={
            <Button to="/rider/jobs" variant="secondary">
              All my jobs
            </Button>
          }
        >
          <p className="muted">{new Date().toDateString()}</p>
        </PageHeader>

        {waiting.length > 0 ? (
          <Banner
            tone="info"
            live
            title={`${waiting.length} ${waiting.length === 1 ? 'request is' : 'requests are'} waiting for you`}
            actions={
              <Button size="sm" to={`/rider/job/${waiting[0].id}`}>
                Open the first
              </Button>
            }
          >
            Accepting reserves the time. A request on its own reserves nothing,
            so a sender may pick someone else while it sits here.
          </Banner>
        ) : null}

        <div className="g12" style={{ alignItems: 'start' }}>
          <div className="s8 col" style={{ gap: 24 }}>
            <div className="card col" style={{ gap: 20 }}>
              <div className="row sb">
                <div className="tgl-row">
                  <Toggle
                    on={data.available_now}
                    label="Available for bookings now"
                    disabled={availability.pending}
                    onChange={async (next) => {
                      const updated = await availability.run({ is_available: next })
                      if (updated) profile.reload()
                    }}
                  />
                  <span style={{ fontSize: 20 }}>
                    {data.available_now ? 'Online' : 'Offline'}
                  </span>
                </div>
                <span className="cap">
                  {data.available_now
                    ? 'Senders booking for now can see you.'
                    : 'You will not appear for bookings made for now.'}
                </span>
              </div>

              {availability.error ? (
                <Banner tone="bad" live title="We could not change that">
                  {availability.error.message}
                </Banner>
              ) : null}

              <hr className="hr" />

              <div
                className="cards"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(260px,100%),1fr))',
                  gap: 16,
                  alignItems: 'end',
                }}
              >
                <Select
                  label="Where are you now?"
                  value={data.current_area?.name ?? ''}
                  options={[
                    ...(data.current_area ? [] : ['Not set']),
                    ...(areas.data ?? []).map((area) => area.name),
                  ]}
                  onChange={async (event) => {
                    const match = (areas.data ?? []).find(
                      (area) => area.name === event.target.value,
                    )
                    if (!match) return
                    const updated = await availability.run({
                      current_area_id: match.id,
                    })
                    if (updated) profile.reload()
                  }}
                />
                <span className="cap">
                  Senders in this area see you first when they book for now.
                </span>
              </div>

              <SourceLine>
                You work{' '}
                {data.service_areas.map((area) => area.name).join(', ') ||
                  'no areas yet'}
                .
              </SourceLine>
            </div>

            <div className="card col" style={{ gap: 16 }}>
              <div className="row sb">
                <h2 className="h3">Your work right now</h2>
                <Button variant="text" size="sm" to="/rider/jobs">
                  All jobs
                </Button>
              </div>

              {jobs.loading ? (
                <SkeletonCard lines={3} />
              ) : active.length + waiting.length > 0 ? (
                <div className="col" style={{ gap: 0 }}>
                  {[...waiting, ...active].map((job, index, shown) => (
                    <div
                      key={job.id}
                      className="row sb"
                      style={{
                        padding: '14px 0',
                        borderBottom:
                          index === shown.length - 1
                            ? undefined
                            : '1px solid #DDE2DF',
                      }}
                    >
                      <div className="col" style={{ gap: 2 }}>
                        <b>
                          {job.pickup_area.name} to {job.dropoff_area.name}
                        </b>
                        <span className="muted">
                          {formatDateTime(job.scheduled_at)} ·{' '}
                          {job.requester_name} ·{' '}
                          {formatKes(job.fare_minor - job.platform_fee_minor)} to
                          you
                        </span>
                      </div>
                      <div className="row" style={{ gap: 8 }}>
                        <BookingStatusBadge status={job.status} />
                        <Button size="sm" to={`/rider/job/${job.id}`}>
                          Open
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No jobs waiting" as="h3" style={{ padding: 24 }}>
                  Stay online and requests will appear here and by text.
                </EmptyState>
              )}
            </div>
          </div>

          <aside className="s4 col" style={{ gap: 24 }}>
            <div
              className="card col"
              style={{ gap: 14, alignItems: 'center', textAlign: 'center' }}
            >
              <div className="lab">Your trust score</div>
              <TrustRing trust={data.trust} size={136} bandFontSize={18} />
              <SourceLine style={{ textAlign: 'left' }}>
                {trustSource(data.trust)}
              </SourceLine>
              <Button variant="secondary" size="sm" to={`/r/${data.id}`}>
                See my public profile
              </Button>
            </div>

            <div className="card col" style={{ gap: 8 }}>
              <div className="lab">Balance</div>
              <Stat
                value={formatKes(data.balance_minor)}
                label="Nelp owes you"
              />
              <SourceLine>
                From {data.trust.completed_deliveries} completed{' '}
                {data.trust.completed_deliveries === 1 ? 'delivery' : 'deliveries'},
                after Nelp&rsquo;s fee.
              </SourceLine>
              <Button
                variant="text"
                size="sm"
                to="/rider/balance"
                style={{ alignSelf: 'flex-start', paddingLeft: 0 }}
              >
                See the entries
              </Button>
            </div>

            <div className="card col" style={{ gap: 10 }}>
              <div className="lab">Verification</div>
              <Badge
                tone={
                  data.verification.status === 'DOCUMENTS_MANUALLY_CHECKED'
                    ? 'ok'
                    : data.verification.status === 'PHONE_CONFIRMED'
                      ? 'info'
                      : 'neu'
                }
                icon="shield"
                style={{ alignSelf: 'flex-start' }}
              >
                {data.verification.label}
              </Badge>
              {data.verification.status !== 'DOCUMENTS_MANUALLY_CHECKED' ? (
                <Button variant="secondary" size="sm" to="/rider/verification">
                  Send my documents
                </Button>
              ) : null}
            </div>

            {today.length > 0 ? (
              <div className="card flat col" style={{ gap: 6 }}>
                <div className="lab">Today</div>
                <span className="muted">
                  {today.length} {today.length === 1 ? 'job' : 'jobs'}, latest{' '}
                  {formatRelativeDay(today[0].scheduled_at)}.
                </span>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </Page>
  )
}

function firstWord(name: string): string {
  return name.trim().split(/\s+/)[0]
}

function isToday(iso: string): boolean {
  const date = new Date(iso)
  const now = new Date()
  return date.toDateString() === now.toDateString()
}
