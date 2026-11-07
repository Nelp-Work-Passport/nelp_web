import { Badge } from './Badge'
import { Timeline } from './Timeline'
import type { BookingStatus } from '../api/types'
import type { TimelineStep } from '../domain/steps'

/**
 * How a booking's state is shown.
 *
 * The API has six states, four of them a straight line and two that end it.
 * Each one gets words and an icon, never a colour on its own.
 */
export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  switch (status) {
    case 'REQUESTED':
      return (
        <Badge tone="warn" icon="clock">
          Waiting for the rider
        </Badge>
      )
    case 'ACCEPTED':
      return (
        <Badge tone="info" icon="check">
          Accepted
        </Badge>
      )
    case 'PICKED_UP':
      return (
        <Badge tone="info" icon="arrow-right">
          On the way
        </Badge>
      )
    case 'DELIVERED':
      return (
        <Badge tone="ok" icon="check">
          Delivered
        </Badge>
      )
    case 'DECLINED':
      return (
        <Badge tone="bad" icon="x-circle">
          Rider declined
        </Badge>
      )
    case 'CANCELLED':
      return (
        <Badge tone="neu" icon="x">
          Cancelled
        </Badge>
      )
  }
}

const LINE: { status: BookingStatus; label: string }[] = [
  { status: 'REQUESTED', label: 'Requested' },
  { status: 'ACCEPTED', label: 'Accepted' },
  { status: 'PICKED_UP', label: 'Collected' },
  { status: 'DELIVERED', label: 'Delivered' },
]

/**
 * The four steps of a booking, with the time each one happened.
 *
 * A declined or cancelled booking ends on the step it stopped at, drawn as a
 * failure rather than left looking merely unfinished.
 */
export function BookingTimeline({
  status,
  history,
  label = 'Booking progress',
}: {
  status: BookingStatus
  history: { new_status: BookingStatus; created_at: string }[]
  label?: string
}) {
  const at = new Map(
    history.map((entry) => [entry.new_status, entry.created_at]),
  )
  const reached = LINE.findIndex((step) => step.status === status)
  const ended = status === 'DECLINED' || status === 'CANCELLED'
  // Where the line stopped: the last step that actually happened.
  const lastDone = LINE.reduce(
    (found, step, index) => (at.has(step.status) ? index : found),
    -1,
  )

  const steps: TimelineStep[] = LINE.map((step, index) => {
    const when = at.get(step.status)
    const note = when ? timeOnly(when) : undefined
    const base = note ? { label: step.label, note } : { label: step.label }

    if (ended) {
      if (index <= lastDone) return { ...base, state: 'done' }
      if (index === lastDone + 1)
        return {
          label: status === 'DECLINED' ? 'Declined' : 'Cancelled',
          note: endedAt(history, status),
          state: 'fail',
        }
      return { ...base, state: 'todo' }
    }

    if (index < reached) return { ...base, state: 'done' }
    if (index === reached) {
      // A delivered booking is finished, not in progress.
      return { ...base, state: status === 'DELIVERED' ? 'done' : 'now' }
    }
    return { ...base, state: 'todo' }
  })

  return <Timeline label={label} steps={steps} />
}

function endedAt(
  history: { new_status: BookingStatus; created_at: string }[],
  status: BookingStatus,
): string | undefined {
  const entry = history.find((item) => item.new_status === status)
  return entry ? timeOnly(entry.created_at) : undefined
}

function timeOnly(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso))
}
