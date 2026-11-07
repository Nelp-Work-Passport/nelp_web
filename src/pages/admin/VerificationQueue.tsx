import { useState } from 'react'
import { Page, PageHeader } from '../../components/Page'
import { Avatar } from '../../components/Avatar'
import { Badge } from '../../components/Badge'
import { Banner } from '../../components/Banner'
import { Button } from '../../components/Button'
import { EmptyState } from '../../components/EmptyState'
import { Modal } from '../../components/Modal'
import { SourceLine } from '../../components/SourceLine'
import { Table } from '../../components/Table'
import { TextArea } from '../../components/TextInput'
import { Toast } from '../../components/Toast'
import { useApi, useMutation } from '../../lib/useApi'
import { formatDateTime } from '../../lib/dates'
import * as api from '../../api/endpoints'
import type { AdminDocument } from '../../api/types'

const TYPE_LABELS: Record<string, string> = {
  DRIVING_LICENCE: 'Riding licence',
  RIDER_CARD: 'Rider card',
}

/**
 * Design: AdminQueue.dc.html
 *
 * Documents waiting for a person to look at. Approving is one tap; rejecting
 * needs a written reason, because the rider reads it and "rejected" with no
 * explanation is a dead end for them.
 */
export function VerificationQueue() {
  const queue = useApi(() => api.adminDocuments('PENDING'), [])
  const review = useMutation(api.reviewDocument)
  const link = useMutation(api.adminDocumentLink)

  const [rejecting, setRejecting] = useState<AdminDocument | null>(null)
  const [reason, setReason] = useState('')
  const [notice, setNotice] = useState<string | null>(null)

  async function approve(document: AdminDocument) {
    const result = await review.run(document.id, true)
    if (result) {
      setNotice(`Approved. The rider now shows "${result.verification.label}".`)
      queue.reload()
    }
  }

  async function reject() {
    if (!rejecting || !reason.trim()) return
    const result = await review.run(rejecting.id, false, reason.trim())
    if (result) {
      setRejecting(null)
      setReason('')
      setNotice('Rejected, and the rider can read your reason.')
      queue.reload()
    }
  }

  async function open(document: AdminDocument) {
    const result = await link.run(document.id)
    if (result) window.open(result.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Page>
      <div className="wrap col" style={{ gap: 24 }}>
        <PageHeader title="Verification queue">
          <p className="muted">
            Documents a rider has sent in. Check each one by eye against the
            name on the account.
          </p>
        </PageHeader>

        {notice ? <Toast title="Done">{notice}</Toast> : null}

        {queue.error ? (
          <Banner
            tone="bad"
            title={
              queue.error.status === 403 || queue.error.isUnauthorized
                ? 'This needs a staff account'
                : 'We could not load the queue'
            }
            actions={
              <Button size="sm" to="/admin/login">
                Admin log in
              </Button>
            }
          >
            {queue.error.message}
          </Banner>
        ) : null}

        {review.error ? (
          <Banner tone="bad" live title="That review did not save">
            {review.error.message}
          </Banner>
        ) : null}

        {link.error ? (
          <Banner tone="warn" live title="We could not open that document">
            {link.error.status === 503
              ? 'File storage is not switched on for this Nelp instance, so the document cannot be fetched.'
              : link.error.message}
          </Banner>
        ) : null}

        <Banner tone="info" title="What approving means">
          It records that a person has seen the document. It is not
          provider-backed identity verification, and the rider&rsquo;s profile
          says so.
        </Banner>

        <Table<AdminDocument>
          caption="Documents waiting for review"
          rows={queue.data ?? []}
          rowKey={(row) => row.id}
          loading={queue.loading}
          minWidth={880}
          empty={
            <EmptyState title="The queue is clear" icon="check">
              New submissions will show here.
            </EmptyState>
          }
          columns={[
            {
              key: 'rider',
              header: 'Rider',
              cell: (row) => (
                <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
                  <Avatar name={row.rider_id.slice(0, 2)} size="sm" variant="a2" />
                  <Button variant="text" size="sm" to={`/r/${row.rider_id}`}>
                    Open profile
                  </Button>
                </div>
              ),
            },
            {
              key: 'type',
              header: 'Document',
              nowrap: true,
              cell: (row) => TYPE_LABELS[row.document_type] ?? row.document_type,
            },
            {
              key: 'file',
              header: 'File',
              nowrap: true,
              cell: (row) =>
                `${row.content_type} · ${Math.round(row.size_bytes / 1024)} KB`,
            },
            {
              key: 'sent',
              header: 'Sent',
              nowrap: true,
              cell: (row) => formatDateTime(row.created_at),
            },
            {
              key: 'status',
              header: 'Status',
              cell: (row) => (
                <Badge tone="info" icon="clock">
                  {row.status}
                </Badge>
              ),
            },
            {
              key: 'decision',
              header: 'Decision',
              align: 'right',
              cell: (row) => (
                <div
                  className="row end"
                  style={{ gap: 8, flexWrap: 'nowrap' }}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={link.pending}
                    onClick={() => void open(row)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    loading={review.pending}
                    onClick={() => void approve(row)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger-o"
                    size="sm"
                    onClick={() => {
                      setRejecting(row)
                      setReason('')
                    }}
                  >
                    Reject
                  </Button>
                </div>
              ),
            },
          ]}
        />

        <SourceLine>
          Opening a document creates a link that works for five minutes, and
          every request is written to the audit log.
        </SourceLine>

        <Modal
          open={Boolean(rejecting)}
          onClose={() => setRejecting(null)}
          title="Reject this document?"
          actions={
            <>
              <Button
                variant="danger"
                disabled={!reason.trim()}
                loading={review.pending}
                onClick={() => void reject()}
              >
                Reject it
              </Button>
              <Button variant="secondary" onClick={() => setRejecting(null)}>
                Cancel
              </Button>
            </>
          }
        >
          <TextArea
            label="Reason (the rider will read this)"
            placeholder="e.g. The name on the licence does not match the account."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            error={reason.trim() ? null : 'Write a short reason to reject.'}
            maxLength={280}
          />
        </Modal>
      </div>
    </Page>
  )
}
