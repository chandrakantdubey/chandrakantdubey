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

`GET /api/contact` reports whether server delivery is enabled. A POST
validates Origin, fields and Cloudflare Turnstile token before submitting to
Resend. No keys are exposed in Vite client bundles. Protect this endpoint
with a Vercel WAF/edge rate-limit policy before enabling direct delivery.

Verify real receipt after enabling the variables; CI deliberately mocks
third-party delivery so that it does not send actual messages.

## Production release

1. Confirm GitHub Actions and Vercel preview are green on the exact PR SHA.
2. Open the saved screenshots, check the actual mobile/desktop composition.
3. Merge PR to main; confirm Vercel production is **READY** for the new SHA.
4. Verify production HTML and compiled JS, favicon, resume and /api/contact.
5. Try gallery switching, mobile navigation and the contact fallback.

Never claim production is live based solely on a passing GitHub build.
