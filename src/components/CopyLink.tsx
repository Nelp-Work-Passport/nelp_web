import { useId } from 'react'
import { useCopy } from '../lib/useCopy'
import { Button, type ButtonVariant } from './Button'

export interface CopyLinkProps {
  /** The link to copy. Shown in a read-only field so it can be selected. */
  value: string
  /** Names the field for screen readers. */
  label: string
  buttonVariant?: ButtonVariant
  /** A line under the field explaining what the link is for. */
  note?: React.ReactNode
}

/**
 * A link with a copy button.
 *
 * The link is always visible in a read-only field, so it can be selected by
 * hand when the clipboard is refused — which it is over plain HTTP. The
 * result of the copy is announced.
 */
export function CopyLink({
  value,
  label,
  buttonVariant = 'secondary',
  note,
}: CopyLinkProps) {
  const { state, copy } = useCopy()
  const id = useId()

  return (
    <>
      <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
        <label className="sr-only" htmlFor={id}>
          {label}
        </label>
        <input
          id={id}
          className="in"
          readOnly
          value={value}
          style={{ flex: 1 }}
          onFocus={(event) => event.target.select()}
        />
        <Button variant={buttonVariant} onClick={() => void copy(value)}>
          Copy link
        </Button>
      </div>
      {note ? <div className="cap">{note}</div> : null}
      <div className="cap" aria-live="polite">
        {state === 'copied'
          ? 'Link copied. Paste it into WhatsApp or SMS.'
          : state === 'failed'
            ? 'We could not copy it. Select the link above and copy it yourself.'
            : ''}
      </div>
    </>
  )
}
