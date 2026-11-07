import { useRef } from 'react'
import { cx } from '../lib/cx'
import type { CodeLength } from '../domain/codes'
import { Field } from './Field'

export interface CodeInputProps {
  label: React.ReactNode
  value: string
  onChange: (value: string) => void
  /** 4 for receipt, rating and PIN codes; 6 for sender sign-in. */
  length?: CodeLength
  hint?: React.ReactNode
  error?: string | null
  disabled?: boolean
  /** Hides the digits, for a PIN typed into code boxes. */
  secret?: boolean
  /** Fires once the last box is filled. */
  onComplete?: (value: string) => void
  fieldClassName?: string
  autoFocus?: boolean
}

/**
 * One box per digit, with auto-advance.
 *
 * The boxes are a presentation of a single value: typing moves forward,
 * backspace on an empty box steps back and clears, arrows move, and a paste
 * anywhere fills the remaining boxes. Each box is labelled for screen
 * readers, and the group carries the field's own label.
 */
export function CodeInput({
  label,
  value,
  onChange,
  length = 4,
  hint,
  error,
  disabled,
  secret,
  onComplete,
  fieldClassName,
  autoFocus,
}: CodeInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const focus = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), length - 1)
    refs.current[clamped]?.focus()
    refs.current[clamped]?.select()
  }

  const commit = (next: string) => {
    onChange(next)
    if (next.length === length) onComplete?.(next)
  }

  /** Writes `incoming` across the boxes starting at `start`. */
  const fillFrom = (start: number, incoming: string) => {
    const chars = digits.slice()
    let cursor = start
    for (const char of incoming) {
      if (cursor >= length) break
      chars[cursor] = char
      cursor += 1
    }
    commit(chars.join('').slice(0, length))
    focus(cursor)
  }

  const handleChange = (index: number, raw: string) => {
    const incoming = raw.replace(/\D/g, '')
    if (!incoming) {
      const chars = digits.slice()
      chars[index] = ''
      commit(chars.join(''))
      return
    }
    // Typing into a filled box appends, so the newest digit is the last one.
    fillFrom(index, incoming.length > 1 ? incoming : incoming.slice(-1))
  }

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Backspace') {
      if (digits[index]) return
      event.preventDefault()
      const chars = digits.slice()
      chars[index - 1] = ''
      commit(chars.join(''))
      focus(index - 1)
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focus(index - 1)
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focus(index + 1)
    }
  }

  const handlePaste = (
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')
    if (!pasted) return
    event.preventDefault()
    fillFrom(index, pasted)
  }

  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      group
      className={fieldClassName}
    >
      {({ describedBy, labelledBy, invalid }) => (
        <div
          className={cx('code', length === 6 && 'six')}
          role="group"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                refs.current[index] = node
              }}
              className={cx('in', invalid && 'is-error')}
              value={digit}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={(event) => handlePaste(index, event)}
              onFocus={(event) => event.target.select()}
              type={secret ? 'password' : 'text'}
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              aria-label={`${secret ? 'PIN digit' : 'Digit'} ${index + 1} of ${length}`}
              aria-invalid={invalid || undefined}
              disabled={disabled}
              autoFocus={autoFocus && index === 0}
            />
          ))}
        </div>
      )}
    </Field>
  )
}
