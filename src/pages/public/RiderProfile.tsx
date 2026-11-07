import { useParams } from 'react-router-dom'
import { Page } from '../../components/Page'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonCard } from '../../components/Skeleton'
import { TrustRing } from '../../components/ScoreRing'
import { TrustEvidence } from '../../components/ScoreBreakdown'
import { SourceLine, Stat } from '../../components/SourceLine'
import { StarRating } from '../../components/StarRating'
import { VerificationBadge } from '../../components/RiderCard'
import { areaNames } from '../../lib/riders'
import { useApi } from '../../lib/useApi'
import { formatDay } from '../../lib/dates'
import { bandFor, bandLabel } from '../../domain/score'
import * as api from '../../api/endpoints'

/**
 * Design: Profile.dc.html, with the states from ProfileVariants.dc.html
 *
 * The public profile. Anyone with the link can read it, no account needed.
 * The score is never shown alone: the evidence panel underneath it carries
 * the counts it rests on, and the API's own written explanation.
 */
export function RiderProfile() {
  const { slug = '' } = useParams()
  const rider = useApi(() => api.getRider(slug), [slug])
  const reviews = useApi(() => api.getRiderReviews(slug), [slug])
  const explanation = useApi(() => api.getRiderExplanation(slug), [slug])

  if (rider.loading) {
    return (
      <Page>
        <div className="wrap col" style={{ gap: 24 }}>
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </div>
      </Page>
    )
  }

  if (rider.error || !rider.data) {
    return (
      <Page>
        <div className="wrap">
          <div className="wide">
            <EmptyState
              title="We could not find that rider"
              icon="search"
              actions={
                <>
                  <Button to="/verify">Verify a rider</Button>
                  <Button variant="secondary" onClick={rider.reload}>
                    Try again
                  </Button>
                </>
              }
            >
              {rider.error?.message ??
                'Check the link. A profile link looks like nelp.co/r/ and then the rider id.'}
            </EmptyState>
          </div>
        </div>
      </Page>
    )
  }

  const data = rider.data
  const trust = data.trust
  const band = bandFor(trust)

  return (
    <Page>
      <div className="wrap col" style={{ gap: 24 }}>
        <section className="card lg">
          <div className="g12" style={{ alignItems: 'center' }}>
            <div className="s8 col" style={{ gap: 16 }}>
              <div
                className="row"
                style={{ gap: 20, flexWrap: 'nowrap', alignItems: 'center' }}
              >
                <Avatar name={data.display_name} size="xl" />
                <div className="col" style={{ gap: 6, minWidth: 0 }}>
                  <div className="row" style={{ gap: 10 }}>
                    <h1 className="title">{data.display_name}</h1>
                    <VerificationBadge
                      status={data.verification.status}
                      label={data.verification.label}
                    />
                  </div>
                  <div className="muted">
                    {data.vehicle_type} · {areaNames(data)}
                  </div>
                  {data.is_demo ? (
                    <Badge tone="neu" style={{ alignSelf: 'flex-start' }}>
                      Demo rider
                    </Badge>
                  ) : null}
                </div>
              </div>

              {trust.is_new ? (
                <Banner tone="neu" title="Not enough ratings yet">
                  {data.display_name} has {trust.rated_bookings}{' '}
                  {trust.rated_bookings === 1 ? 'rating' : 'ratings'}. A score
                  shows after 3. This is not a bad sign. It only means the
                  history is new.
                </Banner>
              ) : (
                <p style={{ fontSize: 18, maxWidth: 640 }}>
                  {data.display_name} has{' '}
                  <b>{trust.completed_deliveries} completed deliveries</b> and{' '}
                  <b>{trust.rated_bookings} rated</b> by the people who booked or
                  received them
                  {trust.average_stars !== null ? (
                    <>
                      , averaging <b>{trust.average_stars.toFixed(1)} stars</b>
                    </>
                  ) : null}
                  . That record is what the score of {trust.trust_score} rests
                  on.
                </p>
              )}

              <div>
                <Button size="lg" to="/verify">
                  Verify this
                </Button>
              </div>
            </div>

            <div className="s4 col" style={{ alignItems: 'center', gap: 8 }}>
              <TrustRing trust={trust} size={168} bandFontSize={20} />
              <span className="cap">
                {trust.trust_score === null
                  ? bandLabel(band)
                  : `Out of 100 · ${bandLabel(band)}`}
              </span>
            </div>
          </div>
        </section>

        <div className="g12" style={{ alignItems: 'start' }}>
          <div className="s8 col" style={{ gap: 24 }}>
            <section className="card lg col" style={{ gap: 20 }}>
              <div className="col" style={{ gap: 4 }}>
                <h2 className="title" style={{ fontSize: 24 }}>
                  What the score is made of
                </h2>
                <p className="muted">
                  Nelp works the score out from ratings on completed
                  deliveries, with a starting allowance so one review cannot
                  make or break a rider.
                </p>
              </div>
              <TrustEvidence
                trust={trust}
                explanation={explanation.data?.text}
              />
            </section>

            <section className="card lg col" style={{ gap: 16 }}>
              <div className="col" style={{ gap: 4 }}>
                <h2 className="title" style={{ fontSize: 24 }}>
                  Recent ratings
                </h2>
                <p className="muted">
                  Ratings carry no author and no free text, so nobody can be
                  identified from them.
                </p>
              </div>

              {reviews.loading ? (
                <SkeletonCard lines={3} />
              ) : reviews.data && reviews.data.length > 0 ? (
                <div className="col" style={{ gap: 0 }}>
                  {reviews.data.map((review, index) => (
                    <div
                      key={`${review.created_at}-${index}`}
                      className="row sb"
                      style={{
                        padding: '14px 0',
                        borderBottom:
                          index === reviews.data!.length - 1
                            ? undefined
                            : '1px solid #DDE2DF',
                      }}
                    >
                      <div className="col" style={{ gap: 4 }}>
                        <StarRating
                          value={review.stars}
                          label={`${review.stars} of 5 stars`}
                          readOnly
                        />
                        <span className="cap">
                          {formatDay(review.created_at)}
                        </span>
                      </div>
                      <div className="row" style={{ gap: 8 }}>
                        {review.tags.map((tag) => (
                          <Badge key={tag} tone="neu">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No ratings yet" as="h3" style={{ padding: 24 }}>
                  Ratings appear here once a delivery has been confirmed and
                  rated.
                </EmptyState>
              )}
            </section>
          </div>

          <aside className="s4 col" style={{ gap: 24 }}>
            <section className="card col" style={{ gap: 10 }}>
              <div className="lab">Average rating</div>
              <Stat
                value={
                  trust.average_stars === null ? (
                    '—'
                  ) : (
                    <>
                      {trust.average_stars.toFixed(1)}{' '}
                      <span style={{ color: '#B87500' }}>{'★'}</span>
                    </>
                  )
                }
                label={`From ${trust.rated_bookings} ${
                  trust.rated_bookings === 1 ? 'rating' : 'ratings'
                }`}
              />
              <p className="cap">
                Shown separately from the trust score, which weighs the same
                ratings against how many there are.
              </p>
            </section>

            <section className="card col" style={{ gap: 10 }}>
              <div className="lab">Availability</div>
              <p className="muted">
                {data.available_now
                  ? 'Available now.'
                  : 'Not available right now.'}
              </p>
              {data.upcoming_slots.length > 0 ? (
                <SourceLine>
                  {data.upcoming_slots.length} upcoming{' '}
                  {data.upcoming_slots.length === 1 ? 'slot' : 'slots'} open.
                </SourceLine>
              ) : null}
            </section>

            <section className="card flat col" style={{ gap: 10 }}>
              <div className="h3">A score is not proof</div>
              <p className="muted">
                It summarises past feedback. A confirmed phone is not an
                identity check, so read the verification line as written.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </Page>
  )
}
