import { cx } from '../lib/cx'
import { formatNational } from '../domain/phone'
import { Field } from './Field'

export interface PhoneInputProps {
  label: React.ReactNode
  value: string
  onChange: (value: string) => void
  hint?: React.ReactNode
  error?: string | null
  disabled?: boolean
  placeholder?: string
  autoComplete?: string
  fieldClassName?: string
  /** Defaults to the +254 country prefix. `KES` reuses the same shape. */
  prefix?: string
}

/**
 * A phone field with a fixed `+254` prefix, so the country code is never
 * something the user has to type or get wrong. Digits are grouped as
 * `712 345 678` while typing.
 */
export function PhoneInput({
  label,
  value,
  onChange,
  hint,
  error,
  disabled,
  placeholder = '712 345 678',
  autoComplete = 'tel-national',
  fieldClassName,
  prefix = '+254',
}: PhoneInputProps) {
  return (
    <Field label={label} hint={hint} error={error} className={fieldClassName}>
      {({ id, describedBy, invalid }) => (
        <div className={cx('phone', invalid && 'is-error')}>
          <span className="pre" aria-hidden="true">
            {prefix}
          </span>
          <input
            id={id}
            className={cx('in', invalid && 'is-error')}
            value={value}
            onChange={(event) => onChange(formatNational(event.target.value))}
            inputMode="tel"
            autoComplete={autoComplete}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
          />
        </div>
      )}
    </Field>
  )
}

export interface AmountInputProps {
  label: React.ReactNode
  value: string
  onChange: (value: string) => void
  hint?: React.ReactNode
  error?: string | null
  disabled?: boolean
  placeholder?: string
  fieldClassName?: string
}

/** The same prefixed shape, with `KES` in front of a declared value or fare. */
export function AmountInput({
  label,
  value,
  onChange,
  hint,
  error,
  disabled,
  placeholder = '300',
  fieldClassName,
}: AmountInputProps) {
  return (
    <Field label={label} hint={hint} error={error} className={fieldClassName}>
      {({ id, describedBy, invalid }) => (
        <div className={cx('phone', invalid && 'is-error')}>
          <span className="pre" aria-hidden="true">
            KES
          </span>
          <input
            id={id}
            className={cx('in', invalid && 'is-error')}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            inputMode="numeric"
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
          />
        </div>
      )}
    </Field>
  )
}
