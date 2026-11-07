import { Page, PageHeader } from '../../components/Page'
import { Banner } from '../../components/Banner'

/**
 * Design: Balance.dc.html
 *
 * Scaffolded in step 2 so the route table and layouts can be checked.
 * Built in step 3.
 */
export function Balance() {
  return (
    <Page>
      <div className="wrap col" style={{ gap: 24 }}>
        <PageHeader eyebrow="Not built yet" title="Balance" />
        <Banner tone="neu" title="This page is scaffolded, not built">
          Its layout, nav accent and footer are real. The content comes in
          step&nbsp;3, ported from <b>Balance.dc.html</b>.
        </Banner>
      </div>
    </Page>
  )
}
