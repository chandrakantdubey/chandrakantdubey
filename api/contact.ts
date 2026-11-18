/**
 * Public contact function. Disabled unless a verified sender and Turnstile
 * secret are configured. The secret key is never exposed in the Vite bundle.
 */
export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  website?: string;
  token: string;
  requestId: string;
};

const CONTACT_EMAIL = "919chandrakant@gmail.com";
const RESPONSE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: RESPONSE_HEADERS });
}

export function contactConfigured(env = process.env): boolean {
  return Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL && env.CONTACT_TURNSTILE_SECRET);
}

export function validateContactPayload(value: unknown): { ok: true; value: ContactPayload } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "Invalid request." };
  const data = value as Record<string, unknown>;
  for (const key of ["name", "email", "message", "token", "requestId"]) {
    if (typeof data[key] !== "string") return { ok: false, error: "Please complete all fields." };
  }
  const name = (data.name as string).trim();
  const email = (data.email as string).trim();
  const message = (data.message as string).trim();
  const website = typeof data.website === "string" ? data.website.trim() : "";
  const token = data.token as string;
  const requestId = data.requestId as string;
  if (name.length < 2 || name.length > 100 || /[\r\n]/.test(name)) return { ok: false, error: "Please enter a valid name." };
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || /[\r\n]/.test(email)) return { ok: false, error: "Please enter a valid email." };
  if (message.length < 10 || message.length > 3000) return { ok: false, error: "The message must contain 10–3000 characters." };
  if (website.length > 500) return { ok: false, error: "Invalid request." };
  if (token.length < 10 || token.length > 2048) return { ok: false, error: "Complete the security check." };
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) return { ok: false, error: "Invalid request identifier." };
  return { ok: true, value: { name, email, message, website, token, requestId } };
}

export async function GET(): Promise<Response> {
  return json({ enabled: contactConfigured() });
}

export async function POST(request: Request): Promise<Response> {
  if (!contactConfigured()) return json({ error: "Direct email delivery is not configured." }, 503);
  if (request.headers.get("origin") !== new URL(request.url).origin) return json({ error: "Origin not allowed." }, 403);
  if (!(request.headers.get("content-type") || "").startsWith("application/json")) return json({ error: "Expected JSON." }, 415);
  if (Number(request.headers.get("content-length") || 0) > 8192) return json({ error: "Request too large." }, 413);

  let raw = "";
  try {
    raw = await request.text();
    if (raw.length > 8192) return json({ error: "Request too large." }, 413);
  } catch { return json({ error: "Request could not be read." }, 400); }

  let data: unknown;
  try { data = JSON.parse(raw); } catch { return json({ error: "Invalid JSON." }, 400); }
  const parsed = validateContactPayload(data);
  if ("error" in parsed) return json({ error: parsed.error }, 400);
  const { name, email, message, website, token, requestId } = parsed.value;

  // Honeypot is a friction layer, not the security boundary.
  if (website) return json({ sent: true });

  const timeout = AbortSignal.timeout(7500);
  try {
    const challengeResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.CONTACT_TURNSTILE_SECRET,
        response: token,
        idempotency_key: requestId,
      }),
      signal: timeout,
    });
    if (!challengeResponse.ok) return json({ error: "Security verification unavailable." }, 502);
    const challenge = await challengeResponse.json() as { success?: boolean; hostname?: string };
    if (!challenge.success || (challenge.hostname && challenge.hostname !== new URL(request.url).hostname)) {
      return json({ error: "Security verification failed. Please try again." }, 403);
    }
  } catch {
    return json({ error: "Security verification unavailable." }, 502);
  }

  try {
    const outgoing = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
        "Idempotency-Key": requestId,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: [CONTACT_EMAIL],
        reply_to: email,
        subject: "Portfolio enquiry from " + name,
        text: message + "\n\nFrom: " + name + "\nReply to: " + email,
      }),
      signal: AbortSignal.timeout(8500),
    });
    if (!outgoing.ok) {
      // Avoid exposing upstream response contents or private configuration.
      return json({ error: "Email delivery failed. Please use the email link." }, 502);
    }
    return json({ sent: true });
  } catch {
    return json({ error: "Email delivery is currently unavailable. Please use the email link." }, 502);
  }
}
