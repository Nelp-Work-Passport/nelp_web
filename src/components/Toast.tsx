import { cx } from '../lib/cx'
import { Icon } from './Icon'

export interface ToastProps {
  tone?: 'ok' | 'bad'
  title: React.ReactNode
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * A brief confirmation. It lives in a live region so it is announced, and it
 * never carries the only copy of something the user needs — a toast that is
 * missed must not lose information.
 */
export function Toast({ tone = 'ok', title, children, className, style }: ToastProps) {
  return (
    <div
      className={cx('toast', tone === 'bad' && 'bad', className)}
      style={style}
      role={tone === 'bad' ? 'alert' : 'status'}
      aria-live={tone === 'bad' ? undefined : 'polite'}
    >
      <Icon name={tone === 'bad' ? 'error' : 'check'} className="ti" />
      <div>
        <b>{title}</b>
        {children}
      </div>
    </div>
  )
}
