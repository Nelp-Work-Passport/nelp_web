import { useState } from 'react'

import { Page } from '../../components/Page'
import { Button, type ButtonVariant } from '../../components/Button'
import { TextInput, TextArea, Select } from '../../components/TextInput'
import { PhoneInput, AmountInput } from '../../components/PhoneInput'
import { CodeInput } from '../../components/CodeInput'
import { PinInput } from '../../components/PinInput'
import {
  AssuredBadge,
  Badge,
  DemoBadge,
  VerifiedTick,
  type BadgeTone,
} from '../../components/Badge'
import { Banner, VerifyBanner, type BannerTone } from '../../components/Banner'
import { Toast } from '../../components/Toast'
import { Modal } from '../../components/Modal'
import { Tabs, TabPanel } from '../../components/Tabs'
import { Table } from '../../components/Table'
import { Chip, PillOption, Toggle, ToggleIndicator } from '../../components/Chip'
import { StarRating } from '../../components/StarRating'
import { Avatar, AvatarIcon } from '../../components/Avatar'
import { ScoreBox, ScoreRing } from '../../components/ScoreRing'
import { ScoreBreakdown } from '../../components/ScoreBreakdown'
import { Timeline } from '../../components/Timeline'
import { Countdown } from '../../components/Countdown'
import { KeyValue, SourceLine, Stat } from '../../components/SourceLine'
import { EmptyState } from '../../components/EmptyState'
import { Skeleton, SkeletonCard } from '../../components/Skeleton'
import { SmsBubble, SmsText } from '../../components/SmsBubble'
import { CopyLink } from '../../components/CopyLink'
import { RoleChip } from '../../components/RoleChip'
import { Icon, type IconName } from '../../components/Icon'
import {
  AvailabilityBadge,
  RiderCard,
  RiderCardSkeleton,
} from '../../components/RiderCard'
import {
  EvidenceList,
  Expandable,
  MaskedNumber,
} from '../../components/EvidenceList'

import type { Rider, Role } from '../../domain/types'
import { makeScore } from '../../domain/score'
import { maskPhone } from '../../domain/phone'
import { formatEffect, formatKes } from '../../domain/money'
import { RIDER_ACCEPT_MS } from '../../domain/countdown'
import { starWord } from '../../domain/rating'
import { stepsUpTo } from '../../domain/steps'

/**
 * The component gallery.
 *
 * Every component in every state it has to handle: loading, empty, error and
 * disabled. This is the page to compare against nelp.css when something
 * looks wrong, and the page to check at 1280px and 390px.
 */
