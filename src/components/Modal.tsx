import { useEffect, useId, useRef } from 'react'
import { cx } from '../lib/cx'

export interface ModalProps {
  open?: boolean
  onClose?: () => void
  title: React.ReactNode
  children: React.ReactNode
  /** Buttons, stacked as the design shows them. */
  actions?: React.ReactNode
  /**
   * Renders in the page flow instead of over it. Used to show a dialog in a
   * state sheet; the real thing overlays.
   */
  inline?: boolean
  className?: string
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * A dialog that takes focus, keeps it, and gives it back.
 *
 * Escape and a click on the scrim both close it, focus moves inside on open
 * and returns to whatever opened it on close, and Tab cycles within the
 * dialog so the page behind is never reachable while it is up.
 */
export function Modal({
  open = true,
  onClose,
  title,
  children,
  actions,
  inline,
  className,
}: ModalProps) {
  const panel = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open || inline) return

    restoreTo.current = document.activeElement as HTMLElement | null
    const node = panel.current
    node?.querySelector<HTMLElement>(FOCUSABLE)?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose?.()
        return
      }
      if (event.key !== 'Tab' || !node) return
      const targets = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (targets.length === 0) return
      const first = targets[0]
      const last = targets[targets.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      restoreTo.current?.focus()
    }
  }, [open, inline, onClose])

  if (!open) return null

  const panelNode = (
    <div
      className={cx('modal col', className)}
      style={{ gap: 14 }}
      ref={panel}
      role="dialog"
      aria-modal={inline ? undefined : true}
      aria-labelledby={titleId}
    >
      <h2 className="h3" id={titleId}>
        {title}
      </h2>
      {children}
      {actions ? (
        <div className="col" style={{ gap: 10 }}>
          {actions}
        </div>
      ) : null}
    </div>
  )

  if (inline) return <div className="scrim">{panelNode}</div>

  return (
    <div
      className="scrim"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        borderRadius: 0,
        overflowY: 'auto',
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      {panelNode}
    </div>
  )
}
