# Chandrakant Dubey · Portfolio

Backend-focused full-stack engineer in Mumbai, India. I build enterprise applications, APIs, and ML inference workflows, with experience across product UI and cloud delivery.

[Portfolio](https://chandrakantdubey.vercel.app/) · [Résumé](https://chandrakantdubey.vercel.app/Chandrakant_Dubey.pdf) · [GitHub](https://github.com/chandrakantdubey) · [LinkedIn](https://www.linkedin.com/in/chandra-kant-dubey/)

## Selected work

- **Performance review management** — React, Node.js, and Oracle Database application for IDBI Bank, replacing spreadsheet-based workflows. Internal project; no source link.
- **Customer risk assessment** — Enterprise ML inference platform using Python, FastAPI, React, and Oracle Database. Internal project; no source link.
- **Kintree** — Family-tree visualizations and real-time collaboration using React, Redux, Node.js, Express, and Socket.IO. [Website](https://kintree.com/)
- **Pokédex RPG API** — FastAPI and PostgreSQL backend with SQLAlchemy, JWT authentication, role-based access, and RPG domain rules. [Backend](https://github.com/chandrakantdubey/pokedex-backend) · [Mobile app](https://github.com/chandrakantdubey/pokedex)

## Independent projects

- **[StyleScape](https://github.com/chandrakantdubey/style-scape)** — Pattern editor for custom palettes and CSS, SVG, and PNG export.
- **[FitStream](https://github.com/chandrakantdubey/fitstream)** — Fitness app with workout plans, activity tracking, nutrition tools, and progress exports.
- **[MH15](https://github.com/chandrakantdubey/mh15)** — Local-first tablet notebook for handwriting, sketching, and mixed-media notes.
- **FarmPulse** *(in development)* — Time-series dashboard concept for farm sensor readings and crop conditions.
- **Blackout Protocol** *(in development)* — Cooperative grid-routing game concept.

## Experience

- **Adeptken** — Full Stack Engineer · Jan 2026–Present
- **Nutriiya** — Full Stack Engineer · Sep 2025–Dec 2025
- **Kintree Pvt. Ltd.** — Full Stack Developer · Nov 2024–Jan 2026
- **Uvation India Pvt. Ltd.** — Software Engineer (Frontend) · Aug 2023–Oct 2024

## Stack

| Area | Tools |
| --- | --- |
| Languages | Python, TypeScript, JavaScript, SQL |
| Backend & APIs | FastAPI, Node.js, Express.js, Django APIs, REST APIs, WebSockets, Socket.IO, SQLAlchemy |
| Data | PostgreSQL, Oracle Database, Redis, MongoDB, SQLite |
| Product UI | React, Next.js, Redux, React Native, React Query, SWR, Tailwind CSS |
| Cloud & delivery | Docker, AWS EC2/S3, GitHub Actions, CI/CD, Linux, Red Hat Enterprise Linux |
| Applied AI | ML inference integration, model-execution workflows, LLM application patterns, RAG fundamentals |

LLM and RAG are learning and project-focus areas; this portfolio does not claim a production RAG deployment.

## Run locally

```bash
npm install
npm run dev
npm run lint
npm run build
```

The app uses React 19, Vite, Tailwind CSS 4, and Motion. There is no Tailwind config file; theme and design tokens are set in `src/components/theme.ts`. Portfolio content lives in `src/portfolio.ts`. The contact endpoint is a Vercel serverless function in `api/send-email.ts`.

## Contact form configuration

Set these variables in the Vercel project environment:

- `RESEND_API_KEY` — server-side Resend API key. Never use a `VITE_` prefix.
- `CONTACT_EMAIL` — optional recipient override; defaults to the email in `src/portfolio.ts`.
- `RESEND_FROM_EMAIL` — optional verified sender. If unset, the API uses Resend’s onboarding sender, which is intended for testing.

The form requires the API to return `{ "success": true }` before showing a sent message. With plain `npm run dev`, Vite does not run the serverless API; use `npx vercel dev` to exercise the contact endpoint locally with the environment variables configured. If delivery fails, the form offers the direct email link.

The endpoint validates input, includes a hidden honeypot field, and applies a small in-memory per-IP rate limit. That limit is best-effort across serverless instances.

## Portfolio notes

- Four color themes: Evergreen, Paper Terminal, Void Dragon, and Glacial Cyan. Selection persists in local storage; a first visit follows the system light/dark preference.
- Motion respects `prefers-reduced-motion`.
- The dragon scale texture is limited to the hero; illustrations elsewhere are project-specific.
- The résumé download uses `public/Chandrakant_Dubey.pdf`.
