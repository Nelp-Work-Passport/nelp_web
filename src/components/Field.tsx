import { useId } from 'react'
import { cx } from '../lib/cx'
import { Icon } from './Icon'

export interface FieldProps {
  label: React.ReactNode
  /** Appends the design's "(optional)" treatment to the label. */
  optional?: boolean
  hint?: React.ReactNode
  error?: string | null
  /**
   * Set when the control is a group of inputs rather than one, so the label
   * becomes a `span` tied to the group by `aria-labelledby`.
   */
  group?: boolean
  className?: string
  children: (ids: FieldIds) => React.ReactNode
}

export interface FieldIds {
  /** Put on the single control, or omit for a group. */
  id: string
  /** Put on the control as `aria-describedby`. */
  describedBy: string | undefined
  /** Put on the group container as `aria-labelledby`. */
  labelledBy: string
  invalid: boolean
}

/**
 * Label, hint and error around one control or one group of controls.
 *
 * The error is in an `aria-live` region so it is announced when it appears,
 * and it always pairs its colour with an icon and words — colour alone never
 * carries the meaning.
 */
export function Field({
  label,
  optional,
  hint,
  error,
  group,
  className,
  children,
}: FieldProps) {
  const base = useId()
  const id = `${base}-control`
  const labelId = `${base}-label`
  const hintId = `${base}-hint`
  const errorId = `${base}-error`

  const describedBy =
    cx(hint ? hintId : undefined, error ? errorId : undefined) || undefined

  return (
    <div className={className}>
      {group ? (
        <span className="lbl" id={labelId}>
          {label}
          {optional ? <span className="opt"> (optional)</span> : null}
        </span>
      ) : (
        <label className="lbl" id={labelId} htmlFor={id}>
          {label}
          {optional ? <span className="opt"> (optional)</span> : null}
        </label>
      )}

      {children({ id, describedBy, labelledBy: labelId, invalid: Boolean(error) })}

      {hint ? (
        <div className="hint" id={hintId}>
          {hint}
        </div>
      ) : null}

      <div aria-live="polite">
        {error ? (
          <div className="emsg" id={errorId}>
            <Icon name="error" />
            <span>{error}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
