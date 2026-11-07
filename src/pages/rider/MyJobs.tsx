import { useState } from 'react'
import { Page, PageHeader } from '../../components/Page'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { SourceLine } from '../../components/SourceLine'
import { Table } from '../../components/Table'
import { Tabs } from '../../components/Tabs'
import { BookingStatusBadge } from '../../components/BookingStatusBadge'
import { useApi } from '../../lib/useApi'
import { formatDateTime } from '../../lib/dates'
import { formatKes } from '../../domain/money'
import * as api from '../../api/endpoints'
import type { Booking } from '../../api/types'

type Filter = 'all' | 'delivered' | 'open' | 'ended'

/**
 * Design: MyJobs.dc.html
 *
 * The rider's own record. Only a delivered job counts towards a score, and
 * the banner says so, because a long list of declined and cancelled jobs
 * could otherwise look like work.
 */
export function MyJobs() {
  const [filter, setFilter] = useState<Filter>('all')
  const { data, loading, error, reload } = useApi(
    () => api.listBookings({ role: 'rider', limit: 100 }),
    [],
  )

  const all = data ?? []
  const delivered = all.filter((job) => job.status === 'DELIVERED')
  const open = all.filter((job) =>
    ['REQUESTED', 'ACCEPTED', 'PICKED_UP'].includes(job.status),
  )
  const ended = all.filter((job) =>
    ['DECLINED', 'CANCELLED'].includes(job.status),
  )

  const rows =
    filter === 'delivered'
      ? delivered
      : filter === 'open'
        ? open
        : filter === 'ended'
          ? ended
          : all

  const earned = delivered.reduce(
    (total, job) => total + job.fare_minor - job.platform_fee_minor,
    0,
  )

  return (
    <Page>
      <div className="wrap col" style={{ gap: 24 }}>
        <PageHeader
          title="My jobs"
          aside={
            <Button variant="secondary" to="/rider/dashboard">
              Dashboard
            </Button>
          }
        />

        <Banner tone="info" title="Only delivered jobs count">
          A job counts towards your score once the recipient enters their
          6-digit code. Requested, declined and cancelled jobs do not.
        </Banner>

        {error ? (
          <Banner
            tone="bad"
            title="We could not load your jobs"
            actions={
              <Button size="sm" onClick={reload}>
                Try again
              </Button>
            }
          >
            {error.message}
          </Banner>
        ) : null}

        <Tabs
          label="Jobs"
          value={filter}
          onChange={setFilter}
          items={[
            { id: 'all', label: 'All', count: all.length },
            { id: 'delivered', label: 'Delivered', count: delivered.length },
            { id: 'open', label: 'In progress', count: open.length },
            { id: 'ended', label: 'Not completed', count: ended.length },
          ]}
        />

        <Table<Booking>
          caption="My jobs"
          rows={rows}
          rowKey={(row) => row.id}
          rowDim={(row) => ['DECLINED', 'CANCELLED'].includes(row.status)}
          loading={loading}
          minWidth={820}
          empty={
            <EmptyState title="Nothing here yet" icon="calendar">
              Jobs appear here as soon as a sender books you.
            </EmptyState>
          }
          columns={[
            {
              key: 'when',
              header: 'Pickup',
              nowrap: true,
              cell: (row) => formatDateTime(row.scheduled_at),
            },
            {
              key: 'route',
              header: 'Job',
              cell: (row) =>
                `${row.pickup_area.name} to ${row.dropoff_area.name}`,
            },
            {
              key: 'recipient',
              header: 'Recipient',
              nowrap: true,
              cell: (row) => row.recipient_phone,
            },
            {
              key: 'status',
              header: 'Status',
              cell: (row) => <BookingStatusBadge status={row.status} />,
            },
            {
              key: 'earn',
              header: 'You earn',
              align: 'right',
              nowrap: true,
              cell: (row) =>
                row.status === 'DELIVERED'
                  ? formatKes(row.fare_minor - row.platform_fee_minor)
                  : '—',
            },
            {
              key: 'open',
              header: 'Open',
              headerHidden: true,
              cell: (row) => (
                <Button variant="secondary" size="sm" to={`/rider/job/${row.id}`}>
                  Open
                </Button>
              ),
            },
          ]}
        />

        {delivered.length > 0 ? (
          <SourceLine>
            {delivered.length} delivered{' '}
            {delivered.length === 1 ? 'job' : 'jobs'} out of {all.length},
            earning {formatKes(earned)} after Nelp&rsquo;s fee. These are the
            jobs anyone sees counted on your public profile.
          </SourceLine>
        ) : null}
      </div>
    </Page>
  )
}
