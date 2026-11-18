# Field 001 — the portfolio as a software artifact

This portfolio deliberately avoids fake dashboards, skill ratings and decorative
game mechanics. The site itself contains an inspectable interactive rendering
engine written in TypeScript. Projects, employment history, skills and contact
remain small, plain, source-verifiable sections.

## The render pipeline

```text
window/ResizeObserver  ──► createMesh(width, height, seed) ─► nodes + bounded edges
                                              │
pointer events ───────► pointer forces ───────┤
pointerdown ──────────► radial impulse wave ──┤
elapsed frame time ───► dt (capped) ───────────┤
                                              ▼
                                   advanceMesh() / springs
                                              │
                                      CanvasRenderingContext2D
                                              │
                            sampled real FPS, paint time, nodes, DPR
                                              ▼
                                        Inspect Mode
```

Core implementation: [src/field/engine.ts](../src/field/engine.ts).
Browser integration: [src/field/FieldCanvas.tsx](../src/field/FieldCanvas.tsx).
UI and telemetry inspector: [src/atelier/Portfolio.tsx](../src/atelier/Portfolio.tsx).
Project provenance: [src/atelier/content.ts](../src/atelier/content.ts).

## Deterministic topology

`createMesh(width,height,seed)` uses a Mulberry32 generator. Given the same
dimensions and seed, the initial nodes and neighbor edges are identical.
The simulation applies a spring force toward home coordinates, exponential
velocity damping, cursor repulsion, and age-limited radial waves. The integrator
is semi-implicit Euler with a capped timestep.

An extreme viewport cannot create an arbitrarily large grid: there are at most
23 columns × 15 rows (345 nodes), and every node has at most a handful of
neighbors. Simulation and draw cost scale linearly with the number of nodes
and edges, not quadratically with all node pairs.

The field query parameter `?field=2049` preserves the initial composition.
Press **R** to generate another seed; **Share** copies the current URL.

## The Inspector is not fictional telemetry

Press **I** or select **Inspect** to read data from the running renderer:
- Actual frame rate sampled from the most recent 30 animation frame intervals.
- Actual `performance.now()` paint duration, not a backend latency figure.
- Number of instantiated mesh nodes and edges.
- Canvas CSS viewport size and real device pixel ratio (capped at 2×).
- Pointer position, generated pulse count, pointerdown event count.
- Current mean mesh displacement from home positions.
- Engine status and deterministic seed.

No network analytics, production server status, GPU frame time or model
performance metrics are implied. Values go blank or report paused/offscreen
when animation is not running.

## Browser resource lifecycle

- `requestAnimationFrame` drives updates; there is no periodic React render
  for every physics frame.
- Telemetry is sampled about every 380 ms and only then updates React state.
- Canvas pixel ratio is capped at 2× to control high-DPI memory use.
- `ResizeObserver` updates the backing buffer and recomputes topology.
- `IntersectionObserver` and page visibility pause drawing when offscreen.
- `prefers-reduced-motion` stops animation and allows a static mesh.
- All listeners, observers and animation frames are canceled on unmount.
- Pointer events are passive; touch allows vertical scrolling.
- No WebGL, heavy 3D runtime, remote texture, worker or network service is
  needed for the field.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| I | Toggle real renderer inspector |
| R | Regenerate a deterministic mesh seed |
| P | Pause/resume animated field |
| Escape | Close inspector |
| Tab / Enter | Normal accessible navigation and control activation |

Shortcuts ignore text inputs, selections and content-editable elements.
A canvas description explains pointer/touch interaction. Site navigation
offers a skip link and visible keyboard focus.

## Content provenance

Featured six are grounded in repository READMEs:

1. [Blackout Protocol](https://github.com/chandrakantdubey/blackout-protocol)
   — Next.js/Colyseus multiplayer rooms and relay grid.
2. [Timesheet](https://github.com/chandrakantdubey/timesheet)
   — Oracle-backed timesheets and attendance, separate Express/HRMS services,
   React frontend, and Chrome Manifest V3 companion. Prototype, not audited production software.
3. [StyleScape](https://github.com/chandrakantdubey/style-scape)
   — deterministic SVG rendering and export.
4. [Pokédex RPG](https://github.com/chandrakantdubey/pokedex-backend)
   — FastAPI backend + [React Native client](https://github.com/chandrakantdubey/pokedex).
5. [FitStream](https://github.com/chandrakantdubey/fitstream)
   — React fitness PWA, FastAPI and GPS route maps.
6. [FarmPulse](https://github.com/chandrakantdubey/farmpulse)
   — early-stage modular sensor analytics prototype; no claim of running AWS
   database, TimescaleDB deployment, live sensor data, or production readiness.

Project diagrams are **original artwork**, not screenshots of the applications
or live dashboards.

Employment date ranges came from the original `src/portfolio.ts` and should
be reviewed before making factual résumé changes. No unverified production
throughput or user-count claims are presented.

## Contact form

The page always exposes a direct `mailto:` link, a copy-email action and
a validated draft composer. On deployments with all necessary secrets, the
form also supports a direct-send Vercel Function.

The optional `/api/contact` handler uses Resend via server-only
`RESEND_API_KEY`, a **verified** `RESEND_FROM_EMAIL`, and server-side
Cloudflare Turnstile verification via `CONTACT_TURNSTILE_SECRET`.
The Vite bundle only reads the public `VITE_TURNSTILE_SITE_KEY`.
No environment keys are committed or sent from the browser.

The endpoint validates content length, JSON types, email formatting,
header-injection characters and matching request Origin. Turnstile tokens
are validated with Cloudflare's server endpoint before Resend is contacted;
missing credentials disable direct delivery (GET reports `enabled:false`).
A honeypot adds friction to automated spam. The Resend request includes a
unique idempotency key to avoid duplicate sends on retries.

This is **not** a distributed rate limiter. Configure a platform WAF/edge
rate-limit rule on `/api/contact` if enabling direct delivery at scale,
and monitor Resend limits. When any configuration is missing or delivery
fails, visitors can use the email-app fallback without losing their draft.

## Validation

```bash
npm ci
npm run lint
npm run build
npm test
npm audit --omit=dev --audit-level=high
```

The dependency-free unit tests cover repeatability, bounded topology, numerical
stability and the six featured projects.

Visual/manual QA should examine narrow Android devices, desktop, keyboard-only
navigation, reduced motion, touch scrolling, canvas lifecycle after tab
backgrounding, and the mobile menu.
