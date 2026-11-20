# Specimen 001 — experience contract

The vial is a **progressive enhancement**, not a new route or marketing headline.

## Behavior

- The portfolio loads in its normal, fully accessible presentation. The 3D monogram, work, experience, Lab, games, ROOT ACCESS and contact remain available at all times.
- A small rendered glass vial in the hero opens a modal **only when interacted with**. The visitor can leave without changing the site.
- `UNSEAL` activates a visual environment state, one brief atmospheric apparition (suppressed for `prefers-reduced-motion`), and a collapsible navigation/character dock.
- The visitor can visit the Lab or Arcade from the dock, turn optional browser voice on/off, collapse the dock, or restore the original presentation immediately.
- All states are browser-local. The chosen presentation persists in `sessionStorage` for that tab and can be reset. No remote tracking, credentials, API calls or new infrastructure.
- The character uses a small reviewed line library, a cooldown for round-result reactions and no random network LLM content. Short dry humor is intentional; promotional slogans are explicitly excluded.
- Audio is off by default, uses local `speechSynthesis` when available, and is not essential for any content. Pitch and voice preference are best-effort: exact voice quality varies across operating systems/browsers.

## Architecture / boundaries

- `Exhibition` owns a single boolean mode flag; `SpecimenExperience` renders the hero artifact and a portal for its modal and dock.
- The effect is implemented with a parent class (`specimen-awakened`) and scoped CSS; it does not modify Packet Panic state, room APIs, WebGL shader logic, contacts or ROOT ACCESS commands.
- A single existing `cd:packet-result` event is consumed for contextual win/loss commentary. Nothing is inferred or collected about visitors.
- The apparition lasts at most 1.65 seconds and does not block pointer events or route navigation.
- Accessibility: a named trigger, modal semantics, Escape and outside-click dismiss, focus trap and return, visible close/restoration, captions, reduced motion and 320px+ layouts.

## Not yet included

- Unique commissioned feminine character voice. Web Speech TTS is a browser-local preview, not guaranteed studio-quality performance.
- Cross-section quests, richer visual transitions, shared discovery progression and performance refactor are independently tracked in issues #19–#22.
- No literal “looks harmless” slogan or promotional text is added to the portfolio.
