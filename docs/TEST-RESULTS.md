# OFFLINE TEST RESULTS — AMBITION PHASE 3

**Baseline:** GitHub repository `chandrakantdubey/chandrakantdubey`, `main` at `3730fa11f70145a2e4410ab0105d6c51b4cbeeba` when the relevant files were fetched.

**Commands verified:** `bash scripts/run-offline-tests.sh` and `python3 scripts/visual-check.py` from this package's root.

## Passed

- Strict TypeScript checks for pure ecology, narrative, negotiation, and systems engines.
- TSX parser/transpilation syntax checks for Entropy Garden, Root Archive, Negotiator, Systems Gallery, and Siege Panel.
- Ecology reproduction/resource flow, climate-dependent results, deterministic continuation.
- ROOT ACCESS progression, artifact/correlation rules, three narrative endings, command bounds.
- Negotiation finite-state gameplay, two successful outcomes, failure, deterministic replay.
- Capacity and resilience model comparisons and deterministic traces.
- Fixed a causality/accounting defect: aggressive retry attempts could inflate modeled logical completion above 100% (reproduced at 109.5%). Completion now counts at most original unresolved requests; failed attempts remain an attempt-level metric. Added 4,000 randomized capacity/resilience checks, plus malformed input and scaling invariants.
- Siege classification, player action cooldowns, energy/heat/bandwidth, no farming, deterministic ticks.
- Legacy Packet Panic quick/coop transition parity against pinned local baseline fixture.
- Server-role pure authorization and charges for asymmetric pair-rotation/fault shield.
- Two-client concurrent command tests through an in-memory CAS/ETag storage double, including collision/retry, same UUID deduplication, role forgery rejection, fault shield consumption, reconnect, expiry and out-of-order client snapshots. This is **not** a live HTTP or Vercel Blob integration test.
- Full five-wave Siege balance: one surviving and one losing strategy under different policies.
- Atomic release installer against a disposable repository-shaped fixture, including server route patch anchors.
- 120 additional seeded, cross-system invariant scenarios and ROOT persistence checks.
- Streamed/cancellable Garden replay with deterministic equivalence, the full 6000-day limit, and corrupt-input prevalidation.
- Safe installer rejects divergent Git baselines and restores files after an injected third-file I/O failure.
- Isolated Chromium test of the real ecological painter and CSS at 1440, 768, 390, and 320 pixels; no overflow or JavaScript errors, and a real click advances the simulation.
- Responsive microscope crop captured alongside the full ecological field.
- Real generated ecology visual preview from engine-derived state.

## Pending on the actual repository

- Locked dependency installation, `npm run lint`, production `npm run build`, `npm run typecheck:api`, and `npm test` including server route parser contract.
- **Full app** Chromium smoke suite and screenshot inspection. Only the standalone Garden painter/layout harness passed offline.
- Two-browser authenticated multiplayer testing, concurrent commands, CAS conflict/retry, reconnect.
- Real mobile pointer + keyboard + screen-reader verification, reduced motion, offline behavior and frame budget.
- Security review of the final patched HTTP route, request budgets, and cloud storage semantics.
- Production review and deployment — **not performed here**.

The offline fixture verifies integration anchors and expected structures, **not** actual application runtime behavior or compatibility with a changed upstream repository. Do not publish until these pending checks pass.
