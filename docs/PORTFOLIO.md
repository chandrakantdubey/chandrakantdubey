# Interactive portfolio

A React 19 / TypeScript / Vite portfolio at https://chandrakantdubey.vercel.app/.

The main experience is an interactive project showcase. There is no fake dashboard,
skill ranking or simulated enterprise observability.

## Visitor experience

- **Projects:** Select StyleScape, Pokédex RPG, FitStream or MH15 to play a short demo.
- **StyleScape:** Generate procedural SVG graphics using shape and palette controls.
- **Pokédex RPG:** A small original turn-based encounter with deterministic attack / guard rules.
- **FitStream:** An illustrative route animation, clearly labeled as simulated — not a live GPS tracker.
- **MH15:** Draw directly on an ephemeral vector sketch pad with touch, pen or mouse.
- **Experience:** Select employers to view exact roles and dates from the original portfolio record.
- **Skills:** Browse technologies by category without invented mastery percentages.
- **Contact:** Validated form that opens the visitor's email application with a prefilled message, plus a direct email link and copy control.

The project demos are original, **self-contained miniatures** illustrating the kind of interaction the real projects offer.
They do not connect to private or production services. The project cards link to the real repositories.

## Key files

| Path | Responsibility |
| --- | --- |
| `src/arcade/PortfolioArcade.tsx` | Navigation, hero, project selector, experience, skills, contact |
| `src/arcade/Demos.tsx` | All four project previews |
| `src/arcade/data.ts` | Canonical public project URLs and experience/skills content |
| `src/arcade/mini-games.ts` | Deterministic game and route state transitions |
| `src/arcade/arcade.css` | Responsive visual system, 3D reactor, micro-interactions |
| `scripts/test-arcade.mjs` | Data and game engine tests |
| `docs/DEPLOYMENT.md` | Deployment and environment details |

## Develop and validate

```sh
npm ci
npm run dev
npm run lint
npm run build
npm test
npm audit --omit=dev --audit-level=high
```

## Performance and accessibility

The reactor, procedural patterns, game, sketchpad and route preview are all local —
no expensive 3D runtime, font files or remote image downloads are needed.
The visual system uses CSS transforms, SVG and gradients. Animations turn off under
`prefers-reduced-motion: reduce`.

Work, employers and skills are keyboard accessible. Project and employer selectors
use tab interfaces with arrow-key navigation. Native form validation provides required-field
checks; the site includes a skip link and focus-visible styles. The drawing canvas is
pointer-driven and has a text label and clear action.

## Contact semantics

The contact form intentionally uses `mailto:`, not a server-side form handler.
This works without a sending credential or serverless abuse surface but requires an
email client configured on the visitor's device. It does **not** guarantee message
delivery: the user must send the composed message in their email client.

If direct form submission becomes a requirement, add a server-side integration with
a verified Resend sending domain, bot challenge and distributed rate limiting.
Do not expose the `RESEND_API_KEY` in browser code.
