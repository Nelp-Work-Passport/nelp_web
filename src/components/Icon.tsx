import { cx } from '../lib/cx'

/**
 * The icon set used across the design, kept as one component so stroke
 * weight and sizing stay consistent. Every path here is copied from the
 * design frames; nothing new is invented.
 *
 * Icons are decorative by default: meaning is always carried by adjacent
 * text, never by the icon or its colour alone.
 */
export type IconName =
  | 'check'
  | 'shield'
  | 'info'
  | 'alert'
  | 'error'
  | 'clock'
  | 'x-circle'
  | 'x'
  | 'lock'
  | 'flag'
  | 'device'
  | 'search'
  | 'calendar'
  | 'arrow-right'
  | 'power'
  | 'arrow-up'
  | 'arrow-down'
  | 'star'

export type IconSize = 'sm' | 'lg' | 'xl'

export interface IconProps {
  name: IconName
  /** `sm` is the 18px default from nelp.css. */
  size?: IconSize
  className?: string
  /** Supply only when the icon is the sole carrier of its meaning. */
  label?: string
  style?: React.CSSProperties
}

const paths: Record<IconName, React.ReactNode> = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2.2 2.2L15.5 10" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.01" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17.5v.01" />
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5v.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  'x-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  x: <path d="M7 7l10 10M17 7L7 17" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  flag: <path d="M6 21V4M6 5h11l-2 4 2 4H6" />,
  device: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </>
  ),
  'arrow-right': <path d="M5 12h12M13 7l5 5-5 5" />,
  power: <path d="M12 3v9M6.4 6.4a8 8 0 1 0 11.2 0" />,
  'arrow-up': <path d="M12 19V6M6 11l6-6 6 6" />,
  'arrow-down': <path d="M12 5v13M6 13l6 6 6-6" />,
  star: <path d="M12 4l2.5 5.2 5.5.8-4 3.9 1 5.6-5-2.8-5 2.8 1-5.6-4-3.9 5.5-.8z" />,
}

export function Icon({ name, size, className, label, style }: IconProps) {
  const sizeClass = size === 'lg' ? 'lg' : size === 'xl' ? 'xl' : undefined
  return (
    <svg
      className={cx('i', sizeClass, className)}
      viewBox="0 0 24 24"
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {paths[name]}
    </svg>
  )
}
