/**
 * One shared clock that ticks once a second while anything is watching it.
 *
 * Countdowns subscribe to this rather than each starting a timer of their
 * own, so a page with several of them still has a single interval, and they
 * all tick on the same edge instead of drifting apart.
 */

type Listener = () => void

const listeners = new Set<Listener>()
let timer = 0

export function subscribeToClock(listener: Listener): () => void {
  listeners.add(listener)
  if (!timer) {
    timer = window.setInterval(() => {
      for (const notify of listeners) notify()
    }, 1000)
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.clearInterval(timer)
      timer = 0
    }
  }
}

/**
 * Whole seconds since the epoch.
 *
 * Rounded to the second so the value is stable between ticks: a snapshot
 * that changed on every read would re-render without end.
 */
export function clockSnapshot(): number {
  return Math.floor(Date.now() / 1000)
}
