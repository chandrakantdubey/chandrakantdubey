# Deployment — Chandrakant Dubey portfolio

The GitHub repository `chandrakantdubey/chandrakantdubey` contains both the
GitHub profile README and the **Vite + React + TypeScript** portfolio website.

Production website: https://chandrakantdubey.vercel.app/

## Vercel configuration

| Setting | Value |
| --- | --- |
| Git repository | `chandrakantdubey/chandrakantdubey` |
| Production branch | `main` |
| Root directory | `./` |
| Framework | Vite |
| Node version | 22.x |
| Install | `npm ci` |
| Build | `npm run build` |
| Output | `dist` |

The `vercel.json` file contains the build/output configuration and browser
security headers. Vercel project ownership, domain assignment and GitHub
integration are configured in Vercel rather than in the repository.

## Current application

- [Field 001 engineering specification](FIELD-001.md)
- [Interactive Canvas renderer](../src/field/FieldCanvas.tsx)
- [Pure deterministic field engine](../src/field/engine.ts)
- [Portfolio and real source-based project content](../src/atelier/content.ts)

The portfolio presents six repositories, experience, skills and contact.
The field is **not** a fake infrastructure dashboard; the Inspect Mode shows
measured browser renderer statistics.

## Contact

The contact form opens the visitor's mail application with a prefilled draft.
Visitors must send the message themselves. There is no public server-side
email API in this build, and no Resend key is needed. The previously configured
Vercel `RESEND_API_KEY` is not used by the site.

If HTTP form delivery is later required, configure a verified sending domain,
spam protection and distributed rate limiting. Do not expose any secret through
the Vite browser environment.

## Optional direct contact delivery

The form always works as a mailto composer. The repository now also
contains `api/contact.ts`, a Vercel Function that can deliver directly via
Resend. **It fails closed** unless the following configuration is completed:

| Variable | Scope | Requirement |
| --- | --- | --- |
| `RESEND_API_KEY` | Server-only secret | Existing Vercel variable; retain encrypted |
| `RESEND_FROM_EMAIL` | Server-only | Verified Resend sender on a domain you control |
| `CONTACT_TURNSTILE_SECRET` | Server-only secret | Cloudflare Turnstile widget secret |
| `VITE_TURNSTILE_SITE_KEY` | Public build-time | Matching Turnstile site key |
 
Turnstile must allow the production hostname
`chandrakantdubey.vercel.app`. If enabling direct delivery on previews,
configure the preview hostnames in Cloudflare as well. The Vite site key is
public by design; never put the Resend or Turnstile secret in a `VITE_`
variable. Updating build-time Vite variables requires a new deployment.

The site asks `GET /api/contact` whether direct delivery is configured.
If the answer is disabled or the public site key is missing, users see the
existing compose-email workflow instead. When configured, POST submissions
verify Origin, validate all fields, check the honeypot and Turnstile token
server-side, then send through Resend with an idempotency key.

The API has no global in-memory rate limit. Add a Vercel WAF rule with
rate limits for `/api/contact` to protect the email quota at scale.
Never ship a publicly callable Resend endpoint without abuse protection.

Verify:
- `GET /api/contact` reports `enabled:false` until the verified sender
  and Turnstile secret exist.
- The form still opens a visitor's email client when direct delivery
  is unavailable.
- After configuration, submit once with a real Turnstile token and verify
  Resend's send history and actual receipt.
- An invalid/replayed Turnstile token must be rejected.
- The direct-send action must not claim success if Resend returns an error.

## Pre-merge and production verification

```bash
npm ci
npm run lint
npm run build
npm test
npm audit --omit=dev --audit-level=high
```

1. Make a pull request from the feature branch.
2. Confirm GitHub Actions passes all checks.
3. Confirm Vercel builds a READY **preview** from the exact feature SHA.
4. Review the UI on narrow Android and desktop screens; confirm mobile navigation,
   layout widths, tap ripples, physics pause/reseed and inspector.
5. Check keyboard shortcuts (I, R, P), reduced-motion and focus visibility.
6. Check all six GitHub source links and the résumé download.
7. Merge only when ready to publish: Vercel automatically deploys `main` to
   `chandrakantdubey.vercel.app` in this project.
8. Confirm the new production deployment SHA matches GitHub `main` and is READY.

A successful GitHub build does **not** prove that a Vercel deployment or browser
smoke test succeeded. Check both separately.
