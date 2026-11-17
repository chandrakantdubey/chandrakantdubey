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

The website uses an email link (`mailto:`) and does **not** expose a public email-sending API. The old `/api/send-email` serverless handler was removed because it was unused by the redesigned site and had a process-local rate limiter that was unsuitable for a multi-instance serverless deployment.

There are **no required Resend environment variables** for this portfolio. Remove obsolete Resend keys from Vercel project settings if no other application depends on them. If a contact form is added later, implement distributed rate limiting, bot mitigation, bounded request bodies, and verified sending domains first.

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

```bash
npm ci
npm run build
npm run dev
```

The simulator is entirely client-side and uses synthetic capacity assumptions. Do not treat its output as production telemetry.
