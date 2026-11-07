import { JobProgress } from './JobProgress'

/**
 * Design: RiderInvite.dc.html
 *
 * The job link from a text, `/j/:token`. The API has no separate invitation
 * token — a rider's job is the booking — so this is the job page opened at
 * its first step, where the one action is accept or decline.
 */
export function JobInvite() {
  return <JobProgress />
}
