# Chromatic Exhibition · Creative Engineering Portfolio

A portfolio designed as a small interactive digital exhibition, rather than a
metrics dashboard, particle demo with debug controls, or ordinary grid of cards.

## Art direction

- **Chapter 00**: cobalt/ultraviolet hero with oversized asymmetric name
  typography, acid-yellow accents and a directly manipulable chrome object.
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

## WebGL architecture

`src/exhibition/ChromaticSculpture.tsx` creates an animated WebGL1 scene.
`src/exhibition/foilGeometry.ts` creates a closed, deterministic ribbon
whose centerline follows a parametric knot curve and whose cross sections
twist continuously. The pure geometry is unit tested for finite coordinates,
unit normals, bounded vertex/index counts, closed seams and determinism.

The fragment shader is a self-contained chrome/iridescent material with soft
environment bands, Fresnel edges and several simulated studio highlights.
There are **no remote models, textures, 3D frameworks or GPU telemetry**.
The fallback is a hand-styled CSS sculpture if WebGL is unavailable.

- Frame loop: `requestAnimationFrame`, stopped when tab hidden or canvas
  outside viewport.
- Quality: device pixel ratio capped at 1.7 on desktop, 1.35 on mobile.
- Device handling: drags use pointer capture; tap rotates; page stays
  vertically scrollable on touch.
- Accessible: meaningful canvas label and ordinary link/navigation fallbacks.
- Motion: respects `prefers-reduced-motion` with still rendering.
- Lifecycle: observers, listeners, GPU buffers, shader program and animation
  frames cleaned up on unmount.
- Error recovery: if context creation or shader compilation fails, show the
  CSS fallback; if context is lost, stop drawing and reveal the fallback.

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
