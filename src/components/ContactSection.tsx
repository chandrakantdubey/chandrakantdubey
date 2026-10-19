import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { profile } from "../portfolio";
import { ContactForm } from "./ContactForm";
import { ExternalArrow } from "./icons";
import { PAGE_CONTAINER } from "./layout";

export function ContactSection() {
  const reduceMotion = useReducedMotion();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "unavailable">("idle");

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("unavailable");
      window.setTimeout(() => setCopyState("idle"), 2200);
    }
  }

  return (
    <section className={PAGE_CONTAINER + " scroll-mt-32 border-t border-[var(--line)] py-12 sm:py-16"} id="contact">
      <motion.div className="grid min-w-0 overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] shadow-[var(--shadow-glass)] backdrop-blur-2xl md:grid-cols-2" initial={reduceMotion ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .08 }} transition={{ duration: reduceMotion ? 0 : .36 }}>
        <div className="flex flex-col bg-[radial-gradient(ellipse_at_top_left,var(--accent-soft),transparent_62%)] p-5 sm:p-8 lg:p-10">
          <p className="m-0 font-[family-name:var(--font-mono)] text-[13px] text-[var(--accent)]">05 / contact</p>
          <h2 className="mt-3 max-w-[440px] text-[clamp(34px,4.5vw,48px)] font-semibold leading-[1.08] tracking-[-.045em] text-[var(--ink)]">Have a good project in mind?</h2>
          <p className="mt-4 max-w-[440px] text-[16px] leading-[1.65] text-[var(--muted)]">I’m interested in backend-heavy product engineering, practical AI applications, and thoughtful collaboration. Tell me what you’re building and where you need help.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--line-strong)] px-3.5 text-[14px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]" href={"mailto:" + profile.email}>{profile.email}<ExternalArrow /></a>
            <motion.button className="inline-flex min-h-11 items-center rounded-md px-2 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" type="button" onClick={copyEmail} whileHover={reduceMotion ? undefined : { y: -1 }}>
              <AnimatePresence mode="wait" initial={false}><motion.span key={copyState} aria-live="polite" initial={reduceMotion ? false : { opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -3 }} transition={{ duration: .16 }}>{copyState === "copied" ? "Copied" : copyState === "unavailable" ? "Copy unavailable" : "Copy email"}</motion.span></AnimatePresence>
            </motion.button>
          </div>
          <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-8">
            <a className="inline-flex min-h-11 items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ExternalArrow /></a>
            <a className="inline-flex min-h-11 items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" href={profile.github} target="_blank" rel="noreferrer">GitHub <ExternalArrow /></a>
            <a className="inline-flex min-h-11 items-center text-[13px] font-medium text-[var(--muted)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" href={profile.resume} download>Download résumé</a>
          </div>
        </div>
        <ContactForm />
      </motion.div>
    </section>
  );
}
