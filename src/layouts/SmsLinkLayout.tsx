import { Link, Outlet } from 'react-router-dom'
import { RoleChip } from '../components/RoleChip'
import { SkipLink } from './SkipLink'
import type { UiRole } from '../domain/roles'

export interface SmsLinkLayoutProps {
  /** Which role opened the link, for the development chip. */
  role?: UiRole
}

/**
 * Pages opened from a text message.
 *
 * No navigation at all: whoever follows one of these links has no account
 * and nothing else to do here. The wordmark, one action, and the line that
 * says what Nelp is. Everything else would be a way to get lost.
 */
export function SmsLinkLayout({ role = 'recipient' }: SmsLinkLayoutProps) {
  return (
    <>
      <RoleChip role={role} />
      <SkipLink />
      <header className="minihead">
        <Link className="brand" to="/">
          Nelp
        </Link>
      </header>
      <Outlet />
    </>
  )
}

/** The one-line footer every SMS-link page ends with. */
export function SmsLinkFooter({ style }: { style?: React.CSSProperties }) {
  return (
    <p className="cap tc" style={style}>
      Nelp keeps a record of every delivery, confirmed by the person who
      received it.
    </p>
  )
}
