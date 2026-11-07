import { cx } from '../lib/cx'
import { starWord } from '../domain/rating'

export interface StarRatingProps {
  /** 1 to 5, or 0 for nothing chosen yet. */
  value: number
  onChange?: (value: number) => void
  /** Describes the group, e.g. "Your rating". */
  label: string
  /** Shows the stars without controls. */
  readOnly?: boolean
  disabled?: boolean
  className?: string
}

/**
 * Five stars as a radio group.
 *
 * Each star is its own radio so a keyboard reaches them with arrow keys and
 * a screen reader hears "4 stars, Good" rather than a count of filled
 * glyphs. A caption under the stars states the choice in words, because a
 * filled star is a colour difference.
 */
export function StarRating({
  value,
  onChange,
  label,
  readOnly,
  disabled,
  className,
}: StarRatingProps) {
  if (readOnly) {
    return (
      <div
        className={cx('stars', className)}
        role="img"
        aria-label={`${value} of 5 stars`}
      >
        <span
          className="star on"
          style={{ width: 'auto', height: 'auto', fontSize: 26, cursor: 'default' }}
          aria-hidden="true"
        >
          {'★'.repeat(value)}
        </span>
        {value < 5 ? (
          <span
            className="star"
            style={{ width: 'auto', height: 'auto', fontSize: 26, cursor: 'default' }}
            aria-hidden="true"
          >
            {'☆'.repeat(5 - value)}
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cx('stars', className)} role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value
        return (
          <button
            key={star}
            className={cx('star', filled && 'on')}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} ${star === 1 ? 'star' : 'stars'}, ${starWord(star)}`}
            tabIndex={star === (value || 1) ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange?.(star)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
                event.preventDefault()
                onChange?.(Math.min(5, (value || 0) + 1))
              } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
                event.preventDefault()
                onChange?.(Math.max(1, (value || 1) - 1))
              }
            }}
          >
            {filled ? '★' : '☆'}
          </button>
        )
      })}
    </div>
  )
}
