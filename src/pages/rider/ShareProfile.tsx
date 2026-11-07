import { Page, PageHeader } from '../../components/Page'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { CopyLink } from '../../components/CopyLink'
import { SkeletonCard } from '../../components/Skeleton'
import { SourceLine, Stat } from '../../components/SourceLine'
import { TrustRing } from '../../components/ScoreRing'
import { useApi } from '../../lib/useApi'
import { trustSource } from '../../domain/score'
import * as api from '../../api/endpoints'

/**
 * Design: ShareProfile.dc.html
 *
 * The one link a rider sends to a lender, an insurer or a customer. It
 * always shows the live score rather than a snapshot, so there is nothing
 * dated to go stale and nothing to forge.
 */
export function ShareProfile() {
  const profile = useApi(() => api.myRiderProfile(), [])
  const explanation = useApi(
    () =>
      profile.data
        ? api.getRiderExplanation(profile.data.id)
        : Promise.resolve(null),
    [profile.data?.id],
  )

  if (profile.loading) {
    return (
      <Page>
        <div className="wrap col" style={{ gap: 24 }}>
          <SkeletonCard lines={4} />
        </div>
      </Page>
    )
  }

  if (!profile.data) {
    return (
      <Page>
        <div className="wrap">
          <div className="wide">
            <Banner
              tone="warn"
              title="Set up your rider profile first"
              actions={
                <Button size="sm" to="/rider/signup">
                  Set it up
                </Button>
              }
            >
              There is nothing to share until you have a vehicle and the areas
              you work.
            </Banner>
          </div>
        </div>
      </Page>
    )
  }

  const data = profile.data
  const link = `${window.location.origin}/r/${data.id}`

  return (
    <Page>
      <div className="wrap col" style={{ gap: 24 }}>
        <PageHeader title="Share my profile">
          <p className="muted">
            Send one link. Whoever opens it sees your score, what it is built
            from, and the ratings behind it, with no phone numbers in full.
          </p>
        </PageHeader>

        <div className="g12" style={{ alignItems: 'start' }}>
          <div className="s6 col" style={{ gap: 20 }}>
            <div className="card lg col" style={{ gap: 14 }}>
              <div className="h3">Your public profile link</div>
              <CopyLink
                value={link}
                label="Profile link"
                buttonVariant="primary"
                note="Always shows your latest score, so one link is enough forever."
              />
              <SourceLine>{trustSource(data.trust)}</SourceLine>
              <Button variant="text" size="sm" to={`/r/${data.id}`} style={{ alignSelf: 'flex-start', paddingLeft: 0 }}>
                Open it as a stranger would see it
              </Button>
            </div>

            <Banner tone="info" title="Why there is no dated certificate">
              A snapshot can be edited and goes out of date. This link reads
              Nelp&rsquo;s live record every time it is opened, so a lender is
              never looking at an old number.
            </Banner>
          </div>

          <div className="s6 col" style={{ gap: 12 }}>
            <div className="lab">Preview: what a lender sees</div>
            <div className="card lg col" style={{ gap: 18 }}>
              <div className="row" style={{ gap: 16, flexWrap: 'nowrap' }}>
                <Avatar name={data.display_name} size="lg" />
                <div className="col" style={{ gap: 4, flex: 1 }}>
                  <b style={{ fontSize: 20 }}>{data.display_name}</b>
                  <span className="muted">{data.vehicle_type}</span>
                  <Badge
                    tone={
                      data.verification.status === 'DOCUMENTS_MANUALLY_CHECKED'
                        ? 'ok'
                        : 'info'
                    }
                    icon="shield"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    {data.verification.label}
                  </Badge>
                </div>
                <TrustRing trust={data.trust} size={88} />
              </div>

              <div
                className="cards"
                style={{
                  gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
                  gap: 12,
                }}
              >
                <Stat
                  value={data.trust.completed_deliveries}
                  label="Completed deliveries"
                />
                <Stat value={data.trust.rated_bookings} label="Rated by customers" />
                <Stat
                  value={
                    data.trust.average_stars === null
                      ? '—'
                      : data.trust.average_stars.toFixed(1)
                  }
                  label="Average stars"
                />
                <Stat
                  value={data.trust.ratings_last_30_days}
                  label="Ratings in 30 days"
                />
              </div>

              {explanation.data ? (
                <div className="statebox col" style={{ gap: 6 }}>
                  <div className="b">In Nelp&rsquo;s words</div>
                  <p className="muted">{explanation.data.text}</p>
                </div>
              ) : null}

              <span className="cap">
                Preview only. The real page also lists the ratings behind each
                number.
              </span>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
