import { Link } from 'react-router-dom'
import { DemoBadge } from '../components/Badge'

export interface FooterProps {
  home?: string
  /** The landing page's fuller footer, with the link column. */
  full?: boolean
}

/** The footer. Every page states that insurance is a demo and nothing is sold. */
export function Footer({ home = '/', full }: FooterProps) {
  if (!full) {
    return (
      <footer className="foot">
        <div className="wrap">
          <Link className="brand" to={home}>
            Nelp
          </Link>
          <span className="cap">
            Insurance quotes are <DemoBadge /> only.
          </span>
        </div>
      </footer>
    )
  }

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="col" style={{ gap: 6, maxWidth: 360 }}>
          <Link className="brand" to={home}>
            Nelp
          </Link>
          <p className="cap">
            Riders you can check. Work you can prove. Built for Nairobi riders
            and the people who book them.
          </p>
        </div>
        <nav className="col" style={{ gap: 0 }} aria-label="Footer">
          <Link to="/verify">Verify a rider</Link>
          <Link to="/#how">How scores work</Link>
          <Link to="/admin/login">Admin</Link>
        </nav>
        <div className="col" style={{ maxWidth: 300 }}>
          <span className="cap">
            Insurance quotes are <DemoBadge /> only. No cover is sold.
          </span>
        </div>
      </div>
    </footer>
  )
}
