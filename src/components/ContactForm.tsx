import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { profile } from "../portfolio";
import { ArrowIcon } from "./icons";

export function ContactForm() {
  const reduceMotion = useReducedMotion();
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const fieldClass = "min-h-12 w-full rounded-md border border-[var(--line-strong)] bg-[var(--page)] px-3.5 py-3 text-[15px] text-[var(--ink)] outline-none transition placeholder:text-[var(--dim)] hover:border-[var(--accent-line)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]";
  const labelClass = "flex min-w-0 flex-col gap-2 text-[13px] font-medium text-[var(--muted)]";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatus(null);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ownerEmail: profile.email, ownerName: profile.name }),
      });
      if (!response.ok) throw new Error("The message could not be sent.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setStatus({ type: "success", message: "Thanks. Your message has been sent." });
    } catch {
      setStatus({ type: "error", message: "Your message could not be sent. Please email me directly." });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <motion.form className="flex flex-col gap-4 border-t border-[var(--line)] p-5 sm:p-8 md:border-l md:border-t-0 lg:p-10" onSubmit={handleSubmit} aria-label="Send Chandrakant a message" initial={reduceMotion ? false : { opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .38, delay: .05 }}>
      <div className="border-b border-[var(--line)] pb-4">
        <h3 className="text-[18px] font-semibold text-[var(--ink)]">Send a message</h3>
        <p className="mt-1 text-[13px] leading-[1.55] text-[var(--muted)]">I’ll reply as soon as I can.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}><span>Name</span><input className={fieldClass} autoComplete="name" name="name" placeholder="Your name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className={labelClass}><span>Email</span><input className={fieldClass} autoComplete="email" name="email" type="email" placeholder="you@example.com" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
      </div>
      <label className={labelClass}><span>Subject <span className="font-normal text-[var(--dim)]">(optional)</span></span><input className={fieldClass} name="subject" placeholder="What is this about?" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} /></label>
      <label className={labelClass}><span>Message</span><textarea className={fieldClass + " min-h-[132px] resize-y leading-relaxed"} name="message" rows={4} placeholder="Share a few details about the role, project, or idea." required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label>
      <AnimatePresence mode="wait">
        {status && <motion.p key={status.type} className={"m-0 text-[13px] leading-relaxed " + (status.type === "success" ? "text-[var(--accent)]" : "text-[var(--art-highlight)]")} role="status" initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -4 }} transition={{ duration: .18 }}>{status.message}</motion.p>}
      </AnimatePresence>
      <motion.button className="inline-flex min-h-12 w-full items-center justify-center gap-3 self-start rounded-md bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--accent-ink)] transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60 sm:w-auto" type="submit" disabled={isSending} whileHover={reduceMotion || isSending ? undefined : { y: -2 }} whileTap={reduceMotion || isSending ? undefined : { scale: .98 }}>
        {isSending ? "Sending…" : "Send message"}
        <AnimatePresence mode="wait" initial={false}>{isSending ? <motion.span key="sending" className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current" animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: .8, repeat: Infinity, ease: "linear" }} /> : <motion.span key="send" className="inline-grid" initial={reduceMotion ? false : { opacity: .5 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} whileHover={reduceMotion ? undefined : { x: 3 }}><ArrowIcon /></motion.span>}</AnimatePresence>
      </motion.button>
    </motion.form>
  );
}
