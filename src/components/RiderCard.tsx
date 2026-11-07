import { cx } from '../lib/cx'
import type { Rider } from '../domain/types'
import { Avatar } from './Avatar'
import { AssuredBadge, Badge, VerifiedTick } from './Badge'
import { ScoreBox } from './ScoreRing'
import { Skeleton } from './Skeleton'
import { SourceLine } from './SourceLine'

export interface RiderCardProps {
  rider: Rider
  /** The availability badge and any review note. */
  availability?: React.ReactNode
  /** Extra badges under the meta row. */
  tags?: React.ReactNode
  /** The one action for this rider. */
  action?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * A rider in a list: avatar, name with its verification marks, rating and
 * area, the score ring, and one action.
 *
 * The score never appears without the line saying what it is built from.
 */
export function RiderCard({
  rider,
  availability,
  tags,
  action,
  className,
  style,
}: RiderCardProps) {
  return (
    <div className={cx('card rc', className)} style={style}>
      <Avatar name={rider.name} size="lg" variant={rider.avatarVariant} />
      <div>
        <div className="nm">
          {rider.name}
          {rider.verification === 'verified' ? <VerifiedTick /> : null}
          {rider.assured ? <AssuredBadge /> : null}
        </div>
        <div className="meta">
          {rider.rating !== null ? (
            <span>
              {'★'} {rider.rating.toFixed(1)} · {rider.ratingCount} ratings
            </span>
          ) : (
            <span>No ratings yet</span>
          )}
          <span>{rider.area}</span>
          {availability}
        </div>
        {tags ? <div className="tags">{tags}</div> : null}
        <SourceLine style={{ marginTop: 6 }}>
          Score from {rider.score.evidence.confirmedJobs} confirmed jobs
        </SourceLine>
      </div>
      <ScoreBox
        score={rider.score.band === 'none' ? null : rider.score.total}
        band={rider.score.band}
      />
      {action ? <div className="act">{action}</div> : null}
    </div>
  )
}

/** The availability badge, worded as the design does. */
export function AvailabilityBadge({
  online,
  availableFrom,
}: {
  online: boolean
  availableFrom?: string
}) {
  if (online) {
    return (
      <Badge tone="ok" icon="check">
        Available
      </Badge>
    )
  }
  return (
    <Badge tone="neu" icon="clock">
      {availableFrom ? `Busy until ${availableFrom}` : 'Offline'}
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
