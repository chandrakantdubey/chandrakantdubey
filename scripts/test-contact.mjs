import assert from "node:assert/strict";
import { GET, POST, contactConfigured, validateContactPayload } from "../api/contact.ts";

const id = "123e4567-e89b-42d3-a456-426614174000";
const url = "https://chandrakantdubey.vercel.app/api/contact";
const payload = {
  name: "A Developer",
  email: "developer@example.com",
  message: "Hello, I would like to discuss the implementation.",
  requestId: id,
  website: "",
};
const saved = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  CONTACT_TURNSTILE_SECRET: process.env.CONTACT_TURNSTILE_SECRET,
  VITE_TURNSTILE_SITE_KEY: process.env.VITE_TURNSTILE_SITE_KEY,
};
const originalFetch = globalThis.fetch;

function makeRequest(data, {
  origin = "https://chandrakantdubey.vercel.app",
  contentType = "application/json",
  ip = "198.51.100.10",
} = {}) {
  return new Request(url, {
    method: "POST",
    headers: {
      origin,
      "content-type": contentType,
      "x-vercel-forwarded-for": ip,
    },
    body: JSON.stringify(data),
  });
}
async function responseJSON(response, status) {
  assert.equal(response.status, status);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  return response.json();
}
function newId(n) {
  return "123e4567-e89b-42d3-a456-426614174" + String(n).padStart(3, "0");
}

try {
  for (const key of Object.keys(saved)) delete process.env[key];
  assert.equal(contactConfigured(), false);
  assert.deepEqual(await responseJSON(await GET(), 200), { enabled: false });
  await responseJSON(await POST(makeRequest(payload)), 503);

  process.env.RESEND_API_KEY = "re_test";
  assert.equal(contactConfigured(), true, "API key alone enables the API");
  assert.equal(contactConfigured({ RESEND_API_KEY: "  " }), false);
  assert.equal(contactConfigured({ RESEND_API_KEY: "" }), false);
  assert.equal(contactConfigured({ RESEND_API_KEY: "re_valid" }), true);
  assert.deepEqual(await responseJSON(await GET(), 200), { enabled: true });
  assert.equal(validateContactPayload(payload).ok, true);
  for (const invalid of [
    { ...payload, name: "A" },
    { ...payload, name: "Bad\nHeader" },
    { ...payload, email: "not-an-email" },
    { ...payload, message: "short" },
    { ...payload, message: "x".repeat(3200) },
    { ...payload, requestId: "invalid" },
    { ...payload, name: 7 },
    {},
  ]) assert.equal(validateContactPayload(invalid).ok, false);

  await responseJSON(await POST(makeRequest(payload, { origin: "https://evil.example" })), 403);
  await responseJSON(await POST(makeRequest(payload, { contentType: "text/plain" })), 415);
  const oversized = makeRequest({ ...payload, message: "x".repeat(9000) });
  await responseJSON(await POST(oversized), 413);

  let deliveryCount = 0;
  let lastDelivery;
  globalThis.fetch = async (input, options) => {
    assert.equal(String(input), "https://api.resend.com/emails", "no third-party captcha dependency");
    deliveryCount++;
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer re_test");
    assert.equal(options.headers["Idempotency-Key"], id);
    lastDelivery = JSON.parse(options.body);
    return Response.json({ id: "sent-test" });
  };

  assert.deepEqual(await responseJSON(await POST(makeRequest({ ...payload, website: "bot.example" })), 200), { sent: true });
  assert.equal(deliveryCount, 0, "honeypot must not call Resend");

  assert.deepEqual(await responseJSON(await POST(makeRequest(payload)), 200), { sent: true });
  assert.equal(deliveryCount, 1);
  assert.deepEqual(lastDelivery.to, ["919chandrakant@gmail.com"]);
  assert.equal(lastDelivery.from, "Chandrakant Dubey <onboarding@resend.dev>");
  assert.equal(lastDelivery.reply_to, payload.email);
  assert.match(lastDelivery.text, /A Developer/);
  assert.equal(lastDelivery.subject, "Portfolio enquiry from A Developer");

  // A repeated request ID is allowed through our local limiter; Resend de-duplicates it.
  assert.deepEqual(await responseJSON(await POST(makeRequest(payload)), 200), { sent: true });
  assert.equal(deliveryCount, 2);

  globalThis.fetch = async input => {
    assert.equal(String(input), "https://api.resend.com/emails");
    return Response.json({ error: "unverified_sender" }, { status: 403 });
  };
  const failed = await responseJSON(await POST(makeRequest(payload, { ip: "198.51.100.11" })), 502);
  assert.match(failed.error, /email delivery failed/i);

  globalThis.fetch = async input => {
    assert.equal(String(input), "https://api.resend.com/emails");
    return Response.json({});
  };
  const invalidReceipt = await responseJSON(await POST(makeRequest(payload, { ip: "198.51.100.12" })), 502);
  assert.match(invalidReceipt.error, /did not confirm receipt/i);

  globalThis.fetch = async () => Response.json({ id: "received" });
  for (let n = 1; n <= 4; n++) {
    assert.deepEqual(await responseJSON(await POST(makeRequest({ ...payload, requestId: newId(n) }, { ip: "198.51.100.13" })), 200), { sent: true });
  }
  const limited = await responseJSON(await POST(makeRequest({ ...payload, requestId: newId(5) }, { ip: "198.51.100.13" })), 429);
  assert.match(limited.error, /too many messages/i);
  assert.deepEqual(await responseJSON(await POST(makeRequest({ ...payload, requestId: newId(4) }, { ip: "198.51.100.13" })), 200), { sent: true });

  console.log("Contact API tests: single-key setup, validation, origin, honeypot, Resend receipts, idempotency and abuse limit — PASS");
} finally {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}
