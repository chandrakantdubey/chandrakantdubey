# Chromatic Exhibition · Creative Engineering Portfolio

A portfolio designed as a small interactive digital exhibition, rather than a
metrics dashboard, particle demo with debug controls, or ordinary grid of cards.

## Art direction

- **Chapter 00**: cobalt/ultraviolet hero with oversized asymmetric name
  typography, acid-yellow accents and a procedurally assembled 3D CD monogram.
- **Chapter 01**: warm paper project gallery with six original animated poster
  illustrations; only one project is featured at a time, keeping the entire
  section compact and visually meaningful.
- **Chapter 02**: near-black experience and team contributions with generous
  typography and tightly tracked roles and dates.
- **Chapter 03**: acid-yellow stack composition with a hierarchy of actual
  technologies rather than fictitious skill percentages.
- **Chapter 04**: coral-orange contact composition retaining the secure
  optional delivery API and reliable prefilled email-app fallback.

The sculpture is **not a mesh inspect tool**. Its GPU geometry is hidden as a
rendering implementation detail; the front-end interaction is simply to drag
or tap the sculptural object. The old spring-mesh UI, inspector, metrics,
field test scripts and unused previous page components have been removed.

## Hero: Code Monument

The former abstract chrome loop is replaced by a genuinely interactive
**CD monogram compiled from bitmap glyphs into extruded GPU modules**.

- `src/exhibition/codeGeometry.ts` maps C and D into deterministic arrays
  of individual 3D building blocks, complete with normals, UVs, and scatter targets.
- `src/exhibition/CodeMonument.tsx` implements custom WebGL1 shaders to
  assemble the blocks, animate the construction, and light their metallic faces.
- Drag to rotate. Tap, press Enter or Space while focused, or select
  **Recompile** to scatter and rebuild the initials.
- Real source-to-geometry transformation, not a fabricated compilation
  console, downloaded model, or decorative video.
- Browser optimizations include capped pixel ratio, viewport visibility
  pausing, reduced-motion handling, deterministic module layout, bounded
  GPU buffers, pointer capture, context-loss fallback, and resource cleanup.
- The CSS fallback displays extruded letters on devices without WebGL.
- No spring-mesh experiment, inspector, or debug controls are shipped.

`scripts/test-exhibition.mjs` validates geometry, determinism and content.
`scripts/browser-smoke.mjs` checks real assembly and responsive input.

## Custom poster gallery

`ProjectPoster.tsx` implements six self-contained SVG/CSS visuals reflecting
actual project domains (network repair game, enterprise timesheets, procedural
SVG, a mobile RPG, fitness routes, and an in-development sensor prototype).
Illustrations are original, **not representations of live application UI**.

`Exhibition.tsx` implements a six-tab gallery with actual React state and
accessible tab roles. Users can hover, click, press Arrow keys/Home/End on
the tabs, or use previous/next buttons. The selected poster, description,
technology chips and GitHub links change together. The original project
status labels remain accurate; AI Concepts Atlas is intentionally excluded.

The contact form and team work are imported from the existing validated
`src/atelier/` modules. Public company products link to their websites.
Four private banking/intranet projects display no invented public links or
confidential architecture details.

## Checks

`scripts/test-exhibition.mjs`: geometry consistency and content correctness.
`scripts/test-contact.mjs`: Turnstile, request validation and mocked Resend.
`scripts/browser-smoke.mjs`: real Chromium tests for visual chapter
rendering, interactive poster switching, keyboard navigation, 1440/390/320px
widths, links, focus, reduced-motion and screenshot artifacts.

The site must work as a regular accessible page even if WebGL is disabled.
