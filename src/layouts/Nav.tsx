import { useId, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { cx } from '../lib/cx'
import { Button } from '../components/Button'

export interface NavItem {
  to: string
  label: string
  /** Matches only this exact path, for a parent route like `/`. */
  end?: boolean
}

export interface NavProps {
  /** The role accent: blue Sender, teal Rider, ink Admin, none for Public. */
  accent?: 'sender' | 'rider' | 'admin'
  /** Where the wordmark goes. */
  home: string
  /** Appended to the wordmark, for the Admin badge. */
  brandSuffix?: React.ReactNode
  items?: readonly NavItem[]
  /** Describes the set, e.g. "Sender". */
  label: string
  /** The right-hand side: a user chip, the online switch, a log-out link. */
  aside?: React.ReactNode
}

/**
 * The navigation bar in all four of its accents.
 *
 * Below 760px the links collapse behind a Menu button. The button is a real
 * disclosure: it says what it controls and whether it is open, and the
 * panel it opens holds the same links and the same aside.
 */
export function Nav({
  accent,
  home,
  brandSuffix,
  items,
  label,
  aside,
}: NavProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <header className={cx('nav', accent)}>
      <div className="wrap bar">
        {brandSuffix ? (
          <span className="brand">
            <Link className="brand" to={home}>
              Nelp
            </Link>
            {brandSuffix}
          </span>
        ) : (
          <Link className="brand" to={home}>
            Nelp
          </Link>
        )}

        {items && items.length > 0 ? (
          <nav className="links hide-s" aria-label={label}>
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'on' : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}

        {aside ? <div className="row hide-s" style={{ gap: 10 }}>{aside}</div> : null}

        {(items && items.length > 0) || aside ? (
          <Button
            variant="secondary"
            size="sm"
            className="menu-btn"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((shown) => !shown)}
          >
            {open ? 'Close' : 'Menu'}
          </Button>
        ) : null}
      </div>

      {/*
       * The panel's contents exist only while it is open, so the same links
       * are never in the page twice. The container stays so `aria-controls`
       * always points at something, and the `.navpanel` rule keeps it hidden
       * if the window is widened while it is open.
       */}
      <div
        id={panelId}
        className={cx('navpanel wrap', open && 'is-open')}
        style={{ paddingBottom: 16 }}
      >
        {open && items && items.length > 0 ? (
          <nav
            className="links col"
            aria-label={`${label}, menu`}
            style={{ alignItems: 'stretch' }}
          >
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'on' : undefined)}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}
        {open && aside ? (
          <div className="row" style={{ gap: 10, marginTop: 12 }}>
            {aside}
          </div>
        ) : null}
      </div>
    </header>
  )
}
