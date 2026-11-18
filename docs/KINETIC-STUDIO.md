# CD Studio — Kinetic Typographic Portfolio

This portfolio is a real interactive graphics experiment with the personal
work, professional history and contact information kept intentionally compact.
It is not a simulated operations dashboard or a gallery of unrelated minigames.

## Primary experience

The first screen renders **CHANDRAKANT / DUBEY** as a spring-driven field of
particles sampled from the actual glyph pixels. Its target geometry is rebuilt
from real browser font metrics on resize and after font loading.

| Implementation | Purpose |
| --- | --- |
| `src/field/typeEngine.ts` | Pure, deterministic and bounded particle spring math |
| `src/field/TypeCanvas.tsx` | Canvas 2D glyph rasterization, drawing, input and lifecycle |
| `src/field/engine.ts` | The original deterministic mesh model |
| `src/field/FieldCanvas.tsx` | Alternate spring-mesh drawing mode |
| `src/atelier/StudioPortfolio.tsx` | Accessible page, inspector, controls and layout |
| `src/atelier/clientWork.ts` | Public team-built products and anonymized intranet projects |
| `src/atelier/content.ts` | Personal projects, accurate employment periods and tech stack |
| `src/atelier/ContactSection.tsx` | Direct email plus optionally verified send |

### Actual interactive controls

- **TYPE / T**: switch to glyph particles.
- **MESH / G**: switch to the underlying grid spring system.
- **REMIX / R**: generate reproducible topology using a seeded PRNG.
- **PAUSE / P**: stop physics without resetting geometry.
- **SHARE**: copy a URL including `?field=<seed>`.
- **SAVE PNG**: export the actual canvas pixels to a local file.
- **INSPECT / I**: inspect measured Canvas 2D FPS, paint time, point count,
  viewport, device-pixel ratio, pointer coordinates and shockwave state.
- **Escape**: close the inspector.

The canvas does not report fake production monitoring data. Performance
measurements are local to the browser and based on real animation frames.
The render loops are visibility-aware; device pixel ratio and particle
counts are capped. Touch scrolling remains available, reduced-motion
preferences stop continuous animation, and all event handlers are cleaned
up on unmount. The pure physics model has deterministic and stability tests.

### Content design

The six personal repositories are **small, source-linked cards**, not
gigantic previews. Each card exposes a short description, its stack and
optional implementation detail on hover/focus.

Professional experience is separate from the portfolio's self-owned projects.

The company work list is framed as **selected team contributions**, not
projects built alone:

Public work:
- Uvation Marketplace: https://marketplace.uvation.com
- Uvation Rewards: https://rewards.uvation.com
- Kintree: https://kintree.com
- Bombay Dyeing Retail: https://retail.bombaydyeing.com/
- Brush of Hope: https://brushofhope.life
- Nutriiya website and app backend: https://nutriiya.com

Private bank/intranet systems are listed without links or identifiable
customer names: i-Compass (performance reviews), VAMS (vendor timesheets),
departmental L&D, and CSR. No internal architecture or protected details
are disclosed.

Nutriiya's corrected employment period ends in **January 2026**.

### Browser and release checks

```sh
npm ci
npm run lint
npm run build
npm run typecheck:api
npm test
npm run test:browser
npm audit --omit=dev --audit-level=high
```

The headless browser check tests a desktop viewport and 390px mobile,
all six personal repositories, small card sizes, public/internal work
counts, the corrected timeline, pointer physics, Inspect Mode and the
two rendering modes. It retains PNG screenshots as GitHub Actions artifacts.

The serverless contact function supports direct send only when Resend
sender verification and Turnstile credentials are configured. The default
fallback composes an email draft; its semantics are documented in
`docs/DEPLOYMENT.md`.

No private code, bank identifiers, internal addresses or confidential
data are embedded in the site.
