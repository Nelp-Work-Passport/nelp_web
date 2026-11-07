import { Page } from '../../components/Page'
import { EmptyState } from '../../components/EmptyState'
import { Button } from '../../components/Button'

/** A path that does not exist. */
export function NotFound() {
  return (
    <Page>
      <div className="wrap">
        <div className="wide">
          <EmptyState
            title="We could not find that page"
            icon="search"
            actions={
              <>
                <Button to="/">Go to the home page</Button>
                <Button variant="secondary" to="/verify">
                  Verify a rider
                </Button>
              </>
            }
          >
            Check that you copied the whole link. Links in a text message are
            short, like nelp.co/t/8f2k.
          </EmptyState>
        </div>
      </div>
    </Page>
  )
}
