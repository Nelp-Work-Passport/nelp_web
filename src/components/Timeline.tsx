import { cx } from '../lib/cx'
import { stepStateWord, type TimelineStep } from '../domain/steps'
import { Icon } from './Icon'

export interface TimelineProps {
  steps: readonly TimelineStep[]
  /** Names the sequence, e.g. "Booking progress". */
  label: string
  className?: string
}

/**
 * The progress line. Four steps for a rider or recipient, seven for a
 * sender's booking; the grid collapses to a vertical list at 760px.
 *
 * A step's state is carried by its mark and by text for screen readers, not
 * by the dot's colour: a done step gets a tick, a failed step a cross, and
 * every step states its position in words.
 */
export function Timeline({ steps, label, className }: TimelineProps) {
  return (
    <ol
      className={cx('tl', steps.length === 4 && 'four', className)}
      aria-label={label}
    >
      {steps.map((step, index) => (
        <li
          key={step.label}
          className={cx(
            step.state === 'done' && 'done',
            step.state === 'now' && 'now',
            step.state === 'fail' && 'fail',
          )}
        >
          <div className="dot">
            {step.state === 'done' ? (
              <Icon name="check" />
            ) : step.state === 'fail' ? (
              <Icon name="x" />
            ) : (
              <span aria-hidden="true">{index + 1}</span>
            )}
          </div>
          {step.label}
          <span className="sr-only">: {stepStateWord(step.state)}</span>
          {step.note ? <small>{step.note}</small> : null}
        </li>
      ))}
    </ol>
  )
}
