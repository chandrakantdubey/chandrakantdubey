// /api/send-email.ts
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { profile } from "../src/portfolio";

// Email template component (fully Node-compatible)
interface EmailTemplateProps {
  purpose: "notification" | "confirmation";
  name: string;
  email?: string;
  subject?: string;
  message?: string;
  ownerName: string;
}

const EmailTemplate = ({
  purpose,
  name,
  email,
  subject,
  message,
  ownerName,
}: EmailTemplateProps) => {
  const containerStyle: React.CSSProperties = {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
    backgroundColor: "#050a05",
    color: "#e5e7eb",
    padding: "40px 20px",
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#000000",
    border: "1px solid #22c55e",
    borderRadius: "8px",
    overflow: "hidden",
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    padding: "20px",
    textAlign: "center",
    borderBottom: "1px solid #22c55e",
  };

  const headingStyle: React.CSSProperties = {
    color: "#22c55e",
    fontSize: "24px",
    margin: "0",
  };

  const contentStyle: React.CSSProperties = {
    padding: "30px",
  };

  const paragraphStyle: React.CSSProperties = {
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0 0 16px",
  };

  const labelStyle: React.CSSProperties = {
    color: "#22c55e",
    fontWeight: "bold",
  };

  const messageBoxStyle: React.CSSProperties = {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: "15px",
    borderRadius: "4px",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
  };

  const footerStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "20px",
    fontSize: "12px",
    color: "#9ca3af",
  };

  if (purpose === "notification") {
    return React.createElement(
      "html",
      { lang: "en" },
      React.createElement(
        "body",
        null,
        React.createElement(
          "div",
          { style: containerStyle },
          React.createElement(
            "div",
            { style: cardStyle },
            React.createElement(
              "div",
              { style: headerStyle },
              React.createElement(
                "h1",
                { style: headingStyle },
                "New Portfolio Message"
              )
            ),
            React.createElement(
              "div",
              { style: contentStyle },
              React.createElement(
                "p",
                { style: paragraphStyle },
                "You've received a new message from your portfolio contact form."
              ),
              React.createElement(
                "p",
                { style: paragraphStyle },
                React.createElement("span", { style: labelStyle }, "From: "),
                name
              ),
              React.createElement(
                "p",
                { style: paragraphStyle },
                React.createElement("span", { style: labelStyle }, "Email: "),
                email || "Not provided"
              ),
              React.createElement(
                "p",
                { style: paragraphStyle },
                React.createElement("span", { style: labelStyle }, "Subject: "),
                subject || "No Subject"
              ),
              React.createElement("hr", {
                style: {
                  borderColor: "rgba(34, 197, 94, 0.3)",
                  margin: "20px 0",
                },
              }),
              React.createElement(
                "p",
                { style: paragraphStyle },
                React.createElement("span", { style: labelStyle }, "Message:")
              ),
              React.createElement(
                "div",
                { style: messageBoxStyle },
                ...(message?.split("\n") || []).map((line, i) =>
                  React.createElement(
                    "p",
                    { key: i, style: { margin: 0 } },
                    line
                  )
                )
              )
            )
          ),
          React.createElement(
            "div",
            { style: footerStyle },
            React.createElement(
              "p",
              null,
              "This is an automated notification from your portfolio website."
            )
          )
        )
      )
    );
  }

  // confirmation
  return React.createElement(
    "html",
    { lang: "en" },
    React.createElement(
      "body",
      null,
      React.createElement(
        "div",
        { style: containerStyle },
        React.createElement(
          "div",
          { style: cardStyle },
          React.createElement(
            "div",
            { style: headerStyle },
            React.createElement(
              "h1",
              { style: headingStyle },
              "Message Received!"
            )
          ),
          React.createElement(
            "div",
            { style: contentStyle },
            React.createElement("p", { style: paragraphStyle }, `Hi ${name},`),
            React.createElement(
              "p",
              { style: paragraphStyle },
              "Thank you for reaching out! I've successfully received your message and will get back to you as soon as possible."
            ),
            React.createElement(
              "p",
              { style: paragraphStyle },
              "Here's a copy of the message you sent:"
            ),
            React.createElement(
              "div",
              { style: messageBoxStyle },
              React.createElement(
                "p",
                { style: { margin: "0 0 8px" } },
                React.createElement("strong", null, "Subject: "),
                subject || "No Subject"
              ),
              ...(message?.split("\n") || []).map((line, i) =>
                React.createElement("p", { key: i, style: { margin: 0 } }, line)
              )
            ),
            React.createElement(
              "p",
              { style: { ...paragraphStyle, marginTop: "16px" } },
              "Best regards,"
            ),
            React.createElement(
              "p",
              { style: { ...paragraphStyle, margin: 0 } },
              ownerName
            )
          )
        ),
        React.createElement(
          "div",
          { style: footerStyle },
          React.createElement(
            "p",
            null,
            "This is an automated confirmation. Please do not reply directly to this email."
          )
        )
      )
    )
  );
};

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 4;
const requestCounts = new Map<string, { count: number; expiresAt: number }>();

