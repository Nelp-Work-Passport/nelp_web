import { useState } from 'react'
import { Page, PageHeader } from '../../components/Page'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { Table } from '../../components/Table'
import { Tabs } from '../../components/Tabs'
import { BookingStatusBadge } from '../../components/BookingStatusBadge'
import { useApi } from '../../lib/useApi'
import { formatDateTime } from '../../lib/dates'
import { formatKes } from '../../domain/money'
import * as api from '../../api/endpoints'
import type { Booking } from '../../api/types'

type Filter = 'all' | 'current' | 'past'

const CURRENT = new Set(['REQUESTED', 'ACCEPTED', 'PICKED_UP'])

/**
 * Design: MyBookings.dc.html
 *
 * Everything this sender has booked. A booking still in motion is separated
 * from one that is finished, because they need different things done to
 * them: one is watched, the other is rated or forgotten.
 */
export function MyBookings() {
  const [filter, setFilter] = useState<Filter>('all')
  const { data, loading, error, reload } = useApi(
    () => api.listBookings({ role: 'requester' }),
    [],
  )

  const all = data ?? []
  const current = all.filter((booking) => CURRENT.has(booking.status))
  const past = all.filter((booking) => !CURRENT.has(booking.status))
  const rows = filter === 'current' ? current : filter === 'past' ? past : all

  return (
    <Page>
      <div className="wrap col" style={{ gap: 24 }}>
        <PageHeader
          title="My deliveries"
          aside={<Button to="/sender/new">New booking</Button>}
        />

        {error ? (
          <Banner
            tone="bad"
            title="We could not load your deliveries"
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
          label="Deliveries"
          value={filter}
          onChange={setFilter}
          items={[
            { id: 'all', label: 'All', count: all.length },
            { id: 'current', label: 'Current', count: current.length },
            { id: 'past', label: 'Past', count: past.length },
          ]}
        />

        <Table<Booking>
          caption="My deliveries"
          rows={rows}
          rowKey={(row) => row.id}
          rowDim={(row) => row.status === 'CANCELLED' || row.status === 'DECLINED'}
          loading={loading}
          minWidth={760}
          empty={
            <EmptyState
              title={
                filter === 'current'
                  ? 'Nothing in progress'
                  : filter === 'past'
                    ? 'Nothing finished yet'
                    : 'No bookings yet'
              }
              icon="calendar"
              actions={<Button to="/sender/new">New booking</Button>}
            >
              Book your first delivery in about a minute.
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
              header: 'Route',
              cell: (row) => `${row.pickup_area.name} to ${row.dropoff_area.name}`,
            },
            {
              key: 'rider',
              header: 'Rider',
              cell: (row) => (
                <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
                  <Avatar name={row.rider.display_name} size="sm" />
                  {row.rider.display_name}
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              cell: (row) => (
                <div className="row" style={{ gap: 6 }}>
                  <BookingStatusBadge status={row.status} />
                  {row.can_rate ? <Badge tone="info">Rate the rider</Badge> : null}
                  {row.delivery_code_sms === 'FAILED' ? (
                    <Badge tone="warn" icon="alert">
                      SMS not delivered
                    </Badge>
                  ) : null}
                </div>
              ),
            },
            {
              key: 'total',
              header: 'Fare',
              align: 'right',
              nowrap: true,
              cell: (row) => formatKes(row.fare_minor),
            },
            {
              key: 'open',
              header: 'Open',
              headerHidden: true,
              cell: (row) => (
                <Button
                  variant={row.can_rate ? 'primary' : 'secondary'}
                  size="sm"
                  to={`/sender/bookings/${row.id}`}
                >
                  {row.can_rate ? 'Rate' : 'Open'}
                </Button>
              ),
            },
          ]}
        />
      </div>
    </Page>
  )
}
