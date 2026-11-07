import { cx } from '../lib/cx'
import {
  countdownLabel,
  formatCountdown,
  formatShortCountdown,
  shouldAnnounce,
  type Remaining,
} from '../domain/countdown'
import { useCountdown } from '../lib/useCountdown'

export interface CountdownProps {
  /** Epoch milliseconds. Null renders nothing. */
  deadline: number | null
  onExpire?: () => void
  /** `big` is the 40px figure; `inline` is the small "0:42" form. */
  variant?: 'big' | 'inline'
  fontSize?: number
  className?: string
}

/**
 * A ticking countdown.
 *
 * The digits are hidden from screen readers and a spoken label is published
 * alongside them, because `07:42` is read as a time of day. The label is
 * only refreshed each half minute, and then each second for the last five,
 * so a screen reader is not flooded with one announcement per second.
 */
export function Countdown({
  deadline,
  onExpire,
  variant = 'big',
  fontSize,
  className,
}: CountdownProps) {
  const remaining = useCountdown(deadline, onExpire)
  if (deadline === null) return null

  const text =
    variant === 'big'
      ? formatCountdown(remaining)
      : formatShortCountdown(remaining)

  return (
    <>
      {variant === 'big' ? (
        <div
          className={cx('cdown', className)}
          style={fontSize ? { fontSize } : undefined}
          aria-hidden="true"
        >
          {text}
        </div>
      ) : (
        <b className={cx('nw', className)} aria-hidden="true">
          {text}
        </b>
      )}
      <CountdownAnnouncer remaining={remaining} />
    </>
  )
}

/** Publishes the spoken form of a countdown, throttled. */
export function CountdownAnnouncer({ remaining }: { remaining: Remaining }) {
  return (
    <span className="sr-only" aria-live="polite" aria-atomic="true">
      {shouldAnnounce(remaining) ? countdownLabel(remaining) : ''}
    </span>
  )
}
