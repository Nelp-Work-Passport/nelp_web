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

One gap worth naming: **a recipient with no Nelp account cannot submit the
delivery code.** `POST /confirm-delivery` requires a signed-in participant,
and `GET /api/track/{token}` returns no booking id, so there is nothing a
link-only visitor can act on. `/c/:token` is honest about this: it reads the
public tracking link for context and explains that the recipient reads the
code out to the sender or rider, or signs in. Letting a token-holder confirm
would need an API change.

