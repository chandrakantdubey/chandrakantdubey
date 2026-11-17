# Systems Lab deployment and Vercel connection

This repository is **two things at once**:
1. The GitHub profile README for @chandrakantdubey.
2. The **Vite + React** portfolio deployed to https://chandrakantdubey.vercel.app/.

The deployment source must be **chandrakantdubey/chandrakantdubey**, not portfolio-forge or landing-page-hub.

## Recommended Vercel project settings

| Setting | Value |
| --- | --- |
| Git provider | GitHub |
| Repository | chandrakantdubey/chandrakantdubey |
| Production branch | main |
| Root Directory | ./ (repository root) |
| Framework Preset | Vite |
| Install Command | npm ci |
| Build Command | npm run build |
| Output Directory | dist |
| Node.js | 22.x |
| Production domain | chandrakantdubey.vercel.app |

**Build settings** in vercel.json explicitly set the Vite build and dist output. They apply on new deployments, but the **Git repository connection, Git permissions, production branch, project ownership and domain assignment are Vercel account/project settings**: these cannot be established solely by committing this file.

## Fix an incorrect repository connection

1. Open the relevant project in the [Vercel dashboard](https://vercel.com/dashboard).
2. Open **Settings → Git** and confirm the connected repository is **chandrakantdubey/chandrakantdubey**. Reconnect the correct GitHub repository if necessary.
3. Open **Settings → Build and Deployment** (or **Build & Development Settings**, depending on the dashboard) and verify the settings above. Remove stale custom overrides unless required.
4. Confirm **Settings → Domains** contains **chandrakantdubey.vercel.app** assigned to the intended project. Reassign a domain from an old project in the Vercel dashboard if necessary.
5. Check **Settings → Git** / Production Branch is **main**.
6. Ensure PR and branch preview deployments are enabled. The redesign is developed on **feat/systems-lab-v1** and should create a separate Preview deployment; it should **not** be the Production deployment before review.

If GitHub pushes create no Vercel deployment, first verify that Vercel's GitHub integration has repository access and that deployments are not explicitly disabled for this branch. An existing unlinked project will not be automatically repaired by vercel.json.

## Contact endpoint

The redesigned website uses a direct mailto link, so launch does not depend on third-party email keys. The existing optional endpoint at /api/send-email still uses Resend. To enable it, configure these variables under **Vercel → Project → Settings → Environment Variables**:

- RESEND_API_KEY (secret)
- RESEND_FROM_EMAIL (verified sender)
- CONTACT_EMAIL (recipient)

Never commit tokens or .env files. The existing handler has process-local throttling, which is not distributed across serverless instances. If the contact form is brought back, use an edge/rate-limit service and bot-abuse mitigation before exposing it as a primary contact channel.

## Smoke-test checklist

- [ ] CI passes on the feature branch.
- [ ] Preview homepage renders in desktop/mobile view.
- [ ] All project source links resolve.
- [ ] Simulator controls update results and replay animations.
- [ ] Reduced-motion mode, keyboard navigation, and focus states work.
- [ ] /Chandrakant_Dubey.pdf and /favicon.svg return 200.
- [ ] Production domain remains mapped to main.
- [ ] After approved merge, verify the main production deployment.

### Local verification

\`\`\`bash
npm ci
npm run build
npm run dev
\`\`\`

The simulator is entirely client-side and uses synthetic capacity assumptions. Do not treat its output as production telemetry.
