import { Badge } from './Badge'
import { Banner } from './Banner'
import { Button } from './Button'
import { EmptyState } from './EmptyState'
import { SkeletonCard } from './Skeleton'
import { SmsBubble, SmsText } from './SmsBubble'
import { useApi } from '../lib/useApi'
import { formatRelativeDay } from '../lib/dates'
import { maskPhone } from '../domain/phone'
import * as api from '../api/endpoints'
import { codeFrom } from '../lib/riders'

export interface DemoInboxProps {
  /** The number to read messages for. */
  phone: string
  title?: string
  /** Hides the warning about the inbox being public. */
  quiet?: boolean
}

/**
 * The demo SMS inbox for one number.
 *
 * Real SMS is off, so every text Nelp would send is readable here instead.
 * This is a demo affordance and says so: the endpoint is public, so anyone
 * who knows a number can read its codes. It must not survive a switch to a
 * live provider.
 */
export function DemoInbox({ phone, title = 'Messages', quiet }: DemoInboxProps) {
  const { data, loading, error, reload } = useApi(
    () => api.demoInbox(phone),
    [phone],
  )

  return (
    <section className="card col" style={{ gap: 14 }}>
      <div className="row sb">
        <h2 className="h3">{title}</h2>
        <div className="row" style={{ gap: 8 }}>
          <Badge tone="warn" icon="info">
            Demo inbox
          </Badge>
          <Button variant="text" size="sm" onClick={reload} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <p className="cap">
        Real SMS is switched off, so the texts Nelp would send to{' '}
        {maskPhone(phone)} are shown here.
      </p>

      {!quiet ? (
        <Banner tone="warn" title="Demo only">
          This inbox is public: anyone who knows a number can read its codes.
          It exists for the demo and must be off before real customers use
          Nelp.
        </Banner>
      ) : null}

      {error ? (
        <Banner
          tone="bad"
          title="We could not read the inbox"
          actions={
            <Button size="sm" onClick={reload}>
              Try again
            </Button>
          }
        >
          {error.message}
        </Banner>
      ) : loading ? (
        <SkeletonCard lines={2} />
      ) : data && data.length > 0 ? (
        <ol className="col" style={{ gap: 14, listStyle: 'none', padding: 0, margin: 0 }}>
          {data.map((message, index) => {
            const code = codeFrom(message.body)
            return (
              <li key={`${message.created_at}-${index}`} className="col" style={{ gap: 6 }}>
                <span className="cap">
                  {formatRelativeDay(message.created_at)}
                </span>
                <SmsBubble>
                  <SmsText body={message.body} code={code ?? undefined} />
                </SmsBubble>
                {code ? (
                  <span className="cap">
                    Code in this message: <b>{code}</b>
                  </span>
                ) : null}
              </li>
            )
          })}
        </ol>
      ) : (
        <EmptyState title="No messages yet" as="h3" style={{ padding: 24 }}>
          A text appears here as soon as Nelp sends one to this number.
        </EmptyState>
      )}
    </section>
  )
}
