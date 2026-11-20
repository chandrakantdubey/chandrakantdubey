# Packet Panic

A 90-second arcade network-repair game with solo play and anonymous 2-person co-op, embedded in the portfolio and available at `/play/packet`.

## Playing

The 7×5 board contains **rotatable** straight/corner/tee/cross routers. Click, tap, or keyboard-activate a node to rotate it 90° clockwise. Cyan and lime packets enter on two different left-hand lanes and must reach the matching right-hand outlet. Correct routes earn points and integrity; dropped packets cost 6 integrity. At the 30- and 60-second marks, traffic increases. Later waves introduce automatic router faults. Three shared PATCH charges restore 22 integrity each. Survive 90 seconds to win; reach 0 integrity to lose. Solo starts immediately without an API or login.

## Multiplayer infrastructure

- The existing **Vercel Private Blob** integration powers rooms: no extra cloud service or credentials.
- `POST /api/packet`: `create`, `join`, `snapshot`, `start`, `rotate`, `patch`, `restart`. `GET /api/packet` indicates whether online rooms are configured.
- Opaque 12-character room codes and 32-character bearer credentials, stored as **SHA-256 hashes** server-side. Secret tokens are returned only to the creating/joining player, remembered in that device's `localStorage`. The invite link contains **only** the non-secret room code.
- A shared deterministic fixed-tick engine (`packetEngine.js`) runs in browser solo mode and within the Vercel Function in multiplayer. The server alone awards scores, calculates hits, advances clocks and validates tile rotations.
- Room state is versioned; every write uses **Blob ETag compare-and-swap**. Concurrent rotations from separate Function instances retry against fresh state instead of overwriting one another. Client-generated UUID command IDs provide idempotency for `start`, `rotate`, `patch` and `restart`.
- New rooms are bounded by a best-effort per-instance limit of 6/hour per edge IP (not a distributed rate limit). Rooms expire after 8 hours, with private blobs set to expire after one day. Request size, origin and input shapes are validated.
- Two browsers synchronize via ~1.05-second snapshot polling. This is **not real-time WebSocket transport**; the design favors zero additional infrastructure and deterministic multiplayer over sub-100-ms action latency. Gameplay rendering and solo simulation run locally without polling.
- The online service has a fixed 2-player capacity. The host controls columns 1–4 (ingress), while the guest controls columns 5–7 (egress); the API enforces ownership and restores the authenticated role after reconnect. The host starts/rematches. Both share repair charges and the same score. Concurrency conflicts are resolved server-side.

## Reliability and cost

Polling across two clients means roughly two reads per second and up to one conditional state write per game tick when watched. This is acceptable for a portfolio demo, but **not suitable for thousands of simultaneous rooms**. For substantial scale, migrate room ownership and simulation to a stateful room worker, Redis-coordinated WebSocket service or Cloudflare Durable Object, while keeping the shared deterministic engine and authenticated action protocol.

The `BLOB_READ_WRITE_TOKEN` must remain server-side (already configured on the Vercel project). Solo mode works even when online storage is absent.

## Tests

- `npm test` covers fixed-step engine determinism, lane reachability, timed waves, bounded packets, API token isolation, authorization, ETag conflict safety, idempotent retries, repairs, rematches and room expiry.
- `npm run typecheck:api` checks the Vercel Function.
- `npm run test:browser` tests desktop and mobile network layout, tile rotation, running clock, dedicated invite route, accessibility text sizes and no horizontal overflow at 390px and 320px.

## Daily challenge and share cards

The daily challenge derives a deterministic network seed from the current **UTC date**, not the visitor's local timezone. Everyone gets the same seed for that day; a personal best is stored in browser localStorage under a date-scoped key. There is **no** server-verified or global ranking. A free-play result, daily result, and cooperative result are labeled distinctly when the visitor copies a share summary; the link does not include room credentials. Players can restart the daily run with its original seed.

The final wave announces automatic router faults and successful deliveries emit a restrained visual pulse. All effects respect the browser's reduced-motion setting. The portfolio remembers the last round's score only within sessionStorage so it can react subtly in the footer.

## The rest of the portfolio

A browser-only ROOT ACCESS easter egg provides an allowlisted fictional command console. It cannot execute JavaScript or system commands. An interactive incident replay is a **simulated investigation**, never claimed as real customer telemetry. These features have independent tests and can be removed without affecting the game's backend.
