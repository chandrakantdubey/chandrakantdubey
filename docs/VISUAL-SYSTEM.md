# Visual system · Edition 02

The portfolio uses one consistent typography hierarchy across the hero,
project work, professional experience, tech stack, playable games, and contact.

| Role | Family | Usage |
| --- | --- | --- |
| Display | Bricolage Grotesque | Large names, chapter headings, project names, gameplay titles, key buttons |
| Reading | Manrope | Descriptions, navigation, form labels, role text, instructions |
| Technical labels | JetBrains Mono | Section indices, short metadata, interface indicators |
| Editorial accent | Instrument Serif italic | A single emphasized word in occasional chapter headings |

Styles are centralized in `src/exhibition/type-motion.css` and imported once from
the app entrypoint. The existing source CSS was updated to use the same families.
Functional body copy is approximately 14–17px on phones and 15–18px on desktop;
the short high-density labels are deliberately secondary and never substitute
for the actual readable content.

## Stack reactor

`src/exhibition/SkillOrbit.tsx` now renders a **3D technology reactor**,
with its own styling in `reactor.css`: four clickable/keyboard-operable
engineering disciplines, real technology names as perspective nodes,
animated connectors, a luminous central module, pointer-following camera,
a focused-tool readout, and responsive layouts. The entire experience is
embedded directly in the lime stack chapter, not a modal or set of static
cards. The old orbit markup and obsolete CSS were removed.

## Signal Shift

The game overlay now has a single centered composition with the title,
description, and start/resume button sharing one layout anchor. Additional
reticles and small corner markers move behind the art, not over controls.

The original 960×540 virtual world was previously stretched into a tall
phone element using `object-fit: cover`. That **cropped most of the playfield**
and made mobile aiming hard to reason about. It now uses `object-fit: contain`
and computes pointer coordinates through the resulting centered viewport
with the appropriate letterbox offsets, so no hazards disappear beyond
an artificially cropped edge.

## Motion and accessibility

- Input-driven 3D rotation is muted if the user prefers reduced motion.
- Signal connections, atmospheric starfield, game reticle and rotating
  typographic symbols pause visually under reduced-motion CSS.
- Category selector uses tabs, roving focus with arrows/Home/End, and
  true selected state; individual technology nodes are focusable buttons.
- Browser QA measures actual centered game-overlay bounding boxes,
  rejects cropped canvas mode, verifies skill selection, checks text family
  and readable sizes, and captures desktop/390px/320px screenshots.
- All previous games, API endpoints, personal projects, professional credits,
  and contact workflows are unchanged.

Before release, inspect the screenshot artifacts. CI passing alone is not
proof of sound visual layout.
