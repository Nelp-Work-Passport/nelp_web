import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, PageHeader } from '../../components/Page'
import { Button } from '../../components/Button'
import { Banner } from '../../components/Banner'
import { Chip } from '../../components/Chip'
import { EmptyState } from '../../components/EmptyState'
import { RiderCard, RiderCardSkeleton } from '../../components/RiderCard'
import { SourceLine } from '../../components/SourceLine'
import { Tabs } from '../../components/Tabs'
import { useApi, useMutation } from '../../lib/useApi'
import { formatDateTime } from '../../lib/dates'
import { clearDraft, loadDraft, type BookingDraft } from '../../api/draft'
import * as api from '../../api/endpoints'
import type { Sort } from '../../api/types'

/**
 * Design: ChooseRider.dc.html
 *
 * Step two. The list is ranked by the API, and each row carries the score
 * with the line that says what it is built from — a rider with no score is
 * shown as new rather than hidden or scored zero.
 */
export function ChooseRider() {
  const navigate = useNavigate()
  const draft = loadDraft()

  const [sort, setSort] = useState<Sort>('trust')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [scored, setScored] = useState(false)

  const riders = useApi(
    () =>
      api.listRiders({
        area: draft?.pickup_area_id,
        time: draft?.scheduled_at ?? undefined,
        sort,
      }),
    [draft?.pickup_area_id, draft?.scheduled_at, sort],
  )

  const create = useMutation(api.createBooking)

  if (!draft) {
    return (
      <Page>
        <div className="wrap">
          <div className="wide">
            <EmptyState
              title="Start with the delivery details"
              icon="calendar"
              actions={<Button to="/sender/new">New booking</Button>}
            >
              We need the areas and the time before we can rank riders for it.
            </EmptyState>
          </div>
        </div>
      </Page>
    )
  }

  const all = riders.data ?? []
  const shown = all.filter((rider) => {
    if (onlyAvailable && !rider.available_now) return false
    if (scored && rider.trust.is_new) return false
    return true
  })

  async function choose(riderId: string, draft: BookingDraft) {
    const booking = await create.run({
      rider_id: riderId,
      pickup_area_id: draft.pickup_area_id,
      dropoff_area_id: draft.dropoff_area_id,
      scheduled_at: draft.scheduled_at ?? undefined,
      recipient_phone: draft.recipient_phone || undefined,
      item_notes: draft.item_notes || undefined,
    })
    if (booking) {
      clearDraft()
      navigate(`/sender/quote?booking=${booking.id}`)
    }
  }

  return (
    <Page>
      <div className="wrap col" style={{ gap: 24 }}>
        <PageHeader eyebrow="Step 2 of 3 · Rider" title="Choose a rider">
          <div className="card sm row sb" style={{ gap: 12 }}>
            <div className="row" style={{ gap: 10 }}>
              <b>
                {draft.pickupName} to {draft.dropoffName}
              </b>
              <span className="muted">
                {draft.scheduled_at
                  ? formatDateTime(draft.scheduled_at)
                  : 'As soon as possible'}
                {draft.item_notes ? ` · ${draft.item_notes}` : ''}
              </span>
            </div>
            <Button variant="text" size="sm" to="/sender/new">
              Edit details
            </Button>
          </div>
        </PageHeader>

        {create.error ? (
          <Banner tone="bad" live title="We could not make that booking">
            {create.error.message}
          </Banner>
        ) : null}

        <Tabs
          label="Sort riders"
          value={sort}
          onChange={setSort}
          items={[
            { id: 'trust', label: 'Best rated' },
            { id: 'availability', label: 'Free soonest' },
            { id: 'distance', label: 'Nearest' },
          ]}
        />

        <div className="row sb">
          <div className="row" style={{ gap: 10 }}>
            <Chip
              selected={onlyAvailable}
              onClick={() => setOnlyAvailable((on) => !on)}
            >
              Available now
            </Chip>
            <Chip selected={scored} onClick={() => setScored((on) => !on)}>
              Has a score
            </Chip>
          </div>
          <span className="cap">
            A score is out of 100 and always shows its source.
          </span>
        </div>

        {riders.error ? (
          <Banner
            tone="bad"
            title="We could not load riders"
            actions={
              <Button size="sm" onClick={riders.reload}>
                Try again
              </Button>
            }
          >
            {riders.error.message}
          </Banner>
        ) : null}

        <div className="col" style={{ gap: 16 }}>
          {riders.loading ? (
            <>
              <RiderCardSkeleton />
              <RiderCardSkeleton />
              <RiderCardSkeleton />
            </>
          ) : shown.length > 0 ? (
            <>
              {shown.map((rider) => (
                <RiderCard
                  key={rider.id}
                  rider={rider}
                  style={rider.available_now ? undefined : { background: '#F8F9F8' }}
                  action={
                    <div className="col" style={{ gap: 8 }}>
                      <Button
                        variant={rider.trust.is_new ? 'secondary' : 'primary'}
                        loading={create.pending}
                        onClick={() => void choose(rider.id, draft)}
                      >
                        Choose {firstWord(rider.display_name)}
                      </Button>
                      <Button variant="text" size="sm" to={`/r/${rider.id}`}>
                        See profile
                      </Button>
                    </div>
                  }
                />
              ))}
              <SourceLine>
                {shown.length} of {all.length} listed{' '}
                {all.length === 1 ? 'rider' : 'riders'}, ranked by Nelp.
              </SourceLine>
            </>
          ) : (
            <EmptyState
              title="No rider matches those filters"
              icon="search"
              actions={
                <>
                  <Button variant="secondary" to="/sender/new">
                    Change the time or area
                  </Button>
                  {onlyAvailable || scored ? (
                    <Button
                      variant="text"
                      onClick={() => {
                        setOnlyAvailable(false)
                        setScored(false)
                      }}
                    >
                      Clear the filters
                    </Button>
                  ) : null}
                </>
              }
            >
              Try a later time, a nearby area, or turn the filters off.
            </EmptyState>
          )}
        </div>
      </div>
    </Page>
  )
}

function firstWord(name: string): string {
  return name.trim().split(/\s+/)[0]
}
