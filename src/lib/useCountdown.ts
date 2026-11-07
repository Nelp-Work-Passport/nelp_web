import { useEffect, useRef, useSyncExternalStore } from 'react'
import { remainingFrom, type Remaining } from '../domain/countdown'
import { clockSnapshot, subscribeToClock } from './clock'

/**
 * Ticks towards a deadline and stops at zero.
 *
 * The clock is an external system, so it is read with
 * `useSyncExternalStore` rather than copied into state on an interval: no
 * cascading render, and every countdown on the page shares one timer.
 *
 * `onExpire` fires once per deadline, not on every render after it passes,
 * so a page can move to its expired state without looping.
 */
export function useCountdown(
  deadline: number | null,
  onExpire?: () => void,
): Remaining {
  const seconds = useSyncExternalStore(subscribeToClock, clockSnapshot)
  const remaining = remainingFrom(deadline ?? 0, seconds * 1000)

  const firedFor = useRef<number | null>(null)
  const expired = deadline !== null && remaining.expired

  useEffect(() => {
    if (deadline === null || !expired) return
    if (firedFor.current === deadline) return
    firedFor.current = deadline
    onExpire?.()
  }, [deadline, expired, onExpire])

  return remaining
}
