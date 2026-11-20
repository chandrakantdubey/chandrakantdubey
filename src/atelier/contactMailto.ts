/**
 * Build a mail-app fallback without adding empty metadata to the draft.
 * The sender is the visitor's mail client; "From" is not part of the body.
 */
export function contactMailto(recipient: string, fields: { name: string; email: string; message: string }): string {
  const name = fields.name.trim();
  const email = fields.email.trim();
  const message = fields.message.trim();
  const base = "mailto:" + recipient;

  // Opening the fallback without typing should produce a genuinely blank draft.
  if (!name && !email && !message) return base;

  const subject = name ? "Portfolio enquiry from " + name : "Portfolio enquiry";
  const details = [
    message,
    name ? "— " + name : "",
    email ? "Preferred reply address: " + email : "",
  ].filter(Boolean).join("\n\n");

  const params = ["subject=" + encodeURIComponent(subject)];
  if (details) params.push("body=" + encodeURIComponent(details));
  return base + "?" + params.join("&");
}
