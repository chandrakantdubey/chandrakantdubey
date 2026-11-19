# Deployment · Chromatic Exhibition

This repository holds the GitHub profile README and the Vite/React portfolio.

- **Production**: https://chandrakantdubey.vercel.app/
- **Source**: https://github.com/chandrakantdubey/chandrakantdubey
- **Creative architecture**: [EXHIBITION.md](EXHIBITION.md)

## GitHub → Vercel

| Setting | Value |
| --- | --- |
| Repository | `chandrakantdubey/chandrakantdubey` |
| Production branch | `main` |
| Root directory | `./` |
| Framework | Vite |
| Node | 22.x |
| Install | `npm ci` |
| Build | `npm run build` |
| Output | `dist` |
| Default domain | `chandrakantdubey.vercel.app` |

`vercel.json` controls framework/build/output and basic response headers.
Vercel team ownership, Git integration and domain mapping live in the Vercel
dashboard, not the Git repository. Merge into main only when the **exact**
feature commit has passed GitHub Actions, the Vercel preview is READY, and the
browser screenshot artifacts have been visually checked.

## Validation

```sh
npm ci
npm audit --omit=dev --audit-level=high
npm run lint
npm run build
npm run typecheck:api
npm test
npm run test:browser
```

The browser test uses headless Chromium/CDP and captures full-size screenshots
of the hero, all principal sections and mobile at 390px. It verifies all six
interactive gallery tabs, keyboard switching, a touch-sized mobile navigation,
the code-monument WebGL renderer or its CSS fallback, no 320/390px horizontal overflow,
reduced-motion support, company credits, resume and contact fallback.

The hero compiles CD bitmap glyphs into animated 3D modules. The gallery contains original SVG and CSS compositions, **not screenshots** or
production dashboards. Personal GitHub repositories are distinct from team
contributions. Four intranet banking apps are described without private URLs.
Nutriiya's employment period ends January 2026.

## Original games and Vercel multiplayer

The exhibition includes two original embedded games: Signal Shift (solo
Canvas arcade) and Trace / Hex (7×7 connection game), with the multiplayer
arena accessible at `/play/duel`. Neither game reuses Blackout Protocol.

The turn-based online mode uses the project's existing Node.js Vercel
Functions and its connected **private Vercel Blob store**,
`cd-hex-duel-rooms`. Server-only `BLOB_READ_WRITE_TOKEN` is created by
the storage connection. **Never expose this variable with the VITE_ prefix.**

Room actions are authenticated with browser-local player tokens, verified
server-side against SHA-256 hashes. Moves use optimistic versions plus
conditional ETag writes, preventing state loss when concurrent stateless
Functions handle two players. Rooms logically expire in 8 hours; the Blob
TTL removes records after one day. Clients refresh every ~3 seconds; this
is near-real-time **turn-based multiplayer**, not a WebSocket action game.

The API includes strict Origin and input validation and Vercel WAF limits
`POST /api/duel` to 120 requests/minute/IP. Shared NATs count together.
Do not remove rate limiting: rooms, invocations and Blob operations consume
provider quota and may incur usage charges.

Validate these routes after deployment:
- `GET /api/duel` returns JSON with `enabled:true` when private Blob
  credentials are configured, and does not throw a module load error
- `GET /play/duel` returns the standalone game HTML (via Vite rewrite)
- Create two sessions in different browsers and join by invitation URL
- Alternate moves and verify both participants converge on the same board
- Verify invalid/reused turns return HTTP 409 without changing state
- Test a winning path, a rematch, and disconnected/reconnected sessions

CI exercises both game engines, browser interactions and UI, but does not
prove a real cross-instance Blob transaction until a deployed API test
actually creates and joins a room.

## Contact delivery

The public contact form always offers a direct email link and a prefilled
email-app composer. Optional server-side delivery is disabled unless ALL
required environment values are provided:

| Variable | Availability | Requirement |
| --- | --- | --- |
| `RESEND_API_KEY` | Server-only | Resend API credential |
| `RESEND_FROM_EMAIL` | Server-only | Resend-verified sender on a controlled domain |
| `CONTACT_TURNSTILE_SECRET` | Server-only | Cloudflare Turnstile secret |
| `VITE_TURNSTILE_SITE_KEY` | Public build-time | Matching site key |

`GET /api/contact` reports whether **all four** environment variables
are present. The Vite client only enables direct send when the public site
key exists and the endpoint reports `enabled:true`. A POST validates Origin,
fields and the Cloudflare Turnstile token/hostname before contacting Resend.
The recipient is a fixed address in the server function and the sender must
belong to a domain verified in the same Resend account as the API key.

**Go-live checklist (Vercel project: `chandrakantdubey`):**

1. Verify a domain you control under Resend > Domains. The `vercel.app`
   subdomain is not a domain you can configure as an authenticated Resend sender.
   In Vercel > Settings > Environment Variables, set `RESEND_FROM_EMAIL`
   to e.g. `Portfolio <hello@your-verified-domain.example>` (use the **actual**
   verified domain, not the example address). The Resend sandbox
   `onboarding@resend.dev` is not a production substitute: it can only send
   to the Resend account's email address.
2. Create a Turnstile widget in Cloudflare with the production hostname
   `chandrakantdubey.vercel.app` and copy its site key to
   `VITE_TURNSTILE_SITE_KEY` (public build-time value) and secret to
   `CONTACT_TURNSTILE_SECRET` (encrypted server-only Vercel variable).
   For preview builds, allow the specific preview hostname and scope
   credentials to preview separately if required.
3. Keep `RESEND_API_KEY` encrypted and server-only. Never prefix a secret
   with `VITE_`. Redeploy to load new build-time/runtime settings.
4. Confirm `GET /api/contact` returns `{\"enabled\":true}`, pass
   the Turnstile check in a browser, and submit a test message. The
   success notice means Resend **accepted** the email, not that it arrived.
   Confirm receipt in the inbox and inspect Resend's email logs.
5. Protect `POST /api/contact` with a per-IP Vercel WAF rate limit if
   available on the team's plan. The Hobby team rejected the custom rule
   with HTTP 402 `payment_required`; verify quota/upgrade before enabling
   a higher-volume public contact service. Turnstile verification stays
   mandatory and server-side even without the WAF rule.

The client has a prefilled email-app fallback regardless of server setup.
CI uses mocked Cloudflare and Resend responses; it cannot prove actual inbox
receipt without configured production credentials and a manual test.

## Production release

1. Confirm GitHub Actions and Vercel preview are green on the exact PR SHA.
2. Open the saved screenshots, check the actual mobile/desktop composition.
3. Merge PR to main; confirm Vercel production is **READY** for the new SHA.
4. Verify production HTML and compiled JS, favicon, resume and /api/contact.
5. Try gallery switching, mobile navigation and the contact fallback.

Never claim production is live based solely on a passing GitHub build.
