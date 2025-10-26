// /api/send-email.ts
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

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

// Serverless API function
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, email, subject, message, ownerEmail, ownerName, fromName } =
      req.body ?? {};

    if (!ownerEmail || !ownerName) {
      return res.status(400).json({ error: "Missing ownerEmail or ownerName" });
    }

    const senderName = fromName || `Chandrakant Dubey Portfolio`;
    // const fromAddress = `${senderName} <${ownerEmail}>`;
    const fromAddress = `${senderName} <onboarding@resend.dev>`;

    // Notification email to owner
    const notificationHtml = renderToStaticMarkup(
      React.createElement(EmailTemplate, {
        purpose: "notification",
        name,
        email,
        subject,
        message,
        ownerName,
      })
    );

    const ownerSend = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`, // Quoted for clarity
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [ownerEmail],
        subject: `New Portfolio Message from ${name || "Someone"}`,
        html: notificationHtml,
      }),
    });

    // Confirmation email to user
    // let userSend: Promise<Response> | null = null;
    // if (email) {
    //   const confirmationHtml = renderToStaticMarkup(
    //     React.createElement(EmailTemplate, {
    //       purpose: "confirmation",
    //       name,
    //       subject,
    //       message,
    //       ownerName,
    //     })
    //   );

    //   userSend = fetch("https://api.resend.com/emails", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Authorization: `Bearer ${RESEND_API_KEY}`,
    //     },
    //     body: JSON.stringify({
    //       from: fromAddress,
    //       to: [email],
    //       subject: `Message Received | ${ownerName}`,
    //       html: confirmationHtml,
    //     }),
    //   });
    // }

    const results = await Promise.all([
      ownerSend,
      // ...(userSend ? [userSend] : []),
    ]);

    // Check if any send failed
    for (const result of results) {
      if (!result.ok) {
        const errorBody = await result.text(); // Log full error for debugging
        console.error(`Email send failed (${result.status}): ${errorBody}`);
        throw new Error(
          `Email send failed: ${result.statusText} - ${errorBody}`
        );
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error in /api/send-email:", err);
    return res
      .status(500)
      .json({ error: "Failed to send email", details: String(err) });
  }
}
