import { useState } from "react";
import { ExternalArrow } from "./icons";
import { ContactForm } from "./ContactForm";
import { profile } from "../portfolio";

export function ContactView() {
  const [copyStatus, setCopyStatus] = useState("");

  async function copyEmail() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(profile.email);
      setCopyStatus("Email address copied.");
    } catch {
      setCopyStatus("Could not copy here. Use the email link instead.");
    }
  }

  return <div className="mx-auto max-w-[1500px] px-4 pb-14 pt-8 sm:px-7 sm:pt-10 lg:px-10">
    <div className="mb-5 flex items-center gap-2 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.15em] text-[var(--dim)]"><span className="text-[var(--accent)]">/</span> workspace <span className="text-[var(--line-strong)]">/</span> contact</div>
    <header className="mb-7 border-b border-[var(--line)] pb-6 sm:mb-8 sm:pb-7"><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.16em] text-[var(--accent)]">Open channel</p><h1 id="view-heading" tabIndex={-1} className="mb-0 mt-2 text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-tight tracking-[-.045em] text-[var(--ink)] outline-none">Let’s talk.</h1><p className="mb-0 mt-2 max-w-3xl text-[16px] leading-relaxed text-[var(--muted)] sm:text-[17px]">Have a role, a product problem, or an interesting idea? Send a note and I’ll get back to you.</p></header>
    <section className="grid overflow-hidden rounded-[24px] border border-[var(--line-strong)] bg-[linear-gradient(145deg,var(--panel-solid),var(--page-elevated))] lg:grid-cols-[minmax(260px,.65fr)_minmax(0,1fr)]">
      <aside className="p-5 sm:p-8 lg:p-9"><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.14em] text-[var(--dim)]">Direct coordinates</p><div className="mt-4 flex flex-wrap items-center gap-2"><a href={`mailto:${profile.email}`} className="inline-flex min-h-11 max-w-full items-center gap-2 break-all text-[17px] font-semibold text-[var(--accent)] underline decoration-[var(--accent-line)] underline-offset-4 sm:text-[20px]">{profile.email}<ExternalArrow /></a><button type="button" onClick={copyEmail} className="inline-flex min-h-11 items-center rounded-xl border border-[var(--line-strong)] px-3 text-[13px] font-medium text-[var(--muted)] transition hover:border-[var(--accent-line)] hover:bg-[var(--panel-raised)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--focus)]">Copy email</button></div>{copyStatus && <p role="status" aria-live="polite" className="mb-0 mt-2 text-[14px] text-[var(--muted)]">{copyStatus}</p>}<div className="mt-8 space-y-3 border-t border-[var(--line)] pt-5"><a href={profile.linkedin} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-2 text-[15px] text-[var(--muted)] transition hover:bg-[var(--panel-raised)] hover:text-[var(--ink)]"><span>LinkedIn</span><ExternalArrow /></a><a href={profile.github} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-2 text-[15px] text-[var(--muted)] transition hover:bg-[var(--panel-raised)] hover:text-[var(--ink)]"><span>GitHub</span><ExternalArrow /></a></div><p className="mb-0 mt-7 border-l-2 border-[var(--accent)] pl-4 text-[14px] leading-relaxed text-[var(--muted)]">Based in {profile.location}. Available for conversations about full-stack engineering, backend systems, and product work.</p></aside>
      <ContactForm />
    </section>
  </div>;
}
