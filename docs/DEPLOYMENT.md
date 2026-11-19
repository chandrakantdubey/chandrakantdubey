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
the WebGL renderer or its CSS fallback, no 320/390px horizontal overflow,
reduced-motion support, company credits, resume and contact fallback.

The gallery contains original SVG and CSS compositions, **not screenshots** or
production dashboards. Personal GitHub repositories are distinct from team
contributions. Four intranet banking apps are described without private URLs.
Nutriiya's employment period ends January 2026.

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
