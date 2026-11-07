import { cx } from '../lib/cx'

export interface PageProps {
  children: React.ReactNode
  /** Drops the standard vertical padding, for a page that sets its own. */
  bare?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * The page's main landmark and the skip link's target.
 *
 * Each page owns its own `main`, because the design uses different padding
 * on different pages: `.main` for app pages and `.sec` on the landing page.
 */
export function Page({ children, bare, className, style }: PageProps) {
  return (
    <main id="main" className={cx(!bare && 'main', className)} style={style}>
      {children}
    </main>
  )
}

export interface PageHeaderProps {
  /** The small uppercase line above the title. */
  eyebrow?: React.ReactNode
  title: React.ReactNode
  children?: React.ReactNode
  /** A back link above the eyebrow. */
  back?: React.ReactNode
  /** Pushed to the right of the title. */
  aside?: React.ReactNode
  gap?: number
}

/** The eyebrow, heading and standfirst block at the top of most pages. */
export function PageHeader({
  eyebrow,
  title,
  children,
  back,
  aside,
  gap = 8,
}: PageHeaderProps) {
  return (
    <div className="col" style={{ gap }}>
      {back}
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      {aside ? (
        <div className="row sb">
          <h1 className="title">{title}</h1>
          {aside}
        </div>
      ) : (
        <h1 className="title">{title}</h1>
      )}
      {children}
    </div>
  )
}
