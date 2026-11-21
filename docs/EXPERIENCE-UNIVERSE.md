# The Experience Universe — implementation status

This is a staged evolution of the portfolio, not an assertion that the entire long-term roadmap has shipped.

## Routes

- / — existing editorial portfolio and existing incident/arcade chapters
- /lab — new cinematic laboratory index
- /lab/disaster — new browser-local, seeded incident-response simulator
- /lab/take-five — coupled rotor mechanism and SVG-generative garden
- /play/packet — existing Packet Panic, now with additional solo Siege mode
- /engineering — interactive simplified application capacity model
- /access — fictional discovery index and safe command interpreter

## Visual and audio

- Original vector chrome kinetic sculpture on the lab heroes.
- Existing homepage hero is now integrated into the darker cinematic treatment, while the editorial chapters remain distinct. Lab pages use responsive panels and reduced-motion fallbacks.
- Global opt-in synthesized Web Audio: short tonal interaction cues, distinct discovery sounds, and a separately enabled low-volume procedural ambient drone. Sound is OFF until the visitor enables it.
- Packet Panic retains its existing separate sound setting for game-specific events.
- Sounds are short and synthesis-based; no remote audio streams or autoplay.

## Incident model

Five incident categories are represented by different initial conditions and constraints: pool starvation, retry amplification, cache stampede, cascading dependency load, and deployment regression.

The discrete-time model advances deterministically from scenario and seed. Interventions change capacity, retry factor, cache hit ratio, load-shedding fraction, and circuit-breaker behavior. Queues, latency, and error figures derive from the model.

**Limitations:** This is illustrative systems behavior, not real production telemetry or an accurate queueing-theory/network simulator. Rollback and scaling effects are simplified. The current UI has no fully-fledged traces search or server-verified report.

## Packet Siege

The five-wave four-minute solo variant is intentionally limited to browser-local mode so it cannot change the existing multiplayer room protocol. The shared engine accepts optional round duration and a second wave schedule. Standard 90-second sessions remain unchanged.

**Limitations:** Siege currently shares the existing seven-by-five tile rules, repair and score logic. New packet classes, resource economy, asymmetric co-op roles, and dedicated realtime worker architecture remain future work.

## ROOT ACCESS

Six optional artifacts are discoverable through legitimate interactions across the site. The /access terminal permits only predefined fictional commands; it cannot execute shell commands or privileged browser actions. Progress is local to the browser, best effort, and resettable. Unlocks cannot block core site content.

## QA commands

npm ci
npm run lint
npm run build
npm run typecheck:api
npm test
npm run test:browser

The CI build incorporates these tests. Browser smoke includes all new routes and verifies that core interactive controls mount on reduced-motion mobile emulation.

## Remaining milestones

- Deep incident trace explorer, intervention timing, verified replay/report and broader scenario model.
- Visually sophisticated physically based machine and generative garden dynamics.
- Full Packet Panic Siege strategy, balancing, co-op roles, and multiplayer load testing.
- Complete ROOT ACCESS narrative design and narrative endings.
- More engineering demonstrations and verifiable case studies.
- Full visual review against the intended art direction, multi-device field QA, and performance measurement.

**Release policy:** Keep this in a draft PR until new routes, accessibility, load, mobile layouts, sound preferences, and existing contact/multiplayer flows have been validated. Do not deploy solely because compilation passes.
