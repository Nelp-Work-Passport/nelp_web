import { useCallback, useEffect, useRef, useState } from 'react'

export type CopyState = 'idle' | 'copied' | 'failed'

/**
 * Copies text to the clipboard and reports what happened.
 *
 * The clipboard API is unavailable over plain HTTP and can be refused, so
 * the failure path is real: callers show the link for manual selection
 * rather than claiming a copy that did not happen.
 */
export function useCopy(resetAfterMs = 2500) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<number>(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text: string) => {
      window.clearTimeout(timer.current)
      try {
        await navigator.clipboard.writeText(text)
        setState('copied')
      } catch {
        setState('failed')
      }
      timer.current = window.setTimeout(() => setState('idle'), resetAfterMs)
    },
    [resetAfterMs],
  )

  return { state, copy }
}
