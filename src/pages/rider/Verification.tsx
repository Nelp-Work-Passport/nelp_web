import { useRef, useState } from 'react'
import { Page, PageHeader } from '../../components/Page'
import { Badge } from '../../components/Badge'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { Icon } from '../../components/Icon'
import { KeyValue, SourceLine } from '../../components/SourceLine'
import { SkeletonCard } from '../../components/Skeleton'
import { VerifiedTick } from '../../components/Badge'
import { useApi, useMutation } from '../../lib/useApi'
import { formatDateTime } from '../../lib/dates'
import * as api from '../../api/endpoints'
import type { Document, DocumentType } from '../../api/types'

const MAX_BYTES = 5 * 1024 * 1024

const KINDS: { type: DocumentType; label: string; hint: string }[] = [
  {
    type: 'DRIVING_LICENCE',
    label: 'Riding licence',
    hint: 'A photo or scan of your licence. JPEG, PNG, WebP or PDF.',
  },
  {
    type: 'RIDER_CARD',
    label: 'Rider card',
    hint: 'Your county rider card or equivalent permit.',
  },
]

/**
 * Design: Verification.dc.html
 *
 * Verification is a person looking at a document, not an automated identity
 * check, and the page says that in as many words. Two documents are needed;
 * the badge appears only when the latest of both has been approved.
 */
export function RiderVerification() {
  const profile = useApi(() => api.myRiderProfile(), [])
  const documents = useApi(() => api.myDocuments(), [])
  const upload = useMutation(api.uploadVerificationDocument)
  const [tooBig, setTooBig] = useState<DocumentType | null>(null)

  const latest = (type: DocumentType): Document | undefined =>
    (documents.data ?? [])
      .filter((doc) => doc.document_type === type)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0]

  async function send(type: DocumentType, file: File) {
    if (file.size > MAX_BYTES) {
      setTooBig(type)
      return
    }
    setTooBig(null)
    const saved = await upload.run(type, file)
    if (saved) documents.reload()
  }

  const status = profile.data?.verification

  return (
    <Page>
      <div className="wrap">
        <div className="g12" style={{ alignItems: 'start' }}>
          <div className="s7 col" style={{ gap: 24 }}>
            <PageHeader
              title="Verify your identity"
              aside={
                status ? (
                  <Badge
                    tone={
                      status.status === 'DOCUMENTS_MANUALLY_CHECKED'
                        ? 'ok'
                        : status.status === 'PHONE_CONFIRMED'
                          ? 'info'
                          : 'neu'
                    }
                    icon="shield"
                  >
                    {status.label}
                  </Badge>
                ) : undefined
              }
            >
              <p className="muted">
                A person at Nelp looks at these by eye. It usually takes one
                working day.
              </p>
            </PageHeader>

            <Banner tone="info" title="What this check is, and is not">
              It means somebody at Nelp has seen your documents. It is not
              provider-backed identity verification, and Nelp says so on your
              public profile too.
            </Banner>

            {upload.error ? (
              <Banner tone="bad" live title="We could not upload that">
                {upload.error.status === 503
                  ? 'File storage is not switched on for this Nelp instance yet, so uploads cannot be accepted. Everything else works.'
                  : upload.error.message}
              </Banner>
            ) : null}

            {documents.loading ? (
              <SkeletonCard lines={3} />
            ) : (
              KINDS.map((kind) => (
                <DocumentCard
                  key={kind.type}
                  label={kind.label}
                  hint={kind.hint}
                  document={latest(kind.type)}
                  tooBig={tooBig === kind.type}
                  pending={upload.pending}
                  onPick={(file) => void send(kind.type, file)}
                />
              ))
            )}
          </div>

          <aside className="s5 col" style={{ gap: 16 }}>
            <div className="card col" style={{ gap: 12 }}>
              <div className="h3">What each level gives you</div>
              <div
                className="row"
                style={{ gap: 10, flexWrap: 'nowrap', alignItems: 'flex-start' }}
              >
                <VerifiedTick />
                <span>
                  <b>Phone confirmed</b> as soon as you enter the code we
                  texted you.
                </span>
              </div>
              <div
                className="row"
                style={{ gap: 10, flexWrap: 'nowrap', alignItems: 'flex-start' }}
              >
                <Icon name="shield" size="lg" />
                <span>
                  <b>Documents manually checked</b> once a person has approved
                  the latest licence <i>and</i> rider card. Replace one and the
                  badge waits for the new check.
                </span>
              </div>
              <SourceLine>
                Senders see whichever line applies, written exactly as Nelp
                words it.
              </SourceLine>
            </div>

            {status?.status === 'UNVERIFIED' ? (
              <Banner tone="warn" title="Confirm your phone first">
                Enter the 6-digit code we texted you. Without it the documents
                cannot raise your level.
              </Banner>
            ) : null}
          </aside>
        </div>
      </div>
    </Page>
  )
}

function DocumentCard({
  label,
  hint,
  document,
  tooBig,
  pending,
  onPick,
}: {
  label: string
  hint: string
  document: Document | undefined
  tooBig: boolean
  pending: boolean
  onPick: (file: File) => void
}) {
  const input = useRef<HTMLInputElement>(null)

  return (
    <section className="card lg col" style={{ gap: 14 }}>
      <div className="row sb">
        <h2 className="h3">{label}</h2>
        {document ? <DocumentBadge document={document} /> : null}
      </div>

      {document ? (
        <>
          <KeyValue
            items={[
              {
                key: 'sent',
                label: 'Sent',
                value: formatDateTime(document.created_at),
              },
              {
                key: 'size',
                label: 'File',
                value: `${document.content_type} · ${Math.round(document.size_bytes / 1024)} KB`,
              },
            ]}
          />
          {document.status === 'REJECTED' ? (
            <Banner tone="bad" title="This one was not accepted">
              {document.review_note ??
                'No reason was recorded. Send a clearer photo.'}
            </Banner>
          ) : document.status === 'PENDING' ? (
            <Banner tone="info" title="Waiting for a person to check it">
              You can keep working while it is checked.
            </Banner>
          ) : (
            <Banner tone="ok" title="Approved">
              Somebody at Nelp has seen this document.
            </Banner>
          )}
        </>
      ) : (
        <EmptyState title="Not sent yet" as="h3" style={{ padding: 20 }}>
          {hint}
        </EmptyState>
      )}

      {tooBig ? (
        <Banner tone="bad" live title="That file is too big">
          The limit is 5 MB. Try a photo rather than a scan.
        </Banner>
      ) : null}

      <input
        ref={input}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        aria-label={`Choose a file for ${label}`}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onPick(file)
          event.target.value = ''
        }}
      />
      <Button
        variant={document ? 'secondary' : 'primary'}
        block
        loading={pending}
        onClick={() => input.current?.click()}
      >
        {document ? `Replace my ${label.toLowerCase()}` : `Send my ${label.toLowerCase()}`}
      </Button>
      <div className="hint">{hint} Up to 5 MB.</div>
    </section>
  )
}

function DocumentBadge({ document }: { document: Document }) {
  if (document.status === 'APPROVED') {
    return (
      <Badge tone="ok" icon="check">
        Approved
      </Badge>
    )
  }
  if (document.status === 'REJECTED') {
    return (
      <Badge tone="bad" icon="x-circle">
        Not accepted
      </Badge>
    )
  }
  return (
    <Badge tone="info" icon="clock">
      Under review
    </Badge>
  )
}
