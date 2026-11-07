# Nelp web

The front end for Nelp, a trust and delivery marketplace for Nairobi boda and
delivery riders.

> **Riders you can check. Work you can prove.**
> Every finished delivery is confirmed by the customer who received it. That
> record is what you choose a rider by, and what a rider carries with them.

React 19, Vite, TypeScript, `react-router-dom` v6, plain CSS. No component
library and no Tailwind: the design system is ported verbatim into
[`src/styles/nelp.css`](src/styles/nelp.css) and used by its own class names.

## Run it

The front end needs the API, which lives in a separate repository:
<https://github.com/Nelp-Work-Passport/nelp_api>.

**1. Start the API** (in the `nelp_api` checkout):

```bash
cp .env.example .env     # then set ADMIN_PIN, e.g. 1234
uv sync
uv run fastapi dev app/main.py     # http://localhost:8000
```

`CORS_ORIGINS` in its `.env` already allows `http://localhost:5173`.

**2. Start the front end** (here):

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:8000
npm install
npm run dev              # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck, then a production build |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint, including the React rules |
| `npm test` | Vitest once |
| `npm run test:watch` | Vitest in watch mode |

`/dev/components` shows every component in every state it has to handle.

## Demo accounts

Seeded by the API, all with PIN `1234`.

| Who | Phone | Use it for |
| --- | --- | --- |
| Demo Customer 1 | `0700000101` | Booking as a sender |
| Amina W. (demo) | `0700000001` | Riding. Score 89 from 20 ratings |
| Brian O. (demo) | `0700000002` | Riding. Score 83 |
| Felix A. (demo) | `0700000006` | A rider with no score yet |
| Admin | the API's `ADMIN_PHONE` | Verification queue, abuse review, SMS inbox |

The admin account only exists if `ADMIN_PHONE` **and** `ADMIN_PIN` were set
before the API seeded.

## The demo script

Real SMS is off, so every message Nelp would send is readable in the demo
inbox. Two browser windows make this easiest: one signed in as the customer,
one as the rider.

1. **Look around as a visitor.** Open `/`. The example profile at the bottom
   is a live rider from the API. Open `/verify`, then any rider, to see a
   score with the ratings and the written explanation behind it.
2. **Book as the customer.** Sign in at `/sender/signin` with `0700000101`
   and PIN `1234`. Pick two areas at `/sender/new` — the fare is quoted by
   the API — and set a recipient number you can remember, say `0722333555`.
3. **Choose a rider** at `/sender/choose`. The list is ranked by the API;
   a rider with fewer than three ratings shows as "New", never as zero.
4. **Pay** at `/sender/quote`. Payment is simulated and labelled as such.
   There is a button to simulate a failure too.
5. **Accept as the rider.** In the other window sign in at `/rider/login`
   with `0700000001`, open the job from `/rider/dashboard`, and accept it.
   Accepting is what texts the recipient their delivery code.
6. **Read the code.** As the admin, open `/admin/sms` and look up the
   recipient's number. Or open the booking as the customer: the code text is
   shown at the bottom of `/sender/bookings/:id`.
7. **Collect, as the rider.** Tap "I have collected it". The rider has no way
   to mark the job delivered — that is the point of the code.
8. **Confirm the delivery** with the 6-digit code, from the customer's
   booking page.
9. **Rate the rider** on the same page. The rider's score moves, and
   `/r/:id` shows the new count behind it.
10. **See the money.** `/rider/balance` shows what Nelp owes the rider after
    its fee, from that delivery.

The recipient's own pages — `/t/:token` to follow a delivery and `/c/:token`
to confirm it — need no account and work from the link in the text.

## How it is put together

