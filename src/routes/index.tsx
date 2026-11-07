import { Navigate, Route, Routes } from 'react-router-dom'

import { PublicLayout } from '../layouts/PublicLayout'
import { SenderLayout } from '../layouts/SenderLayout'
import { RiderLayout } from '../layouts/RiderLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { SmsLinkLayout } from '../layouts/SmsLinkLayout'
import { RequireRole } from './guards'

import { Landing } from '../pages/public/Landing'
import { RiderProfile } from '../pages/public/RiderProfile'
import { Verify } from '../pages/public/Verify'
import { VerifyResultPage } from '../pages/public/VerifyResult'
import { PostService } from '../pages/public/PostService'
import { NotFound } from '../pages/public/NotFound'

import { SenderSignIn } from '../pages/sender/SignIn'
import { SenderCodeEntry } from '../pages/sender/CodeEntry'
import { SenderSession } from '../pages/sender/Session'
import { NewBooking } from '../pages/sender/NewBooking'
import { ChooseRider } from '../pages/sender/ChooseRider'
import { Quote } from '../pages/sender/Quote'
import { MyBookings } from '../pages/sender/MyBookings'
import { BookingStatus } from '../pages/sender/BookingStatus'
import { RatePage } from '../pages/sender/RatePage'

import { RiderSignUp } from '../pages/rider/SignUp'
import { RiderLogIn } from '../pages/rider/LogIn'
import { JobInvite } from '../pages/rider/JobInvite'
import { JobProgress } from '../pages/rider/JobProgress'
import { RiderDashboard } from '../pages/rider/Dashboard'
import { MyJobs } from '../pages/rider/MyJobs'
import { LogJob } from '../pages/rider/LogJob'
import { Balance } from '../pages/rider/Balance'
import { RiderVerification } from '../pages/rider/Verification'
import { ShareProfile } from '../pages/rider/ShareProfile'

import { Tracking } from '../pages/recipient/Tracking'
import { ConfirmReceipt } from '../pages/recipient/ConfirmReceipt'

import { AdminLogin } from '../pages/admin/AdminLogin'
import { VerificationQueue } from '../pages/admin/VerificationQueue'
import { AttackDemo } from '../pages/admin/AttackDemo'
import { SmsInbox } from '../pages/admin/SmsInbox'

import { DevComponents } from '../pages/dev/Components'

/**
 * The route table.
 *
 * Short paths (`/j`, `/t`, `/c`, `/s`, `/b`, `/r`) are the ones that go into
 * a text message, so they stay as short as SMS copy needs.
 *
 * The SMS-link routes are never guarded: a link plus a code is the
 * credential there, and the pages themselves say what they can and cannot do
 * without an account.
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/r/:slug" element={<RiderProfile />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/v/:token" element={<VerifyResultPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Sender, before sign-in */}
      <Route element={<SenderLayout mode="auth" />}>
        <Route path="/sender/signin" element={<SenderSignIn />} />
        <Route path="/sender/code" element={<SenderCodeEntry />} />
      </Route>

      {/* Sender, signed in */}
      <Route element={<SenderLayout mode="app" />}>
        <Route
          element={
            <RequireRole
              roles={['customer', 'merchant', 'admin']}
              signInAt="/sender/signin"
            />
          }
        >
          <Route path="/sender" element={<Navigate to="/sender/new" replace />} />
          <Route path="/sender/new" element={<NewBooking />} />
          <Route path="/sender/choose" element={<ChooseRider />} />
          <Route path="/sender/quote" element={<Quote />} />
          <Route path="/sender/bookings" element={<MyBookings />} />
          <Route path="/sender/bookings/:id" element={<BookingStatus />} />
        </Route>
        <Route path="/sender/session" element={<SenderSession />} />
      </Route>

      {/* Rider, before log-in */}
      <Route element={<RiderLayout mode="signup" />}>
        <Route path="/rider/signup" element={<RiderSignUp />} />
      </Route>
      <Route element={<RiderLayout mode="login" />}>
        <Route path="/rider/login" element={<RiderLogIn />} />
      </Route>

      {/* Rider, logged in */}
      <Route element={<RiderLayout mode="app" />}>
        <Route element={<RequireRole roles={['rider']} signInAt="/rider/login" />}>
          <Route
            path="/rider"
            element={<Navigate to="/rider/dashboard" replace />}
          />
          <Route path="/rider/dashboard" element={<RiderDashboard />} />
          <Route path="/rider/jobs" element={<MyJobs />} />
          <Route path="/rider/log-job" element={<LogJob />} />
          <Route path="/rider/balance" element={<Balance />} />
          <Route path="/rider/verification" element={<RiderVerification />} />
          <Route path="/rider/share" element={<ShareProfile />} />
        </Route>
      </Route>

      {/* Opened from a text. A link plus a code is the credential. */}
      <Route element={<SmsLinkLayout role="rider" />}>
        <Route path="/j/:token" element={<JobInvite />} />
        <Route path="/rider/job/:id" element={<JobProgress />} />
      </Route>
      <Route element={<SmsLinkLayout role="recipient" />}>
        <Route path="/t/:token" element={<Tracking />} />
        <Route path="/c/:token" element={<ConfirmReceipt />} />
      </Route>
      <Route element={<SmsLinkLayout role="sender" />}>
        <Route path="/s/:token" element={<RatePage />} />
      </Route>
      <Route element={<SmsLinkLayout role="public" />}>
        <Route path="/b/:token" element={<PostService />} />
      </Route>

      {/* Admin */}
      <Route element={<AdminLayout mode="login" />}>
        <Route path="/admin/login" element={<AdminLogin />} />
      </Route>
      <Route element={<AdminLayout mode="app" />}>
        <Route element={<RequireRole roles={['admin']} signInAt="/admin/login" />}>
          <Route path="/admin" element={<Navigate to="/admin/queue" replace />} />
          <Route path="/admin/queue" element={<VerificationQueue />} />
          <Route path="/admin/attack-demo" element={<AttackDemo />} />
          <Route path="/admin/sms" element={<SmsInbox />} />
        </Route>
      </Route>

      {/* Development only: the component gallery. */}
      <Route path="/dev/components" element={<DevComponents />} />
    </Routes>
  )
}