export function DevComponents() {
  return (
    <Page>
      <div className="wrap col" style={{ gap: 48 }}>
        <header className="col" style={{ gap: 8 }}>
          <div className="eyebrow">Development</div>
          <h1 className="display" style={{ fontSize: 44 }}>
            Components
          </h1>
          <p className="lead" style={{ maxWidth: 760 }}>
            Every component in the states it has to handle. Nothing here is
            part of the product; it is the reference for building the pages.
          </p>
        </header>

        <Buttons />
        <Inputs />
        <Codes />
        <Badges />
        <Banners />
        <Feedback />
        <Navigation />
        <Trust />
        <Progress />
        <Figures />
        <Blanks />
        <Messages />
        <Roles />
        <Icons />
      </div>
    </Page>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="col" style={{ gap: 20 }}>
      <h2 className="title" style={{ fontSize: 24 }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Case({
  label,
  children,
  wide,
}: {
  label: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div
      className="col"
      style={{ gap: 10, gridColumn: wide ? '1/-1' : undefined }}
    >
      <div className="lab">{label}</div>
      <div className="statebox col" style={{ gap: 12 }}>
        {children}
      </div>
    </div>
  )
}

function Grid({
  children,
  min = 280,
}: {
  children: React.ReactNode
  min?: number
}) {
  return (
    <div
      className="cards"
      style={{
        gridTemplateColumns: `repeat(auto-fit,minmax(min(${min}px,100%),1fr))`,
        alignItems: 'start',
      }}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ Buttons */

const buttonVariants: ButtonVariant[] = [
  'primary',
  'secondary',
  'text',
  'danger',
  'danger-o',
  'snd',
  'rdr',
]

function Buttons() {
  const [loading, setLoading] = useState(false)

  return (
    <Section title="Button">
      <Grid min={320}>
        {buttonVariants.map((variant) => (
          <Case key={variant} label={variant}>
            <div className="row">
              <Button variant={variant}>Default</Button>
              <Button variant={variant} size="lg">
                Large
              </Button>
              <Button variant={variant} size="sm">
                Small
              </Button>
            </div>
            <div className="row">
              <Button variant={variant} loading>
                Sending code
              </Button>
              <Button variant={variant} disabled>
                Disabled
              </Button>
            </div>
            <Button variant={variant} block>
              Block
            </Button>
          </Case>
        ))}

        <Case label="With an icon">
          <Button variant="primary">
            <Icon name="check" />
            Approve
          </Button>
          <Button variant="secondary">
            Open the SMS link
            <Icon name="arrow-right" />
          </Button>
        </Case>

        <Case label="As a link">
          <Button to="/dev/components">Router link</Button>
          <Button variant="secondary" href="#main">
            Plain anchor
          </Button>
          <Button to="/dev/components" disabled>
            Disabled link, rendered as a button
          </Button>
        </Case>

        <Case label="Loading, toggled">
          <Button loading={loading} onClick={() => setLoading(true)} block>
            {loading ? 'Generating 200 jobs' : 'Generate fake rider'}
          </Button>
          <Button variant="text" size="sm" onClick={() => setLoading(false)}>
            Reset
          </Button>
        </Case>

        <Case label="Full width below 760px only">
          <Button mobileBlock>Log a job</Button>
        </Case>
      </Grid>
    </Section>
  )
}

/* ------------------------------------------------------------------- Inputs */

function Inputs() {
  const [text, setText] = useState('Box of 6 shirts')
  const [phone, setPhone] = useState('712 345 678')
  const [shortPhone, setShortPhone] = useState('712 34')
  const [amount, setAmount] = useState('4,500')
  const [pin, setPin] = useState('')
  const [weakPin, setWeakPin] = useState('1234')
  const [area, setArea] = useState('CBD')
  const [reason, setReason] = useState('')

  return (
    <Section title="TextInput, Select, PhoneInput">
      <Grid min={300}>
        <Case label="Text: default, hint, error, disabled, loading">
          <TextInput
            label="What are you sending?"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <TextInput
            label="Riding licence number"
            placeholder="e.g. DL-4821907"
            hint="Shown to admins only."
            defaultValue=""
          />
          <TextInput
            label="National ID number"
            defaultValue="3124"
            error="A national ID has 8 digits."
          />
          <TextInput label="Phone number" defaultValue="712 345 678" disabled />
          <TextInput label="Score" defaultValue="" loading />
        </Case>

        <Case label="Text: read-only and optional">
          <TextInput label="Profile link" value="nelp.co/r/amina-k" readOnly />
          <TextInput label="Amount" optional placeholder="300" defaultValue="" />
        </Case>

        <Case label="Phone: +254 prefix">
          <PhoneInput label="Phone number" value={phone} onChange={setPhone} />
          <PhoneInput
            label="Recipient's phone number"
            value={shortPhone}
            onChange={setShortPhone}
            error="That number looks too short. Use 9 digits after +254."
            hint={`They get an SMS link to confirm receipt. We show it as ${maskPhone('712345481')} from now on.`}
          />
          <PhoneInput
            label="Phone number"
            value="712 345 678"
            onChange={() => {}}
            disabled
          />
        </Case>

        <Case label="Amount: KES prefix">
          <AmountInput
            label="Declared value"
            value={amount}
            onChange={setAmount}
            hint={
              <>
                Used for the insurance quote. <DemoBadge />
              </>
            }
          />
        </Case>

        <Case label="Select">
          <Select
            label="Pickup area"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            options={['CBD', 'Westlands', 'Kilimani', 'Kasarani', 'Embakasi']}
          />
          <Select
            label="Drop-off area"
            options={['Westlands', 'CBD']}
            error="Pick a different area from the pickup."
          />
          <Select label="Job type" options={['Parcel delivery']} disabled />
        </Case>

        <Case label="Textarea">
          <TextArea
            label="Reason (the rider will read this)"
            placeholder="e.g. The plate does not match the licence."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
          <TextArea
            label="Reason (the rider will read this)"
            value=""
            onChange={() => {}}
            error="Write a short reason to reject."
          />
        </Case>

        <Case label="PIN: masked, with Show and a strength meter">
          <PinInput
            label="Create a PIN"
            value={pin}
            onChange={setPin}
            showStrength
            hint="4 to 6 digits."
          />
          <PinInput
            label="PIN"
            value={weakPin}
            onChange={setWeakPin}
            error="That PIN is too easy to guess. Use 4 to 6 digits that are not in a row."
          />
          <PinInput
            label="PIN"
            value="48210"
            onChange={() => {}}
            disabled
          />
        </Case>
      </Grid>
    </Section>
  )
}

/* -------------------------------------------------------------------- Codes */

function Codes() {
  const [four, setFour] = useState('482')
  const [six, setSix] = useState('482')
  const [done, setDone] = useState<string | null>(null)

  return (
    <Section title="CodeInput">
      <Grid min={300}>
        <Case label="4 digits: receipt, rating">
          <CodeInput
            label="Enter the 4-digit code from your SMS"
            value={four}
            onChange={setFour}
            hint="We sent it to 07•• ••• 481."
            onComplete={setDone}
          />
          <div className="cap" aria-live="polite">
            {done ? `Completed with ${done}` : 'Type or paste four digits'}
          </div>
        </Case>

        <Case label="6 digits: sender sign-in">
          <CodeInput
            label="6-digit code"
            value={six}
            onChange={setSix}
            length={6}
          />
        </Case>

        <Case label="Error, with tries left">
          <CodeInput
            label="Enter the 4-digit code from your SMS"
            value="4819"
            onChange={() => {}}
            error="That code is not right. You have 2 tries left."
          />
        </Case>

        <Case label="Secret: a PIN typed into code boxes">
          <CodeInput
            label="Enter your PIN to accept"
            value="48"
            onChange={() => {}}
            secret
            hint="The 4-digit PIN you set when you joined."
          />
        </Case>

        <Case label="Disabled">
          <CodeInput
            label="6-digit code"
            value="4821"
            onChange={() => {}}
            length={6}
            disabled
          />
        </Case>
      </Grid>
    </Section>
  )
}

/* ------------------------------------------------------------------- Badges */

const badgeTones: BadgeTone[] = ['ok', 'warn', 'bad', 'info', 'neu']

function Badges() {
  return (
    <Section title="Badge, Chip, Toggle">
      <Grid min={300}>
        <Case label="Badge: every tone, each with an icon">
          <div className="row">
            <Badge tone="ok" icon="check">
              Confirmed
            </Badge>
            <Badge tone="warn" icon="clock">
              Waiting for rider
            </Badge>
            <Badge tone="bad" icon="flag">
              Flagged, under review
            </Badge>
            <Badge tone="info" icon="arrow-right">
              In transit
            </Badge>
            <Badge tone="neu">Expired</Badge>
          </div>
          <div className="row">
            {badgeTones.map((tone) => (
              <Badge key={tone} tone={tone}>
                {tone}
              </Badge>
            ))}
          </div>
        </Case>

        <Case label="Demo, verified tick, Assured">
          <div className="row">
            <DemoBadge />
            <DemoBadge>Demo quote</DemoBadge>
            <VerifiedTick />
            <VerifiedTick withLabel />
            <AssuredBadge />
            <AssuredBadge>Assured, with a score of 88</AssuredBadge>
          </div>
        </Case>

        <Case label="Chip: default, selected, disabled">
          <ChipRow />
        </Case>

        <Case label="PillOption: a radio set">
          <PaymentChoice />
        </Case>

        <Case label="Toggle: on, off, disabled, and the read-only bar copy">
          <ToggleRow />
        </Case>
      </Grid>
    </Section>
  )
}

function ChipRow() {
  const [picked, setPicked] = useState<string[]>(['On time', 'Polite'])
  const tags = ['On time', 'Careful', 'Polite', 'Good communication']
  return (
    <>
      <div className="row">
        {tags.map((tag) => (
          <Chip
            key={tag}
            selected={picked.includes(tag)}
            onClick={() =>
              setPicked((current) =>
                current.includes(tag)
                  ? current.filter((item) => item !== tag)
                  : [...current, tag],
              )
            }
          >
            {tag}
          </Chip>
        ))}
      </div>
      <div className="row">
        <Chip disabled>Disabled</Chip>
        <Chip selected disabled>
          Selected and disabled
        </Chip>
      </div>
    </>
  )
}

function PaymentChoice() {
  const [method, setMethod] = useState('mpesa')
  return (
    <>
      <PillOption
        name="dev-pay"
        title="M-Pesa"
        description="We send a prompt to your phone"
        selected={method === 'mpesa'}
        onSelect={() => setMethod('mpesa')}
      />
      <PillOption
        name="dev-pay"
        title="Cash"
        description="Pay the rider when they collect"
        selected={method === 'cash'}
        onSelect={() => setMethod('cash')}
      />
      <PillOption
        name="dev-pay-off"
        title="M-Pesa · unavailable"
        description="Payments are switched off"
        disabled
      />
    </>
  )
}

function ToggleRow() {
  const [online, setOnline] = useState(true)
  return (
    <>
      <div className="tgl-row">
        <Toggle on={online} onChange={setOnline} label="Online" />
        <span style={{ fontSize: 20 }}>{online ? 'Online' : 'Offline'}</span>
      </div>
      <div className="tgl-row">
        <Toggle on={false} onChange={() => {}} label="Online" disabled />
        <span className="muted">Disabled</span>
      </div>
      <div className="tgl-row">
        <ToggleIndicator on label="Online" />
        <span className="muted">Read-only, as in the rider nav bar</span>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ Banners */

const bannerTones: BannerTone[] = ['ok', 'warn', 'bad', 'info', 'neu']

function Banners() {
  return (
    <Section title="Banner">
      <div className="col" style={{ gap: 12 }}>
        {bannerTones.map((tone) => (
          <Banner key={tone} tone={tone} title={`Tone: ${tone}`}>
            Every tone pairs its colour with an icon and words, so the meaning
            does not depend on telling the colours apart.
          </Banner>
        ))}
        <Banner
          tone="warn"
          title="SMS not delivered"
          actions={
            <Button variant="primary" size="sm">
              Resend
            </Button>
          }
        >
          The text to {maskPhone('712345481')} did not arrive. The delivery can
          carry on.
        </Banner>
        <Banner tone="bad">200 jobs from only 3 phone numbers</Banner>
        <Banner tone="ok" live title="Wanjiru M. approved">
          Announced when it appears, because it reports something that just
          happened.
        </Banner>
      </div>

      <Grid min={320}>
        <Case label="VerifyBanner: authentic" wide>
          <VerifyBanner tone="ok" heading="Authentic">
            <p>
              This profile matches Nelp&rsquo;s records. It was issued on{' '}
              <b>7 Nov 2026, 10:12 AM</b> and nothing has changed since.
            </p>
          </VerifyBanner>
        </Case>
        <Case label="VerifyBanner: stale" wide>
          <VerifyBanner tone="warn" heading="Stale. This link is out of date.">
            <p>
              The link is real, but it was issued on <b>12 Sep 2026</b> and the
              score has changed since. Ask the rider for a fresh link.
            </p>
          </VerifyBanner>
        </Case>
        <Case label="VerifyBanner: tampered" wide>
          <VerifyBanner tone="bad" heading="Tampered. Do not trust this.">
            <p>
              The details in this link do not match Nelp&rsquo;s records. Do
              not lend or insure on it.
            </p>
          </VerifyBanner>
        </Case>
      </Grid>
    </Section>
  )
}

/* ----------------------------------------------------------------- Feedback */

function Feedback() {
  const [open, setOpen] = useState(false)

  return (
    <Section title="Toast, Modal">
      <Grid min={320}>
        <Case label="Toast">
          <Toast title="Link copied">Paste it into WhatsApp or SMS.</Toast>
          <Toast tone="bad" title="We could not send the SMS">
            Check the number, then try again in a minute.
          </Toast>
        </Case>

        <Case label="Modal: inline, as the state sheet shows it">
          <Modal
            inline
            title="Log out of Nelp?"
            actions={
              <>
                <Button>Log out</Button>
                <Button variant="secondary">Stay signed in</Button>
              </>
            }
          >
            <p className="muted">
              You will need a new SMS code to sign in again. Bookings in
              progress carry on.
            </p>
          </Modal>
        </Case>

        <Case label="Modal: the real overlay, with focus held inside">
          <Button onClick={() => setOpen(true)}>Open the dialog</Button>
          <p className="cap">
            Escape closes it, Tab cycles within it, and focus returns to this
            button.
          </p>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            title="Reject Kevin M.?"
            actions={
              <>
                <Button variant="danger" disabled>
                  Reject rider
                </Button>
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </>
            }
          >
            <TextArea
              label="Reason (the rider will read this)"
              placeholder="e.g. The plate does not match the licence."
              defaultValue=""
            />
          </Modal>
        </Case>
      </Grid>
    </Section>
  )
}

/* --------------------------------------------------------------- Navigation */

type DevTab = 'all' | 'current' | 'past' | 'archived'

interface BookingRow {
  id: string
  when: string
  route: string
  rider: string
  total: number
  expired?: boolean
}

const rows: BookingRow[] = [
  {
    id: 'b1',
    when: 'Mon 9 Nov, 9:00 AM',
    route: 'CBD to Westlands',
    rider: 'Amina K.',
    total: 390,
  },
  {
    id: 'b2',
    when: 'Sat 7 Nov, 2:30 PM',
    route: 'Kilimani to Embakasi',
    rider: 'Wanjiru M.',
    total: 550,
  },
  {
    id: 'b3',
    when: 'Tue 3 Nov, 11:00 AM',
    route: 'Kilimani to CBD',
    rider: 'Wanjiru M.',
    total: 0,
    expired: true,
  },
]

function Navigation() {
  const [tab, setTab] = useState<DevTab>('all')

  return (
    <Section title="Tabs, Table">
      <Tabs
        label="Bookings"
        value={tab}
        onChange={setTab}
        items={[
          { id: 'all', label: 'All', count: 6 },
          { id: 'current', label: 'Current', count: 2 },
          { id: 'past', label: 'Past', count: 4 },
          { id: 'archived', label: 'Archived', count: 0, disabled: true },
        ]}
      />
      <TabPanel id={tab}>
        <p className="cap">
          Arrow keys move between tabs. The selected tab is {tab}.
        </p>
      </TabPanel>

      <Grid min={360}>
        <Case label="Table: rows, with one dimmed" wide>
          <Table
            caption="Example bookings"
            rows={rows}
            rowKey={(row) => row.id}
            rowDim={(row) => Boolean(row.expired)}
            minWidth={620}
            columns={[
              { key: 'when', header: 'When', nowrap: true, cell: (r) => r.when },
              { key: 'route', header: 'Route', cell: (r) => r.route },
              {
                key: 'rider',
                header: 'Rider',
                cell: (r) => (
                  <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
                    <Avatar name={r.rider} size="sm" />
                    {r.rider}
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                cell: (r) =>
                  r.expired ? (
                    <Badge tone="neu">Expired</Badge>
                  ) : (
                    <Badge tone="warn" icon="clock">
                      Waiting for rider
                    </Badge>
                  ),
              },
              {
                key: 'total',
                header: 'Total',
                align: 'right',
                nowrap: true,
                cell: (r) => formatKes(r.total),
              },
              {
                key: 'open',
                header: 'Open',
                headerHidden: true,
                cell: () => (
                  <Button variant="secondary" size="sm">
                    Open
                  </Button>
                ),
              },
            ]}
          />
        </Case>

        <Case label="Table: loading" wide>
          <Table
            caption="Loading bookings"
            rows={[]}
            rowKey={() => ''}
            loading
            columns={[
              { key: 'a', header: 'When', cell: () => null },
              { key: 'b', header: 'Route', cell: () => null },
              { key: 'c', header: 'Status', cell: () => null },
            ]}
          />
        </Case>

        <Case label="Table: empty" wide>
          <Table
            caption="No bookings"
            rows={[]}
            rowKey={() => ''}
            columns={[{ key: 'a', header: 'When', cell: () => null }]}
            empty={
              <EmptyState
                title="No bookings yet"
                icon="calendar"
                actions={<Button>New booking</Button>}
              >
                Book your first delivery in about a minute.
              </EmptyState>
            }
          />
        </Case>
      </Grid>
    </Section>
  )
}

/* -------------------------------------------------------------------- Trust */

const amina: Rider = {
  id: 'r-amina',
  slug: 'amina-k',
  name: 'Amina K.',
  initials: 'AK',
  avatarVariant: '',
  area: 'Westlands',
  phone: '0712345214',
  score: makeScore(
    { variety: 40, spread: 30, repeat: 18 },
    {
      confirmedJobs: 143,
      distinctRecipients: 61,
      activeWeeks: 34,
      repeatRecipients: 27,
    },
  ),
  rating: 4.8,
  ratingCount: 118,
  verification: 'verified',
  assured: true,
  flagged: false,
  flags: [],
  online: true,
}

const brian: Rider = {
  id: 'r-brian',
  slug: 'brian-o',
  name: 'Brian O.',
  initials: 'BO',
  avatarVariant: 'a3',
  area: 'Kasarani',
  phone: '0712345118',
  score: makeScore(
    { variety: 24, spread: 19, repeat: 12 },
    {
      confirmedJobs: 31,
      distinctRecipients: 12,
      activeWeeks: 11,
      repeatRecipients: 6,
    },
  ),
  rating: 4.5,
  ratingCount: 22,
  verification: 'verified',
  assured: false,
  flagged: false,
  flags: [],
  online: false,
  availableFrom: '11:00 AM',
}

const kevin: Rider = {
  id: 'r-kevin',
  slug: 'kevin-m',
  name: 'Kevin M.',
  initials: 'KM',
  avatarVariant: 'a4',
  area: 'Kasarani',
  phone: '0712345772',
  score: makeScore(
    { variety: 8, spread: 3, repeat: 0 },
    {
      confirmedJobs: 3,
      distinctRecipients: 3,
      activeWeeks: 1,
      repeatRecipients: 0,
    },
  ),
  rating: null,
  ratingCount: 0,
  verification: 'not-submitted',
  assured: false,
  flagged: false,
  flags: [],
  online: true,
}

const samuel: Rider = {
  id: 'r-samuel',
  slug: 'samuel-k',
  name: 'Samuel K.',
  initials: 'SK',
  avatarVariant: 'a2',
  area: 'CBD',
  phone: '0712345001',
  score: makeScore(
    { variety: 2, spread: 9, repeat: 2 },
    {
      confirmedJobs: 200,
      distinctRecipients: 3,
      activeWeeks: 1,
      repeatRecipients: 3,
    },
  ),
  rating: 5,
  ratingCount: 200,
  verification: 'not-submitted',
  assured: false,
  flagged: true,
  flags: [
    { id: 'f1', text: '200 jobs from only 3 phone numbers', severity: 'bad' },
    { id: 'f2', text: 'All confirmed within 2 hours', severity: 'bad' },
    { id: 'f3', text: 'No work in any other week', severity: 'warn' },
  ],
  online: true,
}

function Trust() {
  return (
    <Section title="Avatar, ScoreRing, ScoreBreakdown, RiderCard">
      <Grid min={300}>
        <Case label="Avatar: four sizes, four palettes">
          <div className="row">
            <Avatar name="Amina K." size="sm" />
            <Avatar name="Amina K." />
            <Avatar name="Amina K." size="lg" />
            <Avatar name="Amina K." size="xl" />
          </div>
          <div className="row">
            <Avatar name="Amina K." size="lg" />
            <Avatar name="Samuel K." size="lg" variant="a2" />
            <Avatar name="Brian O." size="lg" variant="a3" />
            <Avatar name="Kevin M." size="lg" variant="a4" />
          </div>
          <div className="row">
            <Avatar name="John" size="lg" />
            <AvatarIcon size="lg" variant="a3">
              <Icon name="clock" size="lg" />
            </AvatarIcon>
            <AvatarIcon size="sm">1</AvatarIcon>
          </div>
          <p className="cap">
            Initials only. There are no photographs or logos anywhere in Nelp.
          </p>
        </Case>

        <Case label="ScoreRing: each band, and no score">
          <div className="row" style={{ gap: 24 }}>
            <ScoreBox score={88} band="strong" />
            <ScoreBox score={55} band="building" />
            <ScoreBox score={13} band="flagged" />
            <ScoreBox score={null} band="none" note="3 of 5 confirmed jobs" />
          </div>
          <div className="row" style={{ gap: 20, alignItems: 'flex-end' }}>
            <ScoreRing score={88} band="strong" size={64} />
            <ScoreRing score={88} band="strong" size={88} />
            <ScoreRing score={88} band="strong" size={136} />
            <ScoreRing score={88} band="strong" size={168} />
          </div>
        </Case>

        <Case label="ScoreBreakdown: with and without sources" wide>
          <div className="col" style={{ gap: 6 }}>
            <ScoreBreakdown
              parts={amina.score.parts}
              sources={{
                variety:
                  '61 different recipients across 143 jobs. More different people means a higher score.',
                spread:
                  'Confirmed jobs in 34 different weeks. Steady work over time scores higher than one busy week.',
                repeat:
                  '27 recipients booked her more than once. People coming back is a good sign.',
              }}
            />
          </div>
          <hr className="hr" />
          <div className="col" style={{ gap: 6 }}>
            <ScoreBreakdown parts={samuel.score.parts} plain />
          </div>
        </Case>

        <Case label="RiderCard: available, busy, flagged, loading" wide>
          <RiderCard
            rider={amina}
            availability={<AvailabilityBadge online />}
            action={<Button>Choose Amina</Button>}
          />
          <RiderCard
            rider={brian}
            availability={
              <AvailabilityBadge
                online={false}
                availableFrom={brian.availableFrom}
              />
            }
            action={
              <Button variant="secondary" disabled>
                Not available
              </Button>
            }
            style={{ background: '#F8F9F8' }}
          />
          <RiderCard
            rider={kevin}
            availability={<AvailabilityBadge online />}
            tags={<Badge tone="neu">ID not verified</Badge>}
            action={
              <Button variant="secondary">Choose Kevin</Button>
            }
          />
          <RiderCard
            rider={samuel}
            availability={<AvailabilityBadge online />}
            tags={
              <Badge tone="bad" icon="flag">
                Flagged, under review
              </Badge>
            }
            action={
              <Button variant="secondary" disabled>
                Under review
              </Button>
            }
          />
          <RiderCardSkeleton />
        </Case>

        <Case label="Expandable and EvidenceList" wide>
          <Expandable value="143" label="Confirmed jobs" defaultOpen>
            <EvidenceList
              style={{ border: 0, borderRadius: 0 }}
              headers={['Date', 'Recipient', 'Status', 'Time confirmed']}
              footnote="Showing 3 of 149 jobs. 143 are confirmed and counted. 6 are not counted."
              rows={[
                {
                  key: 'e1',
                  cells: [
                    'Sat 7 Nov',
                    <MaskedNumber>{maskPhone('0712345214')}</MaskedNumber>,
                    <Badge tone="ok" icon="check">
                      Confirmed
                    </Badge>,
                    '11:52 AM',
                  ],
                },
                {
                  key: 'e2',
                  notCounted: true,
                  cells: [
                    'Thu 5 Nov',
                    <MaskedNumber>{maskPhone('0712345662')}</MaskedNumber>,
                    <>
                      <Badge tone="neu">Expired</Badge>{' '}
                      <span className="cap">not counted</span>
                    </>,
                    'Not confirmed',
                  ],
                },
                {
                  key: 'e3',
                  notCounted: true,
                  cells: [
                    'Mon 2 Nov',
                    <MaskedNumber>{maskPhone('0712345118')}</MaskedNumber>,
                    <>
                      <Badge tone="bad">Disputed</Badge>{' '}
                      <span className="cap">not counted</span>
                    </>,
                    'Not confirmed',
                  ],
                },
              ]}
            />
          </Expandable>
          <Expandable value="61" label="Different recipients">
            <EvidenceList
              style={{ border: 0, borderRadius: 0 }}
              headers={['First job', 'Recipient', 'Jobs together', 'Last confirmed']}
              rows={[
                {
                  key: 'r1',
                  cells: [
                    'Sat 7 Nov',
                    <MaskedNumber>{maskPhone('0712345214')}</MaskedNumber>,
                    '9 jobs',
                    'Sat 7 Nov',
                  ],
                },
              ]}
            />
          </Expandable>
        </Case>

        <Case label="StarRating">
          <StarRow />
          <div className="col" style={{ gap: 6 }}>
            <div className="lab">Read-only</div>
            <StarRating value={4} label="Rating" readOnly />
            <StarRating value={5} label="Rating" readOnly />
          </div>
          <div className="col" style={{ gap: 6 }}>
            <div className="lab">Disabled</div>
            <StarRating value={3} label="Rating" disabled onChange={() => {}} />
          </div>
        </Case>
      </Grid>
    </Section>
  )
}

function StarRow() {
  const [stars, setStars] = useState(4)
  return (
    <div>
      <span className="lbl">Your rating</span>
      <StarRating value={stars} onChange={setStars} label="Your rating" />
      <div className="cap" aria-live="polite">
        {stars} of 5 stars · {starWord(stars)}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- Progress */

const senderSteps = [
  { label: 'Requested', note: '8:43 AM' },
  { label: 'Accepted' },
  { label: 'Picked up' },
  { label: 'In transit' },
  { label: 'Delivered' },
  { label: 'Receipt confirmed' },
  { label: 'Rated' },
]

const riderSteps = [
  { label: 'Accepted' },
  { label: 'Started' },
  { label: 'Arrived' },
  { label: 'Confirmed' },
]

function Progress() {
  const [deadline, setDeadline] = useState(() => Date.now() + RIDER_ACCEPT_MS)
  const [expired, setExpired] = useState(false)

  return (
    <Section title="Timeline, Countdown">
      <div className="col" style={{ gap: 24 }}>
        <Case label="Timeline: seven steps, in progress" wide>
          <Timeline
            label="Booking progress"
            steps={stepsUpTo(senderSteps, 1)}
          />
        </Case>
        <Case label="Timeline: seven steps, failed at step 2" wide>
          <Timeline
            label="Booking progress"
            steps={stepsUpTo(
              [
                { label: 'Requested', note: '8:43 AM' },
                { label: 'Declined', note: '8:46 AM' },
                ...senderSteps.slice(2),
              ],
              1,
              { failedAt: 1 },
            )}
          />
        </Case>
        <Case label="Timeline: seven steps, complete" wide>
          <Timeline
            label="Booking progress"
            steps={stepsUpTo(senderSteps, 7)}
          />
        </Case>
        <Case label="Timeline: four steps" wide>
          <Timeline label="Delivery progress" steps={stepsUpTo(riderSteps, 1)} />
          <Timeline label="Delivery progress" steps={stepsUpTo(riderSteps, 3)} />
          <Timeline label="Delivery progress" steps={stepsUpTo(riderSteps, 4)} />
        </Case>
      </div>

      <Grid min={300}>
        <Case label="Countdown: big, with its spoken label">
          <div className="row" style={{ gap: 20, flexWrap: 'nowrap' }}>
            <Countdown
              deadline={deadline}
              onExpire={() => setExpired(true)}
            />
            <div>
              <div className="b">Time left to answer</div>
              <div className="cap">
                After 10 minutes the job goes back to the sender.
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setExpired(false)
              setDeadline(Date.now() + 8000)
            }}
          >
            Restart at 8 seconds
          </Button>
          <div className="cap" aria-live="polite">
            {expired ? 'Expired. onExpire fired once.' : 'Running'}
          </div>
        </Case>

        <Case label="Countdown: smaller, and inline">
          <Countdown deadline={deadline} fontSize={32} />
          <span className="muted">
            Resend code in <Countdown deadline={deadline} variant="inline" />
          </span>
        </Case>
      </Grid>
    </Section>
  )
}

/* ------------------------------------------------------------------ Figures */

function Figures() {
  return (
    <Section title="Stat, SourceLine, KeyValue">
      <Grid min={280}>
        <Case label="Stat">
          <div className="row" style={{ gap: 32 }}>
            <Stat value="143" label="Confirmed jobs" />
            <Stat value="61" label="Different recipients" />
            <Stat
              value={
                <>
                  4.8 <span style={{ color: '#B87500' }}>{'★'}</span>
                </>
              }
              label="From 118 ratings by senders"
            />
            <Stat value={formatKes(1240)} label="Nelp owes you" />
          </div>
        </Case>

        <Case label="SourceLine: every number shows its source">
          <SourceLine>
            From 143 confirmed jobs and 61 different recipients
          </SourceLine>
          <SourceLine>
            Sum of the 6 entries below. Updated 7 Nov, 11:52 AM.
          </SourceLine>
          <SourceLine icon={false}>
            61 different recipients across 143 jobs. More different people
            means a higher score.
          </SourceLine>
        </Case>

        <Case label="KeyValue">
          <KeyValue
            items={[
              { key: 'route', label: 'Route', value: 'CBD to Westlands' },
              { key: 'when', label: 'When', value: 'Mon 9 Nov, 9:00 AM' },
              {
                key: 'item',
                label: 'Item',
                value: `Box of 6 shirts · ${formatKes(4500)}`,
              },
              {
                key: 'recipient',
                label: 'Recipient',
                value: maskPhone('0712345481'),
              },
              {
                key: 'fare',
                label: 'Delivery fare',
                note: 'Set by distance between areas',
                value: formatKes(350),
              },
              {
                key: 'insurance',
                label: (
                  <span className="row" style={{ gap: 8 }}>
                    <span>Insurance</span>
                    <DemoBadge>Demo quote</DemoBadge>
                  </span>
                ),
                note: 'Covers loss or damage up to KES 20,000',
                value: formatKes(40),
              },
            ]}
          />
        </Case>

        <Case label="Money: positive and negative balance effects">
          <KeyValue
            items={[
              {
                key: 'mpesa',
                label: 'M-Pesa job',
                value: (
                  <span style={{ color: '#17653A' }}>
                    {formatEffect(630)}{' '}
                    <span className="cap">owed to you</span>
                  </span>
                ),
              },
              {
                key: 'cash',
                label: 'Cash job',
                value: (
                  <span style={{ color: '#B0241C' }}>
                    {formatEffect(-15)} <span className="cap">you owe</span>
                  </span>
                ),
              },
              {
                key: 'negative',
                label: 'Negative balance',
                value: formatKes(-120),
              },
            ]}
          />
        </Case>
      </Grid>
    </Section>
  )
}

/* ------------------------------------------------------------------- Blanks */

function Blanks() {
  return (
    <Section title="EmptyState, Skeleton">
      <Grid min={320}>
        <Case label="EmptyState: with an icon and actions">
          <EmptyState
            title="No rider is free at 9:00 AM"
            icon="search"
            actions={
              <>
                <Button variant="secondary">Change time</Button>
                <Button variant="secondary">Change area</Button>
                <Button variant="text">Turn off Assured only</Button>
              </>
            }
          >
            Try a time 30 minutes later, a nearby area, or turn off
            &ldquo;Assured only&rdquo;.
          </EmptyState>
        </Case>

        <Case label="EmptyState: plain">
          <EmptyState title="No jobs today yet" style={{ padding: 24 }}>
            Stay online or log a job you already did.
          </EmptyState>
          <EmptyState title="The queue is clear" style={{ padding: 24 }}>
            New submissions will show here.
          </EmptyState>
        </Case>

        <Case label="Skeleton">
          <SkeletonCard />
          <SkeletonCard lines={5} />
          <div className="row">
            <Skeleton variant="circle" width={72} height={72} />
            <Skeleton variant="circle" width={88} height={88} />
          </div>
          <Skeleton variant="heading" width="40%" />
          <Skeleton width="70%" />
          <Skeleton width={140} height={48} />
        </Case>
      </Grid>
    </Section>
  )
}

/* ----------------------------------------------------------------- Messages */

function Messages() {
  return (
    <Section title="SmsBubble, CopyLink">
      <Grid min={320}>
        <Case label="SmsBubble: with and without a code">
          <SmsBubble>
            Nelp: Grace booked a delivery for 9:00 AM, CBD to Westlands. Accept
            or decline: nelp.co/j/4k8m
          </SmsBubble>
          <SmsBubble>
            <SmsText
              body="Nelp: Amina has arrived with your delivery. Confirm receipt at nelp.co/c/8f2k with code 4821."
              code="4821"
            />
          </SmsBubble>
          <SmsBubble>
            <SmsText
              body="Nelp: Your sign-in code is 482913"
              code="482913"
            />
          </SmsBubble>
          <SmsBubble outgoing>Outgoing, right-aligned</SmsBubble>
        </Case>

        <Case label="CopyLink">
          <CopyLink
            value="nelp.co/t/8f2k"
            label="Tracking link"
            note="Copy the tracking link and send it to the recipient yourself."
          />
          <hr className="hr" />
          <CopyLink
            value="nelp.co/r/amina-k"
            label="Profile link"
            buttonVariant="primary"
          />
        </Case>
      </Grid>
    </Section>
  )
}

/* -------------------------------------------------------------------- Roles */

const roles: Role[] = ['sender', 'rider', 'recipient', 'admin', 'public']

function Roles() {
  return (
    <Section title="RoleChip">
      <Case label="Each role, and the design's custom labels" wide>
        <div className="row">
          {roles.map((role) => (
            <RoleChip key={role} role={role} bare />
          ))}
        </div>
        <div className="row">
          <RoleChip role="sender" bare>
            SENDING SOMETHING
          </RoleChip>
          <RoleChip role="rider" bare>
            RIDING
          </RoleChip>
          <RoleChip role="rider" bare>
            TO RIDER
          </RoleChip>
          <RoleChip role="recipient" bare>
            TO RECIPIENT
          </RoleChip>
        </div>
        <p className="cap">
          The bar at the top of each page is the same chip, shown only when
          VITE_SHOW_ROLE_CHIP is on.
        </p>
      </Case>
    </Section>
  )
}

/* -------------------------------------------------------------------- Icons */

const iconNames: IconName[] = [
  'check',
  'shield',
  'info',
  'alert',
  'error',
  'clock',
  'x-circle',
  'x',
  'lock',
  'flag',
  'device',
  'search',
  'calendar',
  'arrow-right',
  'power',
  'arrow-up',
  'arrow-down',
  'star',
]

function Icons() {
  return (
    <Section title="Icon">
      <Case label="Every icon, at three sizes" wide>
        <div
          className="cards"
          style={{
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(120px,100%),1fr))',
            gap: 16,
          }}
        >
          {iconNames.map((name) => (
            <div
              key={name}
              className="col"
              style={{ gap: 8, alignItems: 'center' }}
            >
              <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                <Icon name={name} />
                <Icon name={name} size="lg" />
                <Icon name={name} size="xl" />
              </div>
              <span className="cap">{name}</span>
            </div>
          ))}
        </div>
        <p className="cap">
          Icons are decorative by default. Meaning is always carried by the
          words beside them.
        </p>
      </Case>
    </Section>
  )
}
