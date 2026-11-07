import { cx } from '../lib/cx'
import { initialsOf } from '../lib/initials'

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'
/** The four palettes in nelp.css. `''` is the default teal. */
export type AvatarVariant = '' | 'a2' | 'a3' | 'a4'

export interface AvatarProps {
  /** A name, reduced to initials, or the initials themselves. */
  name: string
  size?: AvatarSize
  variant?: AvatarVariant
  className?: string
  style?: React.CSSProperties
}

/**
 * Initials only. There are no photographs or logos anywhere in Nelp, so a
 * profile can never be dressed up with a borrowed face.
 *
 * The initials are decorative: the person's name is always written next to
 * the avatar, so this is hidden from screen readers.
 */
export function Avatar({ name, size = 'md', variant = '', className, style }: AvatarProps) {
  return (
    <span
      className={cx('av', size !== 'md' && size, variant, className)}
      style={style}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  )
}

export interface AvatarIconProps {
  children: React.ReactNode
  size?: AvatarSize
  variant?: AvatarVariant
  className?: string
  style?: React.CSSProperties
}

/** The same circle holding an icon or a step number instead of initials. */
export function AvatarIcon({
  children,
  size = 'md',
  variant = '',
  className,
  style,
}: AvatarIconProps) {
  return (
    <span
      className={cx('av', size !== 'md' && size, variant, className)}
      style={style}
    >
      {children}
    </span>
  )
}
