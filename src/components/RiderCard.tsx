import { cx } from '../lib/cx'
import type { RiderListItem } from '../api/types'
import { trustSource } from '../domain/score'
import { areaNames, avatarVariant } from '../lib/riders'
import { Avatar } from './Avatar'
import { Badge } from './Badge'
import { TrustRing } from './ScoreRing'
import { Skeleton } from './Skeleton'
import { SourceLine } from './SourceLine'

export interface RiderCardProps {
  rider: RiderListItem
  /** The one action for this rider. */
  action?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * A rider in a list: name, what the API says about their verification and
 * availability, the score ring, and one action.
 *
 * The score never appears without the line saying what it is built from, and
 * a demo rider is always labelled as one.
 */
export function RiderCard({ rider, action, className, style }: RiderCardProps) {
  return (
    <div className={cx('card rc', className)} style={style}>
      <Avatar name={rider.display_name} size="lg" variant={avatarVariant(rider.id)} />
      <div>
        <div className="nm">
          {rider.display_name}
          <VerificationBadge
            status={rider.verification.status}
            label={rider.verification.label}
          />
          {rider.is_demo ? <Badge tone="neu">Demo rider</Badge> : null}
        </div>
        <div className="meta">
          {rider.trust.average_stars !== null ? (
            <span>
              {'★'} {rider.trust.average_stars.toFixed(1)} ·{' '}
              {rider.trust.rated_bookings} ratings
            </span>
          ) : (
            <span>No star average yet</span>
          )}
          <span>{rider.vehicle_type}</span>
          <span>{areaNames(rider)}</span>
          <AvailabilityBadge available={rider.available_now} />
        </div>
        <SourceLine style={{ marginTop: 6 }}>{trustSource(rider.trust)}</SourceLine>
      </div>
      <TrustRing trust={rider.trust} />
      {action ? <div className="act">{action}</div> : null}
    </div>
  )
}

/** The API's verification wording, shown as written. */
export function VerificationBadge({
  status,
  label,
}: {
  status: RiderListItem['verification']['status']
  label: string
}) {
  if (status === 'DOCUMENTS_MANUALLY_CHECKED') {
    return (
      <Badge tone="ok" icon="shield">
        {label}
      </Badge>
    )
  }
  if (status === 'PHONE_CONFIRMED') {
    return (
      <Badge tone="info" icon="check">
        {label}
      </Badge>
    )
  }
  return (
    <Badge tone="neu" icon="info">
      {label}
    </Badge>
  )
}

export function AvailabilityBadge({ available }: { available: boolean }) {
  return available ? (
    <Badge tone="ok" icon="check">
      Available now
    </Badge>
  ) : (
    <Badge tone="neu" icon="clock">
      Not available now
    </Badge>
  )
}

/** The loading row for a rider list. */
export function RiderCardSkeleton() {
  return (
    <div className="card rc" aria-busy="true" aria-label="Loading riders">
      <Skeleton variant="circle" width={72} height={72} />
      <div className="col" style={{ gap: 10 }}>
        <Skeleton variant="heading" width="40%" />
        <Skeleton width="70%" />
      </div>
      <Skeleton variant="circle" width={88} height={88} />
      <Skeleton width={140} height={48} />
    </div>
  )
}
