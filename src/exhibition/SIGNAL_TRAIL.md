# Specimen signal trail — first connected exploration release

This is an optional, three-part engineering discovery circuit activated by unsealing Specimen 001. It adds useful technical context without taking anything away from the normal portfolio.

## The three evidence points

1. **Archive** (`#work`): each selected public project exposes the exact implementation summary from the project record, one project-specific design question, and its actual source link. The note is not an assertion about unverifiable scale or production traffic.
2. **Lab** (`#incident`, Investigate): a trace explanation shows that 1,957/2,102 ms (93.1%) is spent acquiring a database connection, while the SQL work takes 21 ms. All figures remain explicitly simulated. The decision is rollback, then bounded retry and measured pool/concurrency tuning.
3. **Arcade** (`#final-boss`): documents the 520 ms deterministic simulation, ingress/egress player ownership, and the existing Blob ETag CAS + polling consistency model. Links to the actual game engine.

Each note is a disclosure control. Opening it adds an opaque ID (`archive`, `lab`, or `arcade`) to sessionStorage; no identity, gameplay tokens, source code or private data is stored. Repeat reads are idempotent. Closing/reopening an experience does not erase the notes.

## ROOT ACCESS integration

The existing fictional browser-only terminal now supports:

- `signals`: list three note statuses and a completion hint.
- `ls /signals`: list the names of the simulated notes.
- `cat /signals/archive.note`, `cat /signals/lab.note`, `cat /signals/arcade.note`: read recovered notes. Unvisited notes receive a contextual prompt rather than content.
- `cat /signals/report`: synthesize the engineering throughline when all three notes are recovered.
- `signals --reset`: reset the local discovery trail, without clearing games, auth, or portfolio content.

Terminal commands never execute shell commands or access an API. A sealed visitor can still access all essential work, incident simulations, games, and source links; the trail is a progressive enhancement.

## Release boundaries

- The existing game APIs, scores and room synchronization remain unchanged.
- There is no required account, remote persistence, analytics tracker, AI backend, or new environment variable.
- The awakened state is still fully reversible. Notes can be reset independently with an explicit terminal command.
- CSS is scoped to these three disclosures, with keyboard focus styles and 320px+ responsive layouts.
- Broader secret quests and the performance/code-splitting work remain tracked separately in issues #22 and #21.