interface SendEmailRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
  body?: {
    name?: unknown;
    email?: unknown;
    subject?: unknown;
    message?: unknown;
    website?: unknown;
  };
}

interface SendEmailResponse {
  setHeader?(name: string, value: string): void;
  status(code: number): SendEmailResponse;
  json(body: unknown): void;
  end?(): void;
}

function textField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function requestKey(req: SendEmailRequest): string {
  const forwarded = req.headers?.["x-forwarded-for"] ?? req.headers?.["x-real-ip"] ?? req.socket?.remoteAddress ?? "unknown";
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return String(first).split(",")[0].trim() || "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  for (const [entryKey, entry] of requestCounts) {
    if (entry.expiresAt <= now) requestCounts.delete(entryKey);
  }
  const current = requestCounts.get(key);
  if (current && current.count >= RATE_LIMIT_MAX) return true;
  requestCounts.set(key, {
    count: (current?.count ?? 0) + 1,
    expiresAt: current?.expiresAt ?? now + RATE_LIMIT_WINDOW_MS,
  });
  return false;
}

// Vercel serverless API function. The recipient is fixed server-side so form
// visitors cannot use the Resend key to direct messages to arbitrary addresses.
export default async function handler(req: SendEmailRequest, res: SendEmailResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body ?? {};
  if (textField(body.website)) {
    res.status(204).end?.();
    return;
  }

  if (isRateLimited(requestKey(req))) {
    res.setHeader?.("Retry-After", String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)));
    return res.status(429).json({ error: "Too many messages. Please try again later." });
  }

  if (!RESEND_API_KEY) return res.status(503).json({ error: "Contact service is not configured" });

  const name = textField(body.name);
  const email = textField(body.email);
  const rawSubject = textField(body.subject);
  const subject = rawSubject.replace(/[\r\n]+/g, " ");
  const message = textField(body.message);

  if (name.length < 2 || name.length > 100) return res.status(400).json({ error: "Enter a name between 2 and 100 characters." });
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: "Enter a valid email address." });
  if (rawSubject.length > 180) return res.status(400).json({ error: "Keep the subject under 180 characters." });
  if (message.length < 10 || message.length > 5000) return res.status(400).json({ error: "Keep the message between 10 and 5000 characters." });

  try {
    const notificationHtml = renderToStaticMarkup(
      React.createElement(EmailTemplate, {
        purpose: "notification",
        name,
        email,
        subject,
        message,
        ownerName: profile.name,
      })
    );
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "Chandrakant Dubey Portfolio <onboarding@resend.dev>",
        to: [process.env.CONTACT_EMAIL || profile.email],
        reply_to: email,
        subject: `Portfolio message from ${name}${subject ? ` — ${subject}` : ""}`,
        html: notificationHtml,
      }),
    });

    if (!response.ok) {
      console.error("Resend contact delivery failed with status", response.status);
      return res.status(502).json({ error: "Message delivery failed" });
    }
    return res.status(200).json({ success: true });
  } catch {
    console.error("Resend contact request failed");
    return res.status(502).json({ error: "Message delivery failed" });
  }
}
