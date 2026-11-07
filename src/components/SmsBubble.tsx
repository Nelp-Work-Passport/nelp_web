import { cx } from '../lib/cx'

export interface SmsBubbleProps {
  /** The message text. A code inside it is highlighted separately. */
  children: React.ReactNode
  /** Right-aligned, for a message the user sent. */
  outgoing?: boolean
  className?: string
  style?: React.CSSProperties
}

/** One text message, as it would look on a phone. */
export function SmsBubble({ children, outgoing, className, style }: SmsBubbleProps) {
  return (
    <div className={cx('sms', outgoing && 'out', className)} style={style}>
      {children}
    </div>
  )
}

export interface SmsTextProps {
  /** The full message body, exactly as it would be sent. */
  body: string
  /** The code inside the body, pulled out and set large. */
  code?: string
}

/**
 * Renders a message body with its code highlighted.
 *
 * The body is the single source of truth: the code is found inside it rather
 * than appended, so what is shown is always what would be sent.
 */
export function SmsText({ body, code }: SmsTextProps) {
  if (!code || !body.includes(code)) return <>{body}</>
  const [before, ...rest] = body.split(code)
  return (
    <>
      {before}
      <span className="cd">{code}</span>
      {rest.join(code)}
    </>
  )
}
