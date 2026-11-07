import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

export type BannerTone = 'ok' | 'warn' | 'bad' | 'info' | 'neu'

export interface BannerProps {
  tone?: BannerTone
  /** Overrides the tone's default icon. */
  icon?: IconName
  /** The bold first line. Omit for a one-line banner. */
  title?: React.ReactNode
  children?: React.ReactNode
  /** Buttons pushed to the right of the banner. */
  actions?: React.ReactNode
  /**
   * Announces the banner when it appears. Use for something that happened,
   * not for standing guidance that was there on load.
   */
  live?: boolean
  className?: string
  style?: React.CSSProperties
}

const defaultIcon: Record<BannerTone, IconName> = {
  ok: 'check',
  warn: 'alert',
  bad: 'error',
  info: 'info',
  neu: 'info',
}

/**
 * A full-width message. Every tone pairs its colour with an icon and words,
 * so the meaning survives for anyone who cannot tell the colours apart.
 */
export function Banner({
  tone = 'neu',
  icon,
  title,
  children,
  actions,
  live,
  className,
  style,
}: BannerProps) {
  return (
    <div
      className={cx('banner', tone, className)}
      style={style}
      role={live ? (tone === 'bad' ? 'alert' : 'status') : undefined}
      aria-live={live && tone !== 'bad' ? 'polite' : undefined}
    >
      <Icon name={icon ?? defaultIcon[tone]} className="bi" />
      <div>
        {title ? <b>{title}</b> : null}
        {children}
      </div>
      {actions ? <div className="acts">{actions}</div> : null}
    </div>
  )
}

export type VerifyTone = 'ok' | 'warn' | 'bad'

export interface VerifyBannerProps {
  tone: VerifyTone
  heading: React.ReactNode
  children: React.ReactNode
}

const verifyIcon: Record<VerifyTone, IconName> = {
  ok: 'check',
  warn: 'clock',
  bad: 'alert',
}

/** The large verdict block on a verify result: Authentic, Stale or Tampered. */
export function VerifyBanner({ tone, heading, children }: VerifyBannerProps) {
  return (
    <div className={cx('vb', tone)}>
      <div className="big">
        <Icon name={verifyIcon[tone]} style={{ width: 30, height: 30 }} />
      </div>
      <div className="col" style={{ gap: 6 }}>
        <h2>{heading}</h2>
        {children}
      </div>
    </div>
  )
}
