import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Page, PageHeader } from '../../components/Page'
import { Button } from '../../components/Button'
import { Banner } from '../../components/Banner'
import { RiderCard, RiderCardSkeleton } from '../../components/RiderCard'
import { TextInput } from '../../components/TextInput'
import { EmptyState } from '../../components/EmptyState'
import { SourceLine } from '../../components/SourceLine'
import { useApi } from '../../lib/useApi'
import * as api from '../../api/endpoints'

/**
 * Design: VerifyResult.dc.html
 *
 * Verifying a rider means checking a name against Nelp's own records rather
 * than trusting a screenshot. The list is the record: whoever is here is a
 * listed rider, and the score beside them is the one the API holds right now.
 */
export function Verify() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { data, loading, error, reload } = useApi(
    () => api.listRiders({ sort: 'trust' }),
    [],
  )

  const term = search.trim().toLowerCase()
  const matches = (data ?? []).filter((rider) =>
    term ? rider.display_name.toLowerCase().includes(term) : true,
  )

  return (
    <Page>
      <div className="wrap col" style={{ gap: 24 }}>
        <PageHeader eyebrow="Verify a rider" title="Check a rider against Nelp">
          <p className="lead" style={{ maxWidth: 720 }}>
            Anyone can check a rider here, with no account. A screenshot can be
            edited; this page reads the live record.
          </p>
        </PageHeader>

        <Banner tone="info" title="What verifying does and does not tell you">
          It confirms the score and counts Nelp holds for a rider today. It is
          not an identity check: read the verification line on each rider as it
          is written.
        </Banner>

        <div className="card col" style={{ gap: 16 }}>
          <TextInput
            label="Rider name"
            placeholder="Start typing a name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            hint="Leave it blank to see every listed rider, highest score first."
          />
          {data ? (
            <SourceLine>
              {matches.length} of {data.length} listed{' '}
              {data.length === 1 ? 'rider' : 'riders'} shown.
            </SourceLine>
          ) : null}
        </div>

        {error ? (
          <Banner
            tone="bad"
            title="We could not reach Nelp"
            actions={
              <Button size="sm" onClick={reload}>
                Try again
              </Button>
            }
          >
            {error.message}
          </Banner>
        ) : null}

        <div className="col" style={{ gap: 16 }}>
          {loading ? (
            <>
              <RiderCardSkeleton />
              <RiderCardSkeleton />
            </>
          ) : matches.length > 0 ? (
            matches.map((rider) => (
              <RiderCard
                key={rider.id}
                rider={rider}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/r/${rider.id}`)}
                  >
                    Open profile
                  </Button>
                }
              />
            ))
          ) : (
            <EmptyState
              title="No rider matches that name"
              icon="search"
              actions={
                <Button variant="secondary" onClick={() => setSearch('')}>
                  Clear the search
                </Button>
              }
            >
              Check the spelling, or clear the search to see every listed
              rider.
            </EmptyState>
          )}
        </div>
      </div>
    </Page>
  )
}
