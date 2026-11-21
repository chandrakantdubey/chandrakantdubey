# RELEASE GATES — AMBITION PHASE 3

Status values: PASS = verified in this offline package, PENDING = must be verified on the actual repository, BLOCKED = unsupported by offline environment.

| Gate | Status | Evidence / next action |
|---|---|---|
| Pure engine and model deterministic tests | PASS | `scripts/test-{entropy,root-narrative,negotiator,systems,siege-strategy,packet-siege,coop-engine,coop-authorizer,siege-balance,fuzz,replay-stream}.mjs` |
| Strict TypeScript on core pure engines | PASS | `tsc --strict --noUnusedLocals --noUnusedParameters --noEmit` |
| JSX syntax and component-stub type checks | PASS | Offline test and transpile; does not replace actual React typecheck |
| Installer baseline guard, staging and error rollback | PASS | Fixture integration and injected filesystem failure, `scripts/test-safe-installer.py` |
| Real ecology painter and representative CSS in Chromium | PASS (isolated) | 1440, 768, 390, 320px screenshots, no overflow or JS errors; not React runtime |
| Preserve old quick + multiplayer deterministic semantics | PASS | Full tick snapshots compared to pinned pre-upgrade fixture |
| New Siege offers winning and losing policies | PASS | Entire 462-tick run validated |
| Co-op pure role authorization | PASS | `test-coop-authorizer.mjs` |
| Two-client CAS / idempotency race model | PASS (test double) | Concurrent writes, ETag rebase, same UUID twice, role spoofing, shield, reconnect and expiry; **not** a live Blob or HTTP test |
| Capacity and resilience mathematical invariants | PASS | 2,000 randomized capacity inputs and 2,000 retry scenarios; fixes success counts exceeding 100% of unique requests, clamps invalid model inputs |
| Co-op POST parse validation | PENDING | `test-coop-server.mjs` under installed `@vercel/blob` dependencies |
| React + Vite full production build | BLOCKED | Need actual repo + `npm ci`, `npm run build` |
| Repo ESLint | BLOCKED | Need actual repo + dependencies |
| Serverless API TypeScript build | BLOCKED | Need actual repo + `@vercel/blob` |
| All existing project unit/contract tests | PENDING | `npm test` on actual repo |
| **Whole-application** Chromium desktop + 320/390/768/1440 | PENDING | `npm run test:browser` and inspect screenshots; offline painter test does not cover React integration |
| Two physical clients: host/guest, reconnect, concurrent CAS actions | PENDING | Validate room ownership, role controls, stale snapshot, idempotency |
| Screen-reader keyboard-only and reduced motion | PENDING | Manual testing, including Garden Canvas alternative |
| Performance p75 mobile, canvas render and worker budget | PENDING | Lighthouse + real devices; canvas frame timing under population saturation |
| Cost/security: 2-player room tokens, rate limits, secrets | PENDING | Check Vercel Blob write limits, payload size, origin policy, 2-hour load test |
| Final artistic screenshot review | PENDING | Compare exported images and live screens to cinematic design target |
| Production release and route health | NOT REQUESTED FOR THIS SLICE | No GitHub push or Vercel production change |

## Acceptance criteria

1. Each chamber produces distinct outcomes under distinct user decisions; no multiple-choice instant answer.
2. All gameplay and inference-like interactions remain clearly fictional; no fake claim of actual production telemetry, AI privilege, or scientific realism.
3. Packet roles are enforced server-side from authenticated, hashed tokens; no authority derived from client `player` or `game` fields.
4. Online quick-play state, room expiry, idempotent actions, and Blob CAS logic continue functioning.
5. Mobile controls support pointer and keyboard, preserve readable text, and do not overflow at 320px.
6. Optional audio is muted until visitor opts in; no auto-playing loops or external asset costs.
7. `npm run lint && npm run build && npm run typecheck:api && npm test && npm run test:browser` all pass on the **final merged candidate**.
8. Only after those gates, deploy once and verify production commit, routes and runtime errors.
