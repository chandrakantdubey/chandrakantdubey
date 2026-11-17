# CD / Systems Lab: engineering notes

The homepage is a single React 19 + Vite application, deployed as static output.
It intentionally avoids a runtime backend; Vercel is used to serve the Vite build.

## Where to change things

| File | Responsibility |
| --- | --- |
| `src/systems-lab/SystemsLab.tsx` | Homepage sections, project links, interactive lab UI |
| `src/systems-lab/CaseStudyExplorer.tsx` | Source-based architecture walkthroughs |
| `src/systems-lab/simulate.ts` | Pure deterministic throughput/fault model |
| `src/systems-lab/presets.ts` | Named reproducible simulator scenarios |
| `src/systems-lab/systems-lab.css` | Layout, colors, responsive behavior |
| `src/systems-lab/case-studies.css` | Architecture explorer styles |
| `scripts/test-simulator.mjs` | Zero-dependency model tests |
| `docs/DEPLOYMENT.md` | Vercel settings and release procedure |

## Updating project claims

Each project in the UI links to its real repository. Keep claims grounded in those
readmes or a real implementation, distinguish an architectural goal from a shipped
feature, and never publish private client architecture or unverified performance figures.

Project cards and case studies are maintained separately for now. When adding a
project, update both only if there is a real case study with inspectable design
decisions. The “View source” actions should remain functional.

The experience timeline should preserve the dates recorded in the original
`src/portfolio.ts`, not approximate calendar-year ranges that imply longer tenure.

## Simulator model and assumptions

A hypothetical instance handles **700 requests/second**. Cache hits return at
the edge and do not consume application capacity. The system distributes cache
misses across replicas. Failure injection removes one replica. During a simplified
detection window, requests initially routed to the unavailable replica can be
retried once if retries are enabled, but **only if spare healthy capacity exists**.

The model intentionally omits queueing delays, tail latency, network outages,
database bottlenecks, retry storms, jitter, circuit breakers, and real traffic
sampling. It is a **teaching tool**, not an SLO calculator or production monitor.

Preset scenarios deliberately illustrate steady state, no caching, a node outage,
and capacity expansion.

## Local checks

```bash
npm ci
npm run lint:lab
npm run build
npm test
npm audit --omit=dev --audit-level=high
npm run dev
```

The GitHub Actions workflow enforces the noninteractive checks. For UX review,
also exercise navigation and presets at phone, tablet and desktop widths,
with a keyboard and `prefers-reduced-motion: reduce`.

## Runtime and contact security

There is no public contact API or Resend dependency in the active homepage.
The email link opens the visitor's mail client. Avoid reintroducing a public
mail-sending endpoint without distributed abuse protection and validated inputs.

## Production release

A merge to `main` is the source-of-truth for the user's Vercel project.
Deployment and domain activation are managed by the owner in Vercel.
Check GitHub CI first, then verify that the deployed commit SHA in Vercel
matches the GitHub main SHA; a passing GitHub build alone does not prove
that Vercel published it.
