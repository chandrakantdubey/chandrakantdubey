import { useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { profile } from "../portfolio";
import { ArrowIcon } from "./icons";

type FormState = { name: string; email: string; subject: string; message: string; website: string };

export function ContactForm() {
  const reduceMotion = useReducedMotion();
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "", website: "" });
  const fieldClass = "min-h-12 w-full rounded-md border border-[var(--line-strong)] bg-[var(--page)] px-3.5 py-3 text-[15px] text-[var(--ink)] outline-none transition placeholder:text-[var(--dim)] hover:border-[var(--accent-line)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]";
  const labelClass = "flex min-w-0 flex-col gap-2 text-[13px] font-medium text-[var(--muted)]";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatus(null);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
          website: form.website,
        }),
      });
      const result = await response.json().catch(() => null) as { success?: boolean } | null;
      if (!response.ok || result?.success !== true) throw new Error("The message could not be sent.");
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
      setStatus({ type: "success", message: "Message sent. Thanks for getting in touch." });
    } catch {
      setStatus({ type: "error", message: "Message not sent. Please use the direct email link." });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <motion.form className="flex min-w-0 flex-col gap-4 border-t border-[var(--line)] bg-[var(--panel-raised)]/55 p-5 backdrop-blur-xl sm:p-8 md:border-l md:border-t-0 lg:p-9" onSubmit={handleSubmit} aria-label="Send Chandrakant a message" aria-busy={isSending} initial={reduceMotion ? false : { opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: reduceMotion ? 0 : .35, delay: reduceMotion ? 0 : .04 }}>
      <div className="border-b border-[var(--line)] pb-3">
        <h3 className="font-[family-name:var(--font-mono)] text-[15px] text-[var(--ink)]"><span className="text-[var(--accent)]">$</span> send_message</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}><span>Name</span><input className={fieldClass} autoComplete="name" name="name" placeholder="Your name" minLength={2} maxLength={100} required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className={labelClass}><span>Email</span><input className={fieldClass} autoComplete="email" name="email" type="email" placeholder="you@example.com" maxLength={254} required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
      </div>
      <label className={labelClass}><span>Subject <span className="font-normal text-[var(--dim)]">(optional)</span></span><input className={fieldClass} name="subject" placeholder="What is this about?" maxLength={180} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} /></label>
      <label className={labelClass}><span>Message</span><textarea className={fieldClass + " min-h-[132px] resize-y leading-relaxed"} name="message" rows={4} placeholder="Share a few details about the role, project, or idea." minLength={10} maxLength={5000} required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></label>

      <div className="sr-only" aria-hidden="true"><label>Leave this field empty<input autoComplete="off" name="website" tabIndex={-1} value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></label></div>

      <AnimatePresence mode="wait">
        {status && <motion.div key={status.type} className="text-[14px] leading-relaxed" role="status" aria-live="polite" initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -4 }} transition={{ duration: .18 }}>
          <p className={"m-0 " + (status.type === "success" ? "text-[var(--accent)]" : "text-[var(--muted)]")}>{status.message} {status.type === "error" && <a className="font-semibold text-[var(--accent)] underline underline-offset-4" href={"mailto:" + profile.email}>{profile.email}</a>}</p>
        </motion.div>}
      </AnimatePresence>

      <motion.button className="inline-flex min-h-12 w-full items-center justify-center gap-3 self-start rounded-md bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--accent-ink)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)] disabled:cursor-wait disabled:opacity-60 sm:w-auto" type="submit" disabled={isSending} whileHover={reduceMotion || isSending ? undefined : { y: -2 }} whileTap={reduceMotion || isSending ? undefined : { scale: .98 }}>
        {isSending ? "Sending…" : "Send message"}
        <AnimatePresence mode="wait" initial={false}>{isSending ? <motion.span key="sending" className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current" animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: .8, repeat: Infinity, ease: "linear" }} aria-label="Sending" /> : <motion.span key="send" className="inline-grid" initial={reduceMotion ? false : { opacity: .5 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} whileHover={reduceMotion ? undefined : { x: 3 }} aria-hidden="true"><ArrowIcon /></motion.span>}</AnimatePresence>
      </motion.button>
    </motion.form>
  );
}
