import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, PageHeader } from '../../components/Page'
import { Button } from '../../components/Button'
import { Banner } from '../../components/Banner'
import { CodeInput } from '../../components/CodeInput'
import { DemoInbox } from '../../components/DemoInbox'
import { useMutation } from '../../lib/useApi'
import { useAuth } from '../../state/useAuth'
import { maskPhone } from '../../domain/phone'
import * as api from '../../api/endpoints'

/**
 * Design: SenderCode.dc.html
 *
 * The 6-digit code that confirms a new number. Real SMS is off in the demo,
 * so the inbox panel underneath shows the message that would have been sent
 * — the code is readable there rather than being a dead end.
 */
export function SenderCodeEntry() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()
  const { user, confirmPhone } = useAuth()

  const confirm = useMutation(confirmPhone)
  const resend = useMutation(api.resendPhoneCode)

  async function submit(value: string) {
    const confirmed = await confirm.run(value)
    if (confirmed) navigate('/sender/new', { replace: true })
  }

  if (!user) {
    return (
      <Page>
        <div className="wrap">
          <div className="narrowc col" style={{ gap: 20 }}>
            <Banner tone="warn" title="Start the sign-up first">
              This page confirms a number we have just texted. Create your
              account and we will bring you back here.
            </Banner>
            <Button to="/sender/signin" block>
              Go to sign in
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  if (user.phone_confirmed) {
    return (
      <Page>
        <div className="wrap">
          <div className="narrowc col" style={{ gap: 20 }}>
            <Banner tone="ok" title="This number is already confirmed">
              Nothing more to do here.
            </Banner>
            <Button to="/sender/new" block>
              Start a booking
            </Button>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div className="wrap col" style={{ gap: 32 }}>
        <div className="narrowc col" style={{ gap: 24 }}>
          <PageHeader title="Enter your code">
            <p className="muted">
              We sent a 6-digit code to {maskPhone(user.phone)}.
            </p>
          </PageHeader>

          <div className="card lg col" style={{ gap: 20 }}>
            {confirm.error ? (
              <Banner tone="bad" live title="That did not work">
                {confirm.error.message}
              </Banner>
            ) : null}

            <CodeInput
              label="6-digit code"
              value={code}
              onChange={setCode}
              length={6}
              onComplete={submit}
              autoFocus
            />

            <Button
              size="lg"
              block
              loading={confirm.pending}
              disabled={code.length !== 6}
              onClick={() => submit(code)}
            >
              Check code
            </Button>

            <div className="row sb">
              <span className="muted">Codes work for 15 minutes.</span>
              <Button
                variant="text"
                size="sm"
                loading={resend.pending}
                onClick={() => void resend.run()}
              >
                Resend code
              </Button>
            </div>

            {resend.error ? (
              <Banner tone="warn" live title="We could not resend it">
                {resend.error.message}
              </Banner>
            ) : null}
          </div>

          <DemoInbox phone={user.phone} title="The code we texted you" />
        </div>
      </div>
    </Page>
  )
}
