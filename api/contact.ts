/** Public contact endpoint. Only RESEND_API_KEY is required at runtime. */
export type ContactPayload = {
  name: string;
  email: string;
  message: string;
  website?: string;
  requestId: string;
};

const CONTACT_EMAIL = "919chandrakant@gmail.com"; // Never controlled by the request.
const CONTACT_FROM = "Chandrakant Dubey <onboarding@resend.dev>"; // Resend's test sender: recipient must be your Resend account email.

// Best-effort per-instance abuse protection (not a substitute for distributed rate limiting/WAF).
const WINDOW_MS = 15 * 60_000;
const MAX_SUBMISSIONS = 4;
const MAX_BUCKETS = 1024;
const submissionBuckets = new Map<string, { expires: number; ids: Set<string> }>();

function allowSubmission(request: Request, requestId: string): boolean {
  // Vercel provides x-vercel-forwarded-for at its trusted edge; do not use user-supplied x-forwarded-for.
  const ip = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) || "unattributed";
  const now = Date.now();
  let bucket = submissionBuckets.get(ip);
  if (!bucket || bucket.expires <= now) {
    for (const [key, value] of submissionBuckets) {
      if (value.expires <= now) submissionBuckets.delete(key);
    }
    if (submissionBuckets.size >= MAX_BUCKETS) {
      const oldest = submissionBuckets.keys().next().value;
      if (oldest) submissionBuckets.delete(oldest);
    }
    bucket = { expires: now + WINDOW_MS, ids: new Set() };
    submissionBuckets.set(ip, bucket);
  }
  // Retrying the same Resend idempotency key does not consume another slot.
  if (bucket.ids.has(requestId)) return true;
  if (bucket.ids.size >= MAX_SUBMISSIONS) return false;
  bucket.ids.add(requestId);
  return true;
}
const RESPONSE_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: RESPONSE_HEADERS });
}

export function contactConfigured(env = process.env): boolean {
  return typeof env.RESEND_API_KEY === "string" && env.RESEND_API_KEY.trim().length > 0;
}

export function validateContactPayload(value: unknown): { ok: true; value: ContactPayload } | { ok: false; error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "Invalid request." };
  const data = value as Record<string, unknown>;
  for (const key of ["name", "email", "message", "requestId"]) {
    if (typeof data[key] !== "string") return { ok: false, error: "Please complete all fields." };
  }
  const name = (data.name as string).trim();
  const email = (data.email as string).trim();
  const message = (data.message as string).trim();
  const website = typeof data.website === "string" ? data.website.trim() : "";
  const requestId = data.requestId as string;
  if (name.length < 2 || name.length > 100 || /[\r\n]/.test(name)) return { ok: false, error: "Please enter a valid name." };
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || /[\r\n]/.test(email)) return { ok: false, error: "Please enter a valid email." };
  if (message.length < 10 || message.length > 3000) return { ok: false, error: "The message must contain 10–3000 characters." };
  if (website.length > 500) return { ok: false, error: "Invalid request." };
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) return { ok: false, error: "Invalid request identifier." };
  return { ok: true, value: { name, email, message, website, requestId } };
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
  const { name, email, message, website, requestId } = parsed.value;

  // Honeypot is a friction layer, not the security boundary.
  if (website) return json({ sent: true });

  // A real multi-region rate limit needs edge/WAF or a shared datastore; this bounds bursts per instance.
  if (!allowSubmission(request, requestId)) return json({ error: "Too many messages. Please use the email link or try later." }, 429);

  try {
    const outgoing = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
        "Idempotency-Key": requestId,
      },
      body: JSON.stringify({
        from: CONTACT_FROM,
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
    const receipt = await outgoing.json() as { id?: unknown };
    if (typeof receipt.id !== "string" || !receipt.id) {
      return json({ error: "Email provider did not confirm receipt. Please use the email link." }, 502);
    }
    // Resend accepted the message. This does not claim inbox delivery.
    return json({ sent: true });
  } catch {
    return json({ error: "Email delivery is currently unavailable. Please use the email link." }, 502);
  }
}
