import { Page } from '../../components/Page'
import { Button } from '../../components/Button'
import { Avatar, AvatarIcon } from '../../components/Avatar'
import { RoleChip } from '../../components/RoleChip'
import { SourceLine } from '../../components/SourceLine'
import { TrustRing } from '../../components/ScoreRing'
import { Badge } from '../../components/Badge'
import { Skeleton } from '../../components/Skeleton'
import { useApi } from '../../lib/useApi'
import * as api from '../../api/endpoints'

/**
 * Design: Landing.dc.html
 *
 * The headline is split in two clauses, one per door: "Riders you can
 * check." leads to booking, "Work you can prove." leads to signing up as a
 * rider. The example profile at the bottom is a real rider from the API, so
 * the first thing a visitor sees is a live score and its source.
 */
export function Landing() {
  const { data, loading } = useApi(() => api.listRiders({ sort: 'trust' }), [])
  const example = data?.find((rider) => !rider.trust.is_new) ?? data?.[0] ?? null

  return (
    <Page bare>
      <section className="sec" style={{ paddingBottom: 48 }}>
        <div className="wrap col" style={{ gap: 32 }}>
          <div className="eyebrow">For Nairobi boda and delivery riders</div>
          <h1 className="display" style={{ margin: 0 }}>
            <span className="sr-only">
              Riders you can check. Work you can prove.
            </span>
          </h1>

          <div
            className="cards"
            style={{
              gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))',
              gap: 0,
              border: '1px solid #DDE2DF',
              borderRadius: 20,
              background: '#fff',
              overflow: 'hidden',
            }}
          >
            <div
              className="col"
              style={{
                gap: 20,
                padding: 32,
                borderTop: '6px solid #1B5C9E',
                justifyContent: 'space-between',
              }}
            >
              <div className="col" style={{ gap: 12 }}>
                <RoleChip role="sender" bare style={{ alignSelf: 'flex-start' }}>
                  SENDING SOMETHING
                </RoleChip>
                <div className="display" style={{ fontSize: 44 }} aria-hidden="true">
                  Riders you can check.
                </div>
                <p className="muted">
                  See each rider&rsquo;s trust score and the ratings behind it
                  before you book.
                </p>
              </div>
              <Button
                variant="snd"
                size="lg"
                to="/sender/signin"
                style={{ alignSelf: 'flex-start' }}
              >
                I need a delivery
              </Button>
            </div>

            <div
              className="col"
              style={{
                gap: 20,
                padding: 32,
                borderTop: '6px solid #0B5D4F',
                borderLeft: '1px solid #DDE2DF',
                justifyContent: 'space-between',
              }}
            >
              <div className="col" style={{ gap: 12 }}>
                <RoleChip role="rider" bare style={{ alignSelf: 'flex-start' }}>
                  RIDING
                </RoleChip>
                <div className="display" style={{ fontSize: 44 }} aria-hidden="true">
                  Work you can prove.
                </div>
                <p className="muted">
                  Every finished job is confirmed by the person who got it, and
                  builds a profile you own.
                </p>
              </div>
              <Button
                variant="rdr"
                size="lg"
                to="/rider/signup"
                style={{ alignSelf: 'flex-start' }}
              >
                I&rsquo;m a rider
              </Button>
            </div>
          </div>

          <p className="lead" style={{ maxWidth: 760 }}>
            Every finished delivery is confirmed by the customer who received
            it. That record is what you choose a rider by, and what a rider
            carries with them.
          </p>

          <div className="row">
            <Button variant="text" to="/verify">
              Verify a rider
            </Button>
            <span className="cap">Got a link from a rider? Check it here.</span>
          </div>
        </div>
      </section>

      <section
        className="sec"
        id="how"
        style={{
          background: '#fff',
          borderTop: '1px solid #DDE2DF',
          borderBottom: '1px solid #DDE2DF',
        }}
      >
        <div className="wrap col" style={{ gap: 32 }}>
          <div className="col" style={{ gap: 8 }}>
            <div className="eyebrow">How it works</div>
            <h2 className="title">Two tracks, one record.</h2>
          </div>
          <div
            className="cards"
            style={{
              gridTemplateColumns: 'repeat(auto-fit,minmax(min(380px,100%),1fr))',
              gap: 24,
              alignItems: 'stretch',
            }}
          >
            <Track
              title="Send something"
              role="sender"
              accent="#1B5C9E"
              action={
                <Button variant="snd" to="/sender/signin" style={{ alignSelf: 'flex-start' }}>
                  Book a rider
                </Button>
              }
              steps={[
                [
                  'Book a rider by trust score',
                  'Compare riders, each score shown with its source.',
                ],
                [
                  'Track the delivery',
                  'Your status page updates as the rider accepts, collects and delivers.',
                ],
                [
                  'Rate the rider',
                  'Once the recipient code is entered, you can rate the job.',
                ],
              ]}
            />
            <Track
              title="Ride with Nelp"
              role="rider"
              accent="#0B5D4F"
              action={
                <Button variant="rdr" to="/rider/signup" style={{ alignSelf: 'flex-start' }}>
                  Join as a rider
                </Button>
              }
              steps={[
                ['Finish jobs', 'Take jobs from a text or your dashboard. Free to join.'],
                [
                  'Customers confirm them',
                  'The recipient types a 6-digit code. Only then is a job delivered.',
                ],
                [
                  'Your score and profile grow',
                  'A score from 0 to 100 that shows how it was worked out.',
                ],
              ]}
            />
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="g12" style={{ alignItems: 'center' }}>
            <div className="s5 col" style={{ gap: 12 }}>
              <div className="eyebrow">What a profile looks like</div>
              <h2 className="title">Every number shows where it comes from.</h2>
              <p className="lead">
                Open a rider&rsquo;s profile to see the ratings a score rests
                on, how recent they are, and what people said.
              </p>
              <div>
                <Button
                  variant="secondary"
                  to={example ? `/r/${example.id}` : '/verify'}
                  disabled={!example}
                >
                  See an example profile
                </Button>
              </div>
            </div>

            <div className="s7">
              <div className="card lg">
                {loading ? (
                  <div className="row" style={{ gap: 24, flexWrap: 'nowrap' }}>
                    <Skeleton variant="circle" width={96} height={96} />
                    <div className="col" style={{ gap: 8, flex: 1 }}>
                      <Skeleton variant="heading" width="40%" />
                      <Skeleton width="70%" />
                    </div>
                    <Skeleton variant="circle" width={104} height={104} />
                  </div>
                ) : example ? (
                  <>
                    <div className="row" style={{ gap: 24, flexWrap: 'nowrap' }}>
                      <Avatar name={example.display_name} size="xl" />
                      <div className="col" style={{ gap: 6, flex: 1 }}>
                        <div className="row" style={{ gap: 8 }}>
                          <span className="h3" style={{ fontSize: 24 }}>
                            {example.display_name}
                          </span>
                          <Badge tone="info" icon="check">
                            {example.verification.label}
                          </Badge>
                        </div>
                        <div className="muted">
                          {example.vehicle_type}
                          {example.current_area ? ` · ${example.current_area.name}` : ''}
                        </div>
                        <SourceLine>
                          From {example.trust.rated_bookings} ratings and{' '}
                          {example.trust.completed_deliveries} completed
                          deliveries
                        </SourceLine>
                      </div>
                      <TrustRing trust={example.trust} size={104} />
                    </div>
                    {example.is_demo ? (
                      <Badge tone="neu" style={{ marginTop: 16 }}>
                        Demo rider
                      </Badge>
                    ) : null}
                  </>
                ) : (
                  <p className="muted">
                    No riders are listed yet. They appear here as soon as the
                    first one joins.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Page>
  )
}

function Track({
  title,
  role,
  accent,
  steps,
  action,
}: {
  title: string
  role: 'sender' | 'rider'
  accent: string
  steps: [string, string][]
  action: React.ReactNode
}) {
  return (
    <div className="card lg col" style={{ gap: 20, borderTop: `6px solid ${accent}` }}>
      <div className="row sb">
        <h3 className="h3" style={{ fontSize: 24 }}>
          {title}
        </h3>
        <RoleChip role={role} bare />
      </div>
      <div className="col" style={{ gap: 16 }}>
        {steps.map(([heading, body], index) => (
          <div
            className="row"
            key={heading}
            style={{ flexWrap: 'nowrap', gap: 14, alignItems: 'flex-start' }}
          >
            <AvatarIcon
              style={role === 'sender' ? { background: accent, color: '#fff' } : undefined}
            >
              {index + 1}
            </AvatarIcon>
            <div>
              <b>{heading}</b>
              <p className="muted">{body}</p>
            </div>
          </div>
        ))}
      </div>
      {action}
    </div>
  )
}
