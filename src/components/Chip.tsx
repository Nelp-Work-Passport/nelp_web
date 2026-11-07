import { cx } from '../lib/cx'

export interface ChipProps {
  /** Pressed state. The stylesheet adds a tick, so the state is not colour alone. */
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  children: React.ReactNode
  className?: string
}

/** A toggle chip: filters on a list, tags on a rating. */
export function Chip({
  selected,
  onClick,
  disabled,
  children,
  className,
}: ChipProps) {
  return (
    <button
      className={cx('chip', selected && 'on', disabled && 'is-disabled', className)}
      type="button"
      aria-pressed={selected ?? false}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export interface PillOptionProps {
  selected?: boolean
  onSelect?: () => void
  disabled?: boolean
  title: React.ReactNode
  description?: React.ReactNode
  /** Groups the radios; pass the same name to every option in a set. */
  name: string
}

/** A large radio option: the payment choice, the cash-or-M-Pesa question. */
export function PillOption({
  selected,
  onSelect,
  disabled,
  title,
  description,
  name,
}: PillOptionProps) {
  return (
    <label
      className={cx('pill-opt', selected && 'on')}
      style={disabled ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
    >
      <input
        className="sr-only"
        type="radio"
        name={name}
        checked={selected ?? false}
        disabled={disabled}
        onChange={() => onSelect?.()}
      />
      <span className="rd" aria-hidden="true" />
      <div>
        <div>{title}</div>
        {description ? (
          <div className="cap" style={{ fontWeight: 500 }}>
            {description}
          </div>
        ) : null}
      </div>
    </label>
  )
}

export interface ToggleProps {
  on: boolean
  onChange: (on: boolean) => void
  /** Names what the switch controls, e.g. "Online". */
  label: string
  disabled?: boolean
  className?: string
}

/**
 * A read-only copy of the switch, for the navigation bar.
 *
 * nelp.css gives `.rswitch .tgl` no pointer events, because the bar only
 * reports the state; the switch a rider actually operates is on the
 * dashboard. This keeps that distinction honest instead of shipping a
 * button that silently does nothing.
 */
export function ToggleIndicator({ on, label }: { on: boolean; label: string }) {
  return (
    <span className={cx('tgl', on && 'on')} role="img" aria-label={label} />
  )
}

/** The rider's online switch. */
export function Toggle({ on, onChange, label, disabled, className }: ToggleProps) {
  return (
    <button
      className={cx('tgl', on && 'on', disabled && 'is-disabled', className)}
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
    />
  )
}
