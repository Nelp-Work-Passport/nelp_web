import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, PageHeader } from '../../components/Page'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { KeyValue } from '../../components/SourceLine'
import { Modal } from '../../components/Modal'
import { useAuth } from '../../state/useAuth'
import { maskPhone } from '../../domain/phone'

/**
 * Design: Session.dc.html
 *
 * The account page. Who you are signed in as, and the one way out.
 */
export function SenderSession() {
  const { user, signOut } = useAuth()
  const [confirming, setConfirming] = useState(false)
  const navigate = useNavigate()

  if (!user) {
    return (
      <Page>
        <div className="wrap">
          <div className="narrowc col" style={{ gap: 20 }}>
            <PageHeader title="You are signed out" />
            <p className="muted">
              Your bookings are kept against your phone number, so signing in
              again brings them back.
            </p>
            <Button size="lg" block to="/sender/signin">
              Sign in again
            </Button>
            <Button variant="text" to="/">
              Go to the home page
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div className="wrap">
        <div className="narrowc col" style={{ gap: 24 }}>
          <PageHeader eyebrow="Account" title="Your account" />

          <div className="card lg col" style={{ gap: 18 }}>
            <div className="row" style={{ gap: 16, flexWrap: 'nowrap' }}>
              <Avatar name={user.display_name} size="lg" variant="a2" />
              <div className="col" style={{ gap: 4 }}>
                <div className="b" style={{ fontSize: 20 }}>
                  {user.display_name}
                </div>
                <span className="muted">{maskPhone(user.phone)}</span>
              </div>
            </div>

            <KeyValue
              items={[
                {
                  key: 'phone',
                  label: 'Phone',
                  note: 'Shown masked everywhere else in Nelp',
                  value: maskPhone(user.phone),
                },
                {
                  key: 'confirmed',
                  label: 'Phone confirmed',
                  value: user.phone_confirmed ? (
                    <Badge tone="ok" icon="check">
                      Confirmed
                    </Badge>
                  ) : (
                    <Badge tone="warn" icon="alert">
                      Not confirmed
                    </Badge>
                  ),
                },
                {
                  key: 'roles',
                  label: 'What you can do',
                  value: user.roles.join(', '),
                },
              ]}
            />

            {!user.phone_confirmed ? (
              <Banner
                tone="warn"
                title="Confirm your number"
                actions={
                  <Button size="sm" to="/sender/code">
                    Enter the code
                  </Button>
                }
              >
                We texted you a 6-digit code. Confirming the number proves it
                is yours.
              </Banner>
            ) : null}

            <Button variant="secondary" block onClick={() => setConfirming(true)}>
              Log out
            </Button>
          </div>

          <Modal
            open={confirming}
            onClose={() => setConfirming(false)}
            title="Log out of Nelp?"
            actions={
              <>
                <Button
                  onClick={() => {
                    signOut()
                    navigate('/', { replace: true })
                  }}
                >
                  Log out
                </Button>
                <Button variant="secondary" onClick={() => setConfirming(false)}>
                  Stay signed in
                </Button>
              </>
            }
          >
            <p className="muted">
              You will need your PIN to sign in again. Bookings in progress
              carry on either way.
            </p>
          </Modal>
        </div>
      </div>
    </Page>
  )
}
