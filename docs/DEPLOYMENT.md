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
