import { Page, PageHeader } from '../../components/Page'
import { Badge } from '../../components/Badge'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonCard } from '../../components/Skeleton'
import { SourceLine, Stat } from '../../components/SourceLine'
import { Table } from '../../components/Table'
import { useApi } from '../../lib/useApi'
import { formatDateTime } from '../../lib/dates'
import { formatKes } from '../../domain/money'
import * as api from '../../api/endpoints'
import type { Booking } from '../../api/types'

/**
 * Design: Balance.dc.html
 *
 * What Nelp owes the rider, and the jobs it came from. The balance itself is
 * the API's figure; the table underneath is the delivered work behind it, so
 * the number is never a bare assertion.
 */
export function Balance() {
  const profile = useApi(() => api.myRiderProfile(), [])
  const jobs = useApi(() => api.listBookings({ role: 'rider', limit: 100 }), [])

  const delivered = (jobs.data ?? []).filter(
    (job) => job.status === 'DELIVERED',
  )
  const earned = delivered.reduce(
    (total, job) => total + job.fare_minor - job.platform_fee_minor,
    0,
  )
  const fees = delivered.reduce((total, job) => total + job.platform_fee_minor, 0)
  const balance = profile.data?.balance_minor ?? 0

  return (
    <Page>
      <div className="wrap col" style={{ gap: 24 }}>
        <PageHeader title="Balance" />

        {profile.error ? (
          <Banner
            tone="bad"
            title="We could not load your balance"
            actions={
              <Button size="sm" onClick={profile.reload}>
                Try again
              </Button>
            }
          >
            {profile.error.message}
          </Banner>
        ) : null}

        <div className="g12" style={{ alignItems: 'stretch' }}>
          <div className="s5 card lg col" style={{ gap: 10 }}>
            <div className="lab">Running balance</div>
            {profile.loading ? (
              <SkeletonCard lines={2} />
            ) : (
              <>
                <Stat
                  value={formatKes(balance)}
                  label={balance >= 0 ? 'Nelp owes you' : 'You owe Nelp'}
                />
                <Badge
                  tone={balance >= 0 ? 'ok' : 'warn'}
                  icon={balance >= 0 ? 'arrow-up' : 'arrow-down'}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {balance >= 0 ? 'Positive: Nelp owes you' : 'Negative: you owe Nelp'}
                </Badge>
                <SourceLine>
                  From {delivered.length} delivered{' '}
                  {delivered.length === 1 ? 'job' : 'jobs'}, after
                  Nelp&rsquo;s fee. Nelp pays it out; it is not something you
                  withdraw yourself.
                </SourceLine>
              </>
            )}
          </div>

          <div className="s7 card lg col" style={{ gap: 12 }}>
            <div className="h3">How your balance works</div>
            <p>
              A sender pays Nelp when they book. Nelp holds the money until the
              recipient confirms the delivery with their code.
            </p>
            <p>
              <b>On confirmation</b> the fare is split: your share goes to your
              balance, and Nelp keeps its fee.
            </p>
            <p className="muted">
              Nothing is added for a job that was requested, declined or
              cancelled, because no delivery happened.
            </p>
            {delivered.length > 0 ? (
              <SourceLine>
                {formatKes(earned)} earned, {formatKes(fees)} kept by Nelp
                across those jobs.
              </SourceLine>
            ) : null}
          </div>
        </div>

        <Table<Booking>
          caption="Delivered jobs behind this balance"
          rows={delivered}
          rowKey={(row) => row.id}
          loading={jobs.loading}
          minWidth={760}
          empty={
            <EmptyState title="No entries yet" icon="calendar">
              Your first confirmed delivery will show here.
            </EmptyState>
          }
          columns={[
            {
              key: 'when',
              header: 'Date',
              nowrap: true,
              cell: (row) => formatDateTime(row.scheduled_at),
            },
            {
              key: 'job',
              header: 'Job',
              cell: (row) =>
                `${row.pickup_area.name} to ${row.dropoff_area.name}`,
            },
            {
              key: 'fare',
              header: 'Fare',
              align: 'right',
              nowrap: true,
              cell: (row) => formatKes(row.fare_minor),
            },
            {
              key: 'fee',
              header: "Nelp's fee",
              align: 'right',
              nowrap: true,
              cell: (row) => (
                <span style={{ color: '#B0241C' }}>
                  {'− '}
                  {formatKes(row.platform_fee_minor)}
                </span>
              ),
            },
            {
              key: 'earn',
              header: 'Added to your balance',
              align: 'right',
              nowrap: true,
              cell: (row) => (
                <span style={{ color: '#17653A', fontWeight: 700 }}>
                  {'+ '}
                  {formatKes(row.fare_minor - row.platform_fee_minor)}
                </span>
              ),
            },
          ]}
        />

        <SourceLine>
          Only jobs booked through Nelp appear here.
        </SourceLine>
      </div>
    </Page>
  )
}
