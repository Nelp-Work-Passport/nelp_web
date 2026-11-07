import { useId, useState } from 'react'
import { cx } from '../lib/cx'
import { checkPinStrength } from '../domain/codes'
import { Icon } from './Icon'

export interface PinInputProps {
  label: React.ReactNode
  value: string
  onChange: (value: string) => void
  hint?: React.ReactNode
  error?: string | null
  disabled?: boolean
  placeholder?: string
  autoComplete?: string
  /** Shows the three-segment strength meter under the field. */
  showStrength?: boolean
  fieldClassName?: string
}

/**
 * A masked PIN with a Show/Hide toggle.
 *
 * The toggle is a real button inside the field, 44px tall like every other
 * target, and it announces which state it will switch to rather than relying
 * on the word alone.
 */
export function PinInput({
  label,
  value,
  onChange,
  hint,
  error,
  disabled,
  placeholder,
  autoComplete = 'off',
  showStrength,
  fieldClassName,
}: PinInputProps) {
  const [revealed, setRevealed] = useState(false)
  const base = useId()
  const id = `${base}-pin`
  const hintId = `${base}-hint`
  const errorId = `${base}-error`
  const invalid = Boolean(error)

  const describedBy =
    cx(hint ? hintId : undefined, error ? errorId : undefined) || undefined

  return (
    <div className={fieldClassName}>
      <label className="lbl" htmlFor={id}>
        {label}
      </label>
      <div className="pinw">
        <input
          id={id}
          className={cx('in', invalid && 'is-error')}
          type={revealed ? 'text' : 'password'}
          value={value}
          onChange={(event) =>
            onChange(event.target.value.replace(/\D/g, '').slice(0, 6))
          }
          inputMode="numeric"
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
        <button
          className="tog"
          type="button"
          onClick={() => setRevealed((shown) => !shown)}
          disabled={disabled}
          style={disabled ? { color: '#69746E' } : undefined}
          aria-pressed={revealed}
        >
          {revealed ? 'Hide' : 'Show'}
        </button>
      </div>

      {showStrength ? <StrengthMeter value={value} /> : null}

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

/**
 * Three segments, each filling as the PIN gets harder to guess. The words
 * under it carry the verdict so the colour is never the only signal.
 */
function StrengthMeter({ value }: { value: string }) {
  const problem = checkPinStrength(value)
  const filled = value.length === 0 ? 0 : problem ? 1 : value.length >= 5 ? 3 : 2
  const verdict =
    value.length === 0
      ? 'Not set yet'
      : problem
        ? 'Too easy to guess'
        : filled === 3
          ? 'Good'
          : 'Fine'

  return (
    <>
      <div className="pw-meter" aria-hidden="true">
        {[0, 1, 2].map((index) => (
          <i
            key={index}
            className={
              index < filled ? (filled === 3 ? 'g' : 'f') : undefined
            }
          />
        ))}
      </div>
      <div className="hint" aria-live="polite">
        PIN strength: {verdict}
      </div>
    </>
  )
}
