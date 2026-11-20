# Specimen v2 — Quality and performance release checklist

This document is for code readiness. **Do not merge or deploy until the owner explicitly authorizes tomorrow's release.** PR #24 and the deployment issue #25 are the release boundaries.

## Test matrix

| Viewport / capability | Automated checks | Manual verification |
| --- | --- | --- |
| Desktop 1440 × 920 | Hero WebGL/fallback, project gallery, modal, full three-note circuit, terminal restore, Lab, arcade and CAS simulation | Fine visual rhythm, contrast, pointer interactions |
| Tablet 768 × 1024 | No horizontal overflow, screenshot, responsive section geometry | Touch target sizes, landscape and portrait |
| Phone 390 × 844 | Vial modal, archive disclosure and close/reset, full games and source links, screenshot | Physical Android Chrome and iOS Safari |
| Phone 320 × 700 | Text-size minimum, no horizontal overflow, fallback/voice-limited mode | Lowest supported screen width and keyboard |
| Keyboard | Modal focus trapping, Escape, close/focus restore, gallery tab arrows, terminal prompt and copy | Real keyboard and switch access, screen-reader announcements |
| Reduced motion | No specimen apparition, static hero instead of WebGL on initial load, no moving page effects | OS-level motion toggle while page is open |
| Speech API unavailable | No broken voice control, full captions and identical navigation | Browser speech permission/voice list fallbacks |
| Two independent visual modes | Specimen and fictional ROOT CSS modes coexist, restore independently | Modal layering, history and reload |
| Deep-link / slow chunks | `#incident`, standalone `/play/packet`, deferred experiences near viewport, static placeholders | Throttled 3G and offline behavior |
| Contacts, incident, games | Existing regression flows remain green | Cross-device production co-op match after release |

## Source-of-truth and privacy

The only saved discovery data is three opaque IDs in sessionStorage, parsed against a strict allowlist. Terminal commands never execute a shell. The CAS experiment is an explanatory fixture, **not live match evidence**. The Web Speech API is off by default, entirely optional, and may differ across browsers.

## Measured bundle limits

CI enforces the following gzip budgets on the Vite output using `scripts/check-bundle-budget.mjs`:

- Entry and its static imports: **115 KiB**.
- All JavaScript combined: **260 KiB**.
- All CSS combined: **50 KiB**.
- Largest JavaScript chunk: **120 KiB**.
- Mandatory independently loadable chunks for Exhibition, StandalonePacket, IncidentReplay, FluxGame and PacketPanic.

The previous unsplit output (prior to this release) was a 323.38 kB / 104.64 kB gzip main JS file and 120.93 kB / 26.87 kB gzip CSS. These numbers are build artifacts, **not Web Vitals**. Review the new build's actual size report before release.

The browser harness captures LCP candidates, layout shifts and main-thread long tasks at initial navigation. An 850 ms single long task and a 4.2 s synthetic mobile p75 LCP are hard regression alarms, not performance ambitions. The preferred user-facing thresholds remain LCP ≤2.5 s, CLS ≤0.1, INP ≤200 ms at real-user field p75. The scripted mobile p75 is calculated from three headless reloads: it does **not** establish production or real-device p75. Collect real-user metrics separately and with appropriate privacy notices after deployment.

## Layout stability

The Lab and both embedded games are lazy-imported and only mounted near the viewport. Their root container exists from the first render (including the `#incident` deep link), with reserved height to avoid early content jumps. The optional CAS experiment lives *after* the main arcade, so collecting the third note doesn't insert a large block above the user.

Reduced-motion visitors do not initialize the WebGL hero. A CSS monogram remains visible. If WebGL context creation fails, the same fallback is used. Static content, project links, APIs and contact do not depend on animation.

## Release gates (tomorrow)

1. Check exact PR head SHA and GitHub Actions on that SHA.
2. Check deployment quota; stage preview only when approved.
3. Test source-linked notes, incident, CAS experiment, room API and contact on the exact preview build.
4. Merge PR only after review, allowing the production deployment to start.
5. Verify the Vercel alias points to the intended main commit and that homepage, standalone game and APIs respond.
6. Close implementation and release issues **after** successful production verification.

Nothing in this document authorizes a background deployment or a scheduled release.
