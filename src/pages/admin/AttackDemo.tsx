import { Page, PageHeader } from '../../components/Page'
import { Badge } from '../../components/Badge'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonCard } from '../../components/Skeleton'
import { SourceLine, Stat } from '../../components/SourceLine'
import { TrustRing } from '../../components/ScoreRing'
import { TrustEvidence } from '../../components/ScoreBreakdown'
import { useApi } from '../../lib/useApi'
import { trustSource } from '../../domain/score'
import * as api from '../../api/endpoints'

/**
 * Design: AttackDemo.dc.html
 *
 * The design generated a fake rider with 200 invented jobs. Nelp's API has
 * no endpoint for that, and inventing ratings locally would prove nothing
 * about the real scoring — so this page shows the real defences instead:
 * the abuse flags the API raises for a person to look at, and why a padded
 * history does not buy a high score.
 */
export function AttackDemo() {
  const flags = useApi(() => api.adminFlags(), [])
  const riders = useApi(() => api.listRiders({ sort: 'trust' }), [])

  const flagged = new Map<string, typeof flags.data>()
  for (const flag of flags.data ?? []) {
    const existing = flagged.get(flag.rider_id) ?? []
    flagged.set(flag.rider_id, [...(existing ?? []), flag])
  }

  const scored = (riders.data ?? []).filter((rider) => !rider.trust.is_new)
  const fresh = (riders.data ?? []).filter((rider) => rider.trust.is_new)

  return (
    <Page>
      <div className="wrap col" style={{ gap: 28 }}>
        <PageHeader title="Abuse review">
          <p className="muted" style={{ maxWidth: 720 }}>
            Patterns worth a person&rsquo;s attention, and what the score does
            about padding on its own.
          </p>
        </PageHeader>

        {flags.error ? (
          <Banner
            tone="bad"
            title={
              flags.error.status === 403 || flags.error.isUnauthorized
                ? 'This needs a staff account'
                : 'We could not load the flags'
            }
            actions={
              <Button size="sm" to="/admin/login">
                Admin log in
              </Button>
            }
          >
            {flags.error.message}
          </Banner>
        ) : null}

        <Banner tone="info" title="A flag is a prompt, not a punishment">
          Flags never change a score and never hide a rider. They exist so a
          person can look at an odd pattern and decide.
        </Banner>

        <section className="col" style={{ gap: 12 }}>
          <h2 className="h3">Flags raised</h2>
          {flags.loading ? (
            <SkeletonCard lines={3} />
          ) : (flags.data ?? []).length > 0 ? (
            <div className="col" style={{ gap: 10 }}>
              {(flags.data ?? []).map((flag, index) => (
                <Banner
                  key={`${flag.type}-${flag.rider_id}-${index}`}
                  tone="warn"
                  icon="flag"
                  title={flag.type.replace(/_/g, ' ').toLowerCase()}
                  actions={
                    <Button variant="secondary" size="sm" to={`/r/${flag.rider_id}`}>
                      Open the profile
                    </Button>
                  }
                >
                  {flag.detail}
                </Banner>
              ))}
              <SourceLine>
                {(flags.data ?? []).length} flag
                {(flags.data ?? []).length === 1 ? '' : 's'} across{' '}
                {flagged.size} rider{flagged.size === 1 ? '' : 's'}.
              </SourceLine>
            </div>
          ) : (
            <EmptyState title="Nothing flagged" icon="check">
              No rider currently shows a pattern worth a second look. Flags
              appear here as soon as one does.
            </EmptyState>
          )}
        </section>

        <section className="col" style={{ gap: 16 }}>
          <h2 className="h3">Why volume alone does not buy a score</h2>
          <div className="card col" style={{ gap: 14 }}>
            <p>
              A score is not an average of stars. Every rider starts weighted
              towards the middle, and that weighting only fades as real rated
              deliveries accumulate:
            </p>
            <pre
              className="statebox"
              style={{ margin: 0, overflowX: 'auto', fontSize: 14 }}
            >
{`adjusted = (sum of booking ratings + 5 x 3.5) / (rated bookings + 5)
score    = round(adjusted x 20)`}
            </pre>
            <p className="muted">
              So one five-star review scores 73, not 100. A rider with three
              five-star deliveries still scores 84. Padding a profile needs
              real bookings, each paid for and each confirmed by a recipient
              code — and a rating only counts once per delivery, however many
              people rate it.
            </p>
            <SourceLine>
              Below 3 rated deliveries the API withholds the score entirely
              and sends &ldquo;New&rdquo;, so a brand-new profile cannot show
              a number at all.
            </SourceLine>
          </div>
        </section>

        <section className="col" style={{ gap: 16 }}>
          <h2 className="h3">Every listed rider, by score</h2>
          {riders.loading ? (
            <SkeletonCard lines={4} />
          ) : (
            <>
              <div
                className="cards"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))',
                  gap: 20,
                  alignItems: 'start',
                }}
              >
                {scored.map((rider) => (
                  <div
                    key={rider.id}
                    className="card col"
                    style={{
                      gap: 16,
                      borderColor: flagged.has(rider.id) ? '#B0241C' : undefined,
                    }}
                  >
                    <div className="row sb">
                      <b style={{ fontSize: 18 }}>{rider.display_name}</b>
                      {flagged.has(rider.id) ? (
                        <Badge tone="bad" icon="flag">
                          Flagged
                        </Badge>
                      ) : (
                        <Badge tone="ok" icon="check">
                          No flags
                        </Badge>
                      )}
                    </div>
                    <div className="row" style={{ gap: 20, flexWrap: 'nowrap' }}>
                      <TrustRing trust={rider.trust} size={96} />
                      <SourceLine>{trustSource(rider.trust)}</SourceLine>
                    </div>
                    <TrustEvidence trust={rider.trust} />
                  </div>
                ))}
              </div>

              {fresh.length > 0 ? (
                <div className="card flat col" style={{ gap: 12 }}>
                  <div className="lab">Riders with no score yet</div>
                  <div
                    className="cards"
                    style={{
                      gridTemplateColumns: 'repeat(auto-fit,minmax(min(180px,100%),1fr))',
                      gap: 16,
                    }}
                  >
                    {fresh.map((rider) => (
                      <Stat
                        key={rider.id}
                        value={rider.trust.rated_bookings}
                        label={`${rider.display_name} · ratings so far`}
                      />
                    ))}
                  </div>
                  <SourceLine>
                    None of these can show a number until they reach 3 rated
                    deliveries.
                  </SourceLine>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </Page>
  )
}
