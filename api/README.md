# Portfolio contact API

`POST /api/contact` sends visitor messages to the **fixed portfolio inbox** through Resend. The Vercel Function reads only one required environment variable: `RESEND_API_KEY`. This key must remain server-side and must have permission to send email.

## Sender identity

The function currently uses `Chandrakant Dubey <onboarding@resend.dev>` as the sender. This **Resend testing address** can only deliver to the email associated with the Resend account. The fixed destination is defined in `api/contact.ts`; if that inbox differs from the Resend account email, Resend may reject delivery.

To go beyond the test sender, verify a domain in Resend and update the `CONTACT_FROM` constant in `api/contact.ts` to an address at that domain. **No additional environment variable is required.** You cannot use an arbitrary Gmail address as the Resend From address without sender-domain authorization.

The form passes the visitor's address as `reply_to` so you can answer directly. The API reports success only after Resend returns an accepted-message ID. Acceptance is **not** a guarantee of inbox delivery.

## Safeguards and operating notes

- The API validates request fields and maximum body length, rejects cross-origin submissions, uses a hidden honeypot, and permits at most four distinct request IDs per 15-minute window **per warm function instance and client IP**. Idempotent retries reuse the same request ID.
- The in-memory limit is **best effort only**, not distributed across Vercel function instances or regions. For strong abuse protection, add an edge/WAF limit or shared rate-limit store; a Turnstile challenge would require separate site and server keys.
- All user content is sent as plain text. The recipient and sender cannot be overridden by the request body.
- `GET /api/contact` returns `{"enabled":true}` when the API key is configured; it does **not** validate account permissions, sender verification, or delivery.
- When the backend is unavailable, the frontend offers a `mailto:` fallback. If Resend rejects a request, the form shows an error and also offers that fallback.

Run `npm test` and `npm run typecheck:api` before deployment. Do not put the Resend key into any `VITE_` environment variable or frontend bundle.
