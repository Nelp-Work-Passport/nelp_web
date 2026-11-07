import { useState } from 'react'
import { Page, PageHeader } from '../../components/Page'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { DemoInbox } from '../../components/DemoInbox'
import { PhoneInput } from '../../components/PhoneInput'
import { SourceLine } from '../../components/SourceLine'
import { Chip } from '../../components/Chip'
import { useApi } from '../../lib/useApi'
import { parsePhone } from '../../domain/phone'
import * as api from '../../api/endpoints'

/** The seeded demo numbers, so a code can be found without typing one out. */
const KNOWN: { label: string; phone: string }[] = [
  { label: 'Amina W. (rider)', phone: '+254700000001' },
  { label: 'Brian O. (rider)', phone: '+254700000002' },
  { label: 'Chebet K. (rider)', phone: '+254700000003' },
  { label: 'Customer 1', phone: '+254700000101' },
  { label: 'Customer 2', phone: '+254700000102' },
]

/**
 * Design: SmsInbox.dc.html
 *
 * Real SMS is off, so every message Nelp would send is readable here. The
 * API's inbox is per-number rather than one global list, so this is a lookup
 * by phone: pick a known demo number or type any other.
 */
export function SmsInbox() {
  const [input, setInput] = useState('')
  const [phone, setPhone] = useState<string>(KNOWN[0].phone)
  const health = useApi(() => api.health(), [])

  const parsed = input.trim() ? parsePhone(input) : null
  const live = health.data?.sms_provider && health.data.sms_provider !== 'demo'

  return (
    <Page>
      <div className="wrap col" style={{ gap: 24 }}>
        <PageHeader title="SMS inbox">
          <p className="muted" style={{ maxWidth: 760 }}>
            The demo fallback. Nothing is actually texted, so every message a
            booking would send is readable here with its code.
          </p>
        </PageHeader>

        {live ? (
          <Banner tone="warn" title="A live SMS provider is switched on">
            This instance is set to <b>{health.data?.sms_provider}</b>, so the
            demo inbox is turned off and real texts are being sent.
          </Banner>
        ) : (
          <Banner tone="info" title="SMS sending is off">
            Messages are written here instead of being sent. Copy a code from
            a message to use it in the flows.
          </Banner>
        )}

        <div className="card col" style={{ gap: 16 }}>
          <div className="col" style={{ gap: 8 }}>
            <span className="lab" id="known-label">
              Seeded demo numbers
            </span>
            <div className="row" style={{ gap: 10 }} role="group" aria-labelledby="known-label">
              {KNOWN.map((entry) => (
                <Chip
                  key={entry.phone}
                  selected={phone === entry.phone}
                  onClick={() => {
                    setPhone(entry.phone)
                    setInput('')
                  }}
                >
                  {entry.label}
                </Chip>
              ))}
            </div>
          </div>

          <hr className="hr" />

          <PhoneInput
            label="Or any other number"
            value={input}
            onChange={setInput}
            error={parsed && !parsed.ok ? parsed.error : null}
            hint="A recipient's number, for instance, to read the delivery code they were sent."
          />
          <Button
            variant="secondary"
            disabled={!parsed?.ok}
            onClick={() => {
              if (parsed?.ok) setPhone(parsed.e164)
            }}
            style={{ alignSelf: 'flex-start' }}
          >
            Read that inbox
          </Button>
        </div>

        <DemoInbox phone={phone} title={`Messages sent to ${phone}`} />

        <SourceLine>
          The inbox endpoint is public, which is why it must be off before real
          customers use Nelp: anyone knowing a number could read its codes.
        </SourceLine>
      </div>
    </Page>
  )
}
