import { Link } from 'react-router-dom'
import { cx } from '../lib/cx'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'text'
  | 'danger'
  | 'danger-o'
  /** Sender blue. */
  | 'snd'
  /** Rider teal. */
  | 'rdr'

export type ButtonSize = 'sm' | 'md' | 'lg'

interface Common {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Full width. */
  block?: boolean
  /** Full width at 760px and below only. */
  mobileBlock?: boolean
  loading?: boolean
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}

type ButtonAsButton = Common &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style'> & {
    to?: undefined
    href?: undefined
  }

type ButtonAsLink = Common &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'style' | 'href'> & {
    /** Renders a router link. */
    to: string
    href?: undefined
    disabled?: boolean
  }

type ButtonAsAnchor = Common &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'style'> & {
    /** Renders a plain anchor, for in-page and external targets. */
    href: string
    to?: undefined
    disabled?: boolean
  }

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor

/**
 * The one button in the design system. A loading button keeps its label and
 * gains a spinner, so its width does not jump and a screen reader still
 * knows what it does.
 *
 * A disabled link cannot be focused or followed, so it renders as a disabled
 * button instead of a dead anchor.
 */
export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'md',
    block,
    mobileBlock,
    loading,
    className,
    children,
    style,
    ...rest
  } = props

  const classes = cx(
    'btn',
    variant,
    size === 'lg' && 'lg',
    size === 'sm' && 'sm',
    block && 'block',
    mobileBlock && 'mblock',
    loading && 'is-loading',
    className,
  )

  const busy = loading ? { 'aria-busy': true as const } : {}

  if ('to' in rest && rest.to !== undefined && !rest.disabled && !loading) {
    const { to, disabled: _disabled, ...anchorRest } = rest as ButtonAsLink
    void _disabled
    return (
      <Link className={classes} to={to} style={style} {...busy} {...anchorRest}>
        {children}
      </Link>
    )
  }

  if ('href' in rest && rest.href !== undefined && !rest.disabled && !loading) {
    const { href, disabled: _disabled, ...anchorRest } = rest as ButtonAsAnchor
    void _disabled
    return (
      <a className={classes} href={href} style={style} {...busy} {...anchorRest}>
        {children}
      </a>
    )
  }

  const {
    to: _to,
    href: _href,
    type = 'button',
    disabled,
    ...buttonRest
  } = rest as ButtonAsButton & { to?: string; href?: string }
  void _to
  void _href

  return (
    <button
      className={classes}
      type={type}
      disabled={disabled || loading}
      style={style}
      {...busy}
      {...buttonRest}
    >
      {children}
    </button>
  )
}
