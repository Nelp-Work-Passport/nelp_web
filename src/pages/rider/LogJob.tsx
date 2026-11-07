import { Page, PageHeader } from '../../components/Page'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { SourceLine } from '../../components/SourceLine'

/**
 * Design: LogJob.dc.html
 *
 * The design had riders logging jobs they did outside Nelp, so that work
 * could count too. The API has no endpoint for it: a score is built from
 * ratings on Nelp bookings, and there is no way to create a booking a
 * customer did not make.
 *
 * Rather than a form that cannot save, this page says so and points at what
 * does work. The feature needs a backend endpoint before it can be built.
 */
export function LogJob() {
  return (
    <Page>
      <div className="wrap">
        <div className="wide col" style={{ gap: 20 }}>
          <PageHeader
            eyebrow="Not available yet"
            title="Logging an off-platform job"
          />

          <Banner tone="neu" title="Nelp cannot record this yet">
            Your score is built from ratings customers leave on Nelp bookings.
            There is no way yet to add a job that was arranged outside Nelp, so
            this page would be a form that could not save anything.
          </Banner>

          <div className="card col" style={{ gap: 12 }}>
            <div className="h3">What to do instead</div>
            <p className="muted">
              Ask the customer to book through Nelp next time. The booking
              carries the delivery code, so the job is confirmed by whoever
              received it and counts towards your score.
            </p>
            <SourceLine>
              Only a delivery confirmed with the recipient&rsquo;s 6-digit code
              counts.
            </SourceLine>
            <div className="row">
              <Button to="/rider/share">Share my profile link</Button>
              <Button variant="secondary" to="/rider/dashboard">
                Back to dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
