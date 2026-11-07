import { cx } from '../lib/cx'
import { Field } from './Field'

type NativeInput = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'className' | 'id'
>

export interface TextInputProps extends NativeInput {
  label: React.ReactNode
  optional?: boolean
  hint?: React.ReactNode
  error?: string | null
  /** Shimmers the field while its value is being fetched. */
  loading?: boolean
  fieldClassName?: string
}

export function TextInput({
  label,
  optional,
  hint,
  error,
  loading,
  fieldClassName,
  ...input
}: TextInputProps) {
  return (
    <Field
      label={label}
      optional={optional}
      hint={hint}
      error={error}
      className={fieldClassName}
    >
      {({ id, describedBy, invalid }) => (
        <input
          {...input}
          id={id}
          className={cx('in', invalid && 'is-error', loading && 'is-loading')}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          readOnly={input.readOnly || loading}
        />
      )}
    </Field>
  )
}

type NativeTextarea = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className' | 'id'
>

export interface TextAreaProps extends NativeTextarea {
  label: React.ReactNode
  optional?: boolean
  hint?: React.ReactNode
  error?: string | null
  fieldClassName?: string
}

export function TextArea({
  label,
  optional,
  hint,
  error,
  fieldClassName,
  ...textarea
}: TextAreaProps) {
  return (
    <Field
      label={label}
      optional={optional}
      hint={hint}
      error={error}
      className={fieldClassName}
    >
      {({ id, describedBy, invalid }) => (
        <textarea
          {...textarea}
          id={id}
          className={cx('in', invalid && 'is-error')}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
      )}
    </Field>
  )
}

type NativeSelect = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'className' | 'id'
>

export interface SelectProps extends NativeSelect {
  label: React.ReactNode
  hint?: React.ReactNode
  error?: string | null
  options: readonly string[]
  fieldClassName?: string
}

export function Select({
  label,
  hint,
  error,
  options,
  fieldClassName,
  ...select
}: SelectProps) {
  return (
    <Field label={label} hint={hint} error={error} className={fieldClassName}>
      {({ id, describedBy, invalid }) => (
        <select
          {...select}
          id={id}
          className={cx('in', invalid && 'is-error')}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}
