# Immersive Playground — Games and Spatial Portfolio

## What is actually playable

**Signal Shift** is an original arcade experience rendered in Canvas 2D.
Drag on mobile, move with WASD or arrow keys on desktop; collect luminous
sparks, avoid red interference, and survive escalating waves. Collision
detection, continuous motion, 3-hit health, score, streaks and a local best
are implemented in `src/play/fluxEngine.ts` and `FluxGame.tsx`. No scores
are uploaded to the server and no remote player is simulated.

**Trace / Hex** is an original 7×7 adversarial connection strategy game.
Coral connects West to East, lime connects North to South. Valid turns,
neighbors, and winning connections are computed from a real graph (BFS)
in `src/play/duelEngine.ts`. An in-browser CPU opponent enables immediate
practice even without a network.

When storage is configured, two remote visitors can actually share a board:
the host creates a room, sends `/play/duel?room=...`, and the second player
joins it. Player 1 uses coral, player 2 lime. The dedicated page is available
at `/play/duel`. There is no modal and the same game can also be played
directly inside `/#play`.

**Blackout Protocol is not used for either game.** It remains listed only as
one of the user's existing personal repositories.

## Multiplayer design, limitations and correctness

- `api/duel.ts` is a Node.js **Vercel Function**; no independently hosted
  socket server, managed game worker, or dedicated compute instance.
- Room state persists as a **private Vercel Blob** JSON object. No room state
  is trusted from the browser, and player tokens are stored only as
  SHA-256 hashes in the Blob, with raw tokens held by the participants.
- GET reports whether multiplayer is configured; POST actions validate Origin,
  JSON schema, room codes, moves and credentials before touching the store.
- A state version prevents stale moves. Conditional Blob writes with ETags
  provide cross-instance compare-and-swap, so conflicting turns cannot silently
  overwrite one another. Clients reload and retry after conflicts.
- Client polling every ~3 seconds is **near-real-time turn-based play**, not
  continuous WebSocket gaming. Room codes are 12 random URL-safe characters.
- Active rooms logically expire after **eight hours**, and Blob TTL deletes
  their storage after one day. Finished matches can be replayed by rematch.
- The room invite URL contains only a room ID. It does **not** expose host
  credentials. A participant's private player token is retained in their
  browser's localStorage for reconnect.
- Private store ID: `store_7GtglVDUn6sBxb3a`, linked to the portfolio's
  Vercel project. Secret `BLOB_READ_WRITE_TOKEN` is server-side.
- Vercel WAF rate limiting blocks excessive POST traffic to `/api/duel`
  at **120 requests per minute per IP**. This must be tuned with real
  traffic/false-positive observations; multiple visitors behind a NAT share
  the same quota. Function logging excludes player tokens.

Security/failure paths: two different users attempting the same turn will
produce an HTTP 409 conflict, not a split brain; invalid tokens receive 403;
expired rooms receive 404; unavailable Blob storage returns 503 and solo
practice remains playable. The API does not use process-local room maps.

This feature has possible Vercel Blob storage, request, Function invocation,
and WAF usage charges even without a standalone backend. Polling frequency
should remain low to keep costs bounded.

## Spatial composition

- `src/exhibition/spatial.css`: a tilted center poster plus two rear
  posters, responding to pointer tilt. Project selection and GitHub links
  are unchanged.
- `src/exhibition/SkillOrbit.tsx`: an animated 3D orbital tech sculpture
  with accessible real category tabs, no fake skill percentages.
- Career/team rows are three-dimensional hover surfaces, with the original
  professional content and privacy conventions preserved.
- Contact form is visually lifted within the orange chapter, retaining the
  same protected Resend/Turnstile progressive enhancement and mailto fallback.
- Reduced-motion preferences disable nonessential continuous animations.

## Tests and release

Run `npm ci && npm run lint && npm run build && npm run typecheck:api && npm test && npm run test:browser`.
Unit tests cover both game engines, determinism, winning Hex paths, illegal
moves, invalid API input, and absence-of-storage fallback. Chromium
browser tests cover responsive desktop/mobile, actual playable controls,
spatial gallery, skill tabs, dedicated arena route and contact.

Real two-browser **production** verification should create a room, open the
invitation on another device/profile, play alternating turns, ensure both
screens converge and verify a rematch. Do not claim this cross-instance
test is complete solely because simulated engine and local browser tests
passed.
