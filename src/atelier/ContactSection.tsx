import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { links } from "./content";
import { contactMailto } from "./contactMailto";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [directEnabled, setDirectEnabled] = useState(false);
  const [sending, setSending] = useState(false);
  const [website, setWebsite] = useState("");
  const pendingRequest = useRef<{ fingerprint: string; id: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/contact", {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) return;
        const data = await response.json() as { enabled?: boolean };
        if (!controller.signal.aborted) setDirectEnabled(data.enabled === true);
      } catch {
        // Development without Vercel Functions still has the email-app fallback.
      }
    })();
    return () => controller.abort();
  }, []);

  const composeMail = () => {
    setNotice("Your email application should open. Send the draft there to complete contact.");
    window.location.assign(contactMailto(links.email, { name, email, message }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    if (!directEnabled) { composeMail(); return; }
    const fingerprint = JSON.stringify([name.trim(), email.trim(), message.trim()]);
    if (pendingRequest.current?.fingerprint !== fingerprint) {
      pendingRequest.current = { fingerprint, id: crypto.randomUUID() };
    }
    setSending(true);
    setNotice("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          website,
          requestId: pendingRequest.current.id,
        }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json() as { sent?: boolean; error?: string };
      if (response.ok && result.sent) {
        pendingRequest.current = null;
        setNotice("Message accepted for delivery. Thanks for getting in touch!");
        setName("");
        setEmail("");
        setMessage("");
        setWebsite("");
      } else {
        setNotice(result.error ?? "Unable to send. Please use the email link or email-app fallback.");
      }
    } catch {
      setNotice("Unable to confirm delivery. Please retry or use the email link.");
    } finally {
      setSending(false);
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(links.email);
      setCopied(true);
      setNotice("Email address copied.");
    } catch {
      setNotice("Select and copy the email address shown here.");
    }
  };

  return <section id="contact" className="contact-section" aria-labelledby="contact-title">
    <div className="section-heading contact-heading"><div><h2 id="contact-title">SAY HI<span className="period-accent">.</span></h2></div></div>
    <div className="contact-layout">
      <div className="contact-left">
        <p>Got a tricky problem? Excellent. I collect those professionally.</p>
        <div className="contact-address"><span>AN ACTUAL HUMAN INBOX</span><div><a href={"mailto:" + links.email}>{links.email}</a><button type="button" onClick={copyEmail} aria-label="Copy email">{copied ? <Check size={18} /> : <Copy size={18} />}</button></div></div>
        <div className="social-links"><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={17}/></a><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={17}/></a><a href={links.resume} download>Résumé <ArrowUpRight size={17}/></a></div>
      </div>
      <form className="contact-form" onSubmit={onSubmit}>
        <div className="form-top"><span>NOW YOU HAVE MY ATTENTION</span><Mail size={18}/></div>
        <div className="form-row"><label htmlFor="contact-name">Name</label><input id="contact-name" type="text" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="Your name"/></div>
        <div className="form-row"><label htmlFor="contact-email">Email</label><input id="contact-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"/></div>
        <div className="form-row"><label htmlFor="contact-message">Message</label><textarea id="contact-message" rows={4} minLength={10} maxLength={3000} required value={message} onChange={e => setMessage(e.target.value)} placeholder="What broke, what ships next, or just hello…"/></div>
        <div className="contact-honeypot" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" type="text" autoComplete="off" tabIndex={-1} value={website} onChange={e => setWebsite(e.target.value)}/></div>
        <button type="submit" disabled={sending} className="submit-mail">{sending ? "Sending…" : directEnabled ? "Send message" : "Compose email"} <ArrowUpRight size={18}/></button>
        {directEnabled && <button type="button" className="compose-fallback" onClick={composeMail}>Or open a draft in your email app <ArrowUpRight size={15}/></button>}
        <p className="form-disclaimer">{directEnabled ? "Sent via Resend. Inbox delivery remains the email gods’ department." : "Opens your email application; nothing is uploaded from this form."}</p>
        {notice && <p role="status" aria-live="polite" className="contact-status">{notice}</p>}
      </form>
    </div>
  </section>;
}
