import { Page } from '../../components/Page'
import { Button } from '../../components/Button'
import { SmsLinkFooter } from '../../layouts/SmsLinkLayout'
import { AvatarIcon } from '../../components/Avatar'
import { Icon } from '../../components/Icon'

/**
 * Design: PostService.dc.html
 *
 * Opened from the last text in a booking. It carries the landing headline,
 * one action, and a text link for the other door. Nothing else, because
 * whoever opens this has no account and came from an SMS.
 */
export function PostService() {
  return (
    <Page>
      <div className="wrap">
        <div className="narrowc col" style={{ gap: 24 }}>
          <div className="col" style={{ gap: 10 }}>
            <div className="eyebrow">Your delivery went well</div>
            <h1 className="display" style={{ fontSize: 40 }}>
              Riders you can check. Work you can prove.
            </h1>
            <p className="lead">
              Every finished delivery is confirmed by the customer who received
              it. That record is what you choose a rider by, and what a rider
              carries with them.
            </p>
          </div>

          <div className="card lg col" style={{ gap: 14 }}>
            <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}>
              <AvatarIcon>
                <Icon name="check" size="lg" />
              </AvatarIcon>
              <div className="muted">
                A rider delivered for you, and you confirmed it. That is how
                their record grew.
              </div>
            </div>
            <Button variant="snd" size="lg" block to="/sender/signin">
              Send your own parcel
            </Button>
          </div>

          <div className="row ctr">
            <Button variant="text" to="/rider/signup">
              I&rsquo;m a rider instead
            </Button>
          </div>

          <SmsLinkFooter />
        </div>
      </div>
    </Page>
  )
}