```
src/
  api/          The only place that talks to the API
    client.ts     fetch, the bearer token, the API's one error shape
    endpoints.ts  One function per endpoint
    types.ts      The contract, mirroring the API's schemas.py
    draft.ts      The booking being assembled, between two pages
  domain/       Pure functions with tests: score bands, phone masking,
                codes, money, countdowns, booking steps
  components/   The design system as components, each with its loading,
                empty, error and disabled states
  layouts/      One per role: Public, Sender, Rider, Admin, SmsLink
  pages/<role>/ One file per page
  state/        Who is signed in (context plus useReducer)
  lib/          cx, dates, clipboard, the API hooks, the shared clock
  styles/       nelp.css, ported verbatim, plus app.css for the few rules
                a running app needs beyond a static frame
```

Two rules shape the UI:

- **Every number shows its source.** A score never appears without the line
  that says what it is built from. `TrustEvidence` carries the counts; the
  API's `/explanation` endpoint supplies the wording.
- **Colour never carries meaning alone.** Every badge and banner pairs its
  colour with an icon and words, and timeline steps state their position in
  text for screen readers.

## Where the design and the API disagree

The design frames in `src/design/` were drawn before the API existed, and
the API is the thing that holds the data. Where they differ, the API wins.
The notable differences:

| The design | What was built, and why |
| --- | --- |
| A trust score from three parts: recipient variety /45, time spread /35, repeat recipients /20 | The API computes a score from **ratings**, with a prior: `round(((sum of ratings + 5 × 3.5) / (rated + 5)) × 20)`. There is no part breakdown to show, so the evidence panel shows the real counts — rated deliveries, completed deliveries, star average, recent ratings, what people said — plus the API's own explanation |
| Bands Flagged / Building / Strong | The API's `trust.label` ("89 · 20 ratings", "New · 1 rating") is the headline, as the API asks. Bands still colour the ring: under 35, 35–69, 70+ |
| Fewer than 5 confirmed jobs means no score | Fewer than **3 rated** deliveries, and the API sends `null`, shown as a dash and the words "Not enough ratings yet" |
| 4-digit codes | Codes are **6 digits** throughout |
| Sender signs in with a phone and an SMS code, no password | The API authenticates on phone **plus PIN**. The texted code confirms a new number once |
| A 10-minute countdown to accept a job | A request reserves nothing and does not expire on a timer; accepting reserves a 60-minute booking |
| 7 booking states | The API has 4 in a line — REQUESTED, ACCEPTED, PICKED_UP, DELIVERED — plus DECLINED and CANCELLED |
| A 6-message SMS chain with fixed wording | The API owns its own messages and sends the delivery code on accept. The demo inbox shows whatever it sent |
| Insurance quotes, labelled Demo | Not in the API at all, so not shown. Verification is the API's three levels instead |
| Riders log jobs done outside Nelp | No endpoint exists for it. `/rider/log-job` says so rather than being a form that cannot save |
| "Attack demo": generate a fake rider with 200 invented jobs | No endpoint, and locally invented ratings would prove nothing. `/admin/attack-demo` shows the real defences: the API's abuse flags, and why the prior stops padding from buying a score |

One gap worth naming: **a recipient with no Nelp account cannot submit the
delivery code.** `POST /confirm-delivery` requires a signed-in participant,
and `GET /api/track/{token}` returns no booking id, so there is nothing a
link-only visitor can act on. `/c/:token` is honest about this: it reads the
public tracking link for context and explains that the recipient reads the
code out to the sender or rider, or signs in. Letting a token-holder confirm
would need an API change.

## Known limits

- **The demo SMS inbox is public.** Anyone who knows a number can read its
  codes. It must be off before real customers use Nelp, and the page says so.
- **Payments are simulated.** Every screen that shows one labels it.
- **Document checks are by eye.** "Documents manually checked" means a person
  looked at an upload. It is not provider-backed identity verification.
- **Uploads need S3 configured** in the API. Until then they answer 503, and
  the verification page explains that rather than failing silently.
- **A trust score is not proof.** It summarises past feedback, and a
  confirmed phone is not an identity check.

`src/design/` holds the original design frames for reference. It is
gitignored and ships nothing.
