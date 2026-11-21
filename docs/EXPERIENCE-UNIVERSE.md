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

## Incident model — v2 workbench

The incident route is no longer a fixed metric chart with six instant-fix buttons.
A **versioned deterministic incident engine** simulates baseline demand, retries,
application and dependency capacity, cache-hit behavior, load shedding, queue
growth, latency, 5xx failures, availability and resource-cost trade-offs. All
visible metrics, traces and logs are derived from the same state history.

The workbench now includes:

- Selectable service topology and causal inspection notes.
- Latency, 5xx and queue time series with a tick scrubber.
- Trace, log and configuration-change panels derived from simulation state.
- Eight operational interventions, including traffic restoration and circuit closure.
- Four-tick SLO recovery verification. Rejecting 72% of customers is **not**
  incorrectly treated as an incident recovery.
- An operator timeline, summarized incident report, JSON export, and
  version-checked deterministic URL replays.
- Five incident categories, each with at least one meaningful recovery plan,
  plus negative tests for misleading scaling and load shedding.

The engine has no backend cost in solo mode; the replay URL carries only
simulation seed and validated commands, not tokens or production data.

**Limitations:** Discrete requests-per-tick are abstract units, the latency
model is deliberately simplified, dependency simulation is approximate, and
the report is *not* an audited operational assessment or actual customer impact.
There is no live OpenTelemetry collector, full trace search, or Kubernetes
control-plane integration. Global scores cannot be verified from client data.

## Take Five — Kinetic Chamber v1

The first Take Five chamber now runs a fixed-step, browser-local mechanical
simulation rather than the initial three-button phase puzzle. The new module
includes three inertial rotors, two engageable gear couplers, alternating
rotation, detent calibration, spring/damping integration, 60Hz simulation,
thermal limits, energy reserves, a core capacitor, rejected pulse feedback,
stable-phase verification, and score calculation.

The visual chamber uses original SVG chrome/glass illustration, drag/touch
gestures, full keyboard-accessible CW/CCW/coupler/pulse controls, 30fps sampled
rendering, 8fps reduced-motion sampling, and hidden-tab pausing. All sound
events go through the existing opt-in global sound controller. Successful
completion unlocks the fictional ROOT ACCESS mechanism artifact locally.

The pure engine is tested through
\`node --experimental-strip-types scripts/test-kinetic.mjs\`,
which runs in the repository's \`npm test\` pipeline. Browser smoke tests
exercise the component and garden switching.

The garden remains the existing procedural SVG generator; a more ambitious
physical/generative ecosystem, Negotiator chamber, and full narrative arc
are not implemented in this release. These limitations are explicit and
must not be presented as completed functionality.

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
- Further physical detail beyond the deterministic inertial-rotor simulation, richer generative garden dynamics and additional chambers.
- Full Packet Panic Siege strategy, balancing, co-op roles, and multiplayer load testing.
- Complete ROOT ACCESS narrative design and narrative endings.
- More engineering demonstrations and verifiable case studies.
- Full visual review against the intended art direction, multi-device field QA, and performance measurement.

**Release policy:** Keep this in a draft PR until new routes, accessibility, load, mobile layouts, sound preferences, and existing contact/multiplayer flows have been validated. Do not deploy solely because compilation passes.
