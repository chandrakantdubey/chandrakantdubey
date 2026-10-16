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
    <section className={PAGE_CONTAINER + " scroll-mt-28 py-16 sm:py-20"} id="contact">
      <motion.div className="grid overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)] md:grid-cols-2" initial={reduceMotion ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .08 }} transition={{ duration: .42 }}>
        <div className="flex flex-col p-5 sm:p-8 lg:p-10">
          <p className="m-0 text-[13px] font-semibold text-[var(--accent)]">Contact</p>
          <h2 className="mt-3 max-w-[440px] text-[clamp(34px,4.5vw,48px)] font-semibold leading-[1.08] tracking-[-.045em] text-[var(--ink)]">Let’s talk about a role or project.</h2>
          <p className="mt-4 max-w-[420px] text-[15px] leading-[1.7] text-[var(--muted)]">I’m open to full-stack engineering roles and product collaborations. Send a note or email me directly.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--line-strong)] px-3.5 text-[14px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]" href={"mailto:" + profile.email}>{profile.email}<ExternalArrow /></a>
            <motion.button className="inline-flex min-h-10 items-center rounded-md px-2 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--accent)]" type="button" onClick={copyEmail} aria-live="polite" whileHover={reduceMotion ? undefined : { y: -1 }}>
              <AnimatePresence mode="wait" initial={false}><motion.span key={copyState} initial={reduceMotion ? false : { opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -3 }} transition={{ duration: .16 }}>{copyState === "copied" ? "Copied" : copyState === "unavailable" ? "Select email to copy" : "Copy email"}</motion.span></AnimatePresence>
            </motion.button>
          </div>
          <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-8">
            <a className="inline-flex min-h-8 items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--accent)]" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ExternalArrow /></a>
            <a className="inline-flex min-h-8 items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] hover:text-[var(--accent)]" href={profile.github} target="_blank" rel="noreferrer">GitHub <ExternalArrow /></a>
            <a className="inline-flex min-h-8 items-center text-[13px] font-medium text-[var(--muted)] hover:text-[var(--accent)]" href={profile.resume} download>Download résumé</a>
          </div>
        </div>
        <ContactForm />
      </motion.div>
    </section>
  );
}
