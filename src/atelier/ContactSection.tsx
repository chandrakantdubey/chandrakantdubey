import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { links } from "./content";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};
type TurnstileWindow = Window & { turnstile?: TurnstileApi };

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [directEnabled, setDirectEnabled] = useState(false);
  const [sending, setSending] = useState(false);
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [verifierReady, setVerifierReady] = useState(false);
  const widgetId = useRef<string | null>(null);
  const pendingRequest = useRef<{ fingerprint: string; id: string } | null>(null);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useEffect(() => {
    if (!siteKey) return;
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
  }, [siteKey]);

  useEffect(() => {
    if (!directEnabled || !siteKey) return;
    let disposed = false;
    const win = window as TurnstileWindow;
    const mount = () => {
      if (disposed || widgetId.current || !win.turnstile) return;
      const root = document.getElementById("contact-turnstile");
      if (!root) return;
      widgetId.current = win.turnstile.render(root, {
        sitekey: siteKey,
        callback: (token: string) => { if (!disposed) setTurnstileToken(token); },
        "expired-callback": () => { if (!disposed) setTurnstileToken(""); },
        "error-callback": () => {
          if (!disposed) {
            setTurnstileToken("");
            setNotice("Security verification failed to load. You can use the email link instead.");
          }
        },
      });
      setVerifierReady(true);
    };
    if (win.turnstile) {
      mount();
      return () => {
        disposed = true;
        if (widgetId.current) win.turnstile?.remove(widgetId.current);
        widgetId.current = null;
      };
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.addEventListener("load", mount);
    script.addEventListener("error", () => {
      if (!disposed) setNotice("Security verification is unavailable. Please use the email link.");
    });
    document.head.appendChild(script);
    return () => {
      disposed = true;
      if (widgetId.current) win.turnstile?.remove(widgetId.current);
      widgetId.current = null;
      script.remove();
    };
  }, [directEnabled, siteKey]);

  const resetVerification = () => {
    setTurnstileToken("");
    const api = (window as TurnstileWindow).turnstile;
    if (api && widgetId.current) api.reset(widgetId.current);
  };

  const composeMail = () => {
    const subject = encodeURIComponent("Portfolio enquiry from " + name.trim());
    const body = encodeURIComponent(message.trim() + "\n\nFrom: " + name.trim() + "\nReply to: " + email.trim());
    setNotice("Your email application should open. Send the draft there to complete contact.");
    window.location.assign("mailto:" + links.email + "?subject=" + subject + "&body=" + body);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    if (!directEnabled || !siteKey) { composeMail(); return; }
    if (!turnstileToken) {
      setNotice("Complete the security check to send your message directly.");
      return;
    }
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
          token: turnstileToken,
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
      resetVerification(); // Tokens are single-use, including after failed attempts.
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
    <div className="section-heading contact-heading"><div><span className="eyebrow">04 / CONTACT</span><h2 id="contact-title">Get in touch<span className="period-accent">.</span></h2></div><span className="heading-aside">DIRECT LINE / OPEN</span></div>
    <div className="contact-layout">
      <div className="contact-left">
        <p>For engineering work, projects and collaborations.</p>
        <div className="contact-address"><span>EMAIL</span><div><a href={"mailto:" + links.email}>{links.email}</a><button type="button" onClick={copyEmail} aria-label="Copy email">{copied ? <Check size={18} /> : <Copy size={18} />}</button></div></div>
        <div className="social-links"><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={17}/></a><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={17}/></a><a href={links.resume} download>Résumé <ArrowUpRight size={17}/></a></div>
      </div>
      <form className="contact-form" onSubmit={onSubmit}>
        <div className="form-top"><span>{directEnabled ? "SEND MESSAGE" : "COMPOSE MESSAGE"}</span><Mail size={18}/></div>
        <div className="form-row"><label htmlFor="contact-name">Name</label><input id="contact-name" type="text" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="Your name"/></div>
        <div className="form-row"><label htmlFor="contact-email">Email</label><input id="contact-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"/></div>
        <div className="form-row"><label htmlFor="contact-message">Message</label><textarea id="contact-message" rows={4} minLength={10} maxLength={3000} required value={message} onChange={e => setMessage(e.target.value)} placeholder="What are you building?"/></div>
        <div className="contact-honeypot" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" type="text" autoComplete="off" tabIndex={-1} value={website} onChange={e => setWebsite(e.target.value)}/></div>
        {directEnabled && siteKey && <div className="contact-verification"><div id="contact-turnstile" aria-label="Human verification"/></div>}
        <button type="submit" disabled={sending || (directEnabled && !turnstileToken)} className="submit-mail">{sending ? "Sending…" : directEnabled ? (verifierReady ? "Send message" : "Loading verification…") : "Compose email"} <ArrowUpRight size={18}/></button>
        {directEnabled && <button type="button" className="compose-fallback" onClick={composeMail}>Or open a draft in your email app <ArrowUpRight size={15}/></button>}
        <p className="form-disclaimer">{directEnabled ? "Your message is submitted after security verification." : "Opens your email application; nothing is uploaded from this form."}</p>
        {notice && <p role="status" aria-live="polite" className="contact-status">{notice}</p>}
      </form>
    </div>
  </section>;
}
