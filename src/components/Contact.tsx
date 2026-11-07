import { useState, type FormEvent } from "react";
import confetti from "canvas-confetti";
import { profile } from "../portfolio";

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const subjectPills = [
    "Full-Time Role Opportunity",
    "Distributed Systems Consulting",
    "API & Backend Architecture",
    "Frontend & Next.js Work",
    "General Inquiry",
  ];

  async function copyEmail() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(profile.email);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch {
      // Fallback
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSending(true);
    setStatus(null);

    try {
      const res = await fetch("/api/send-email", {
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

      const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
      if (!res.ok || data?.success !== true) throw new Error("Submission failed");

      setForm({ name: "", email: "", subject: "", message: "", website: "" });
      setStatus({ type: "success", message: "Message sent! I’ll get back to your email promptly." });

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#ffffff"],
        });
      } catch {
        // Fallback
      }
    } catch {
      setStatus({
        type: "error",
        message: "Failed to send message via API. Please email directly at " + profile.email,
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="py-20 sm:py-28 border-t border-[var(--border)] relative overflow-hidden" id="contact">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Direct info */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] mb-3 w-fit">
              <span>Open for High-Impact Roles & Consulting</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
              Let’s Connect.
            </h2>
            <p className="text-base text-[var(--text-secondary)] leading-relaxed mb-8">
              Whether you have an enterprise system opening, an architectural challenge, or want to discuss applied AI and backend engineering, feel free to reach out.
            </p>

            <div className="space-y-4">
              {/* Email Card */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] flex flex-wrap items-center justify-between gap-3 shadow-sm hover:border-[var(--accent)] transition">
                <div>
                  <span className="block text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider mb-1">
                    Direct Email
                  </span>
                  <a
                    href={`mailto:${profile.email}`}
                    className="text-base sm:text-lg font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition break-all sm:break-normal"
                  >
                    {profile.email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--accent)] text-[var(--text-primary)] transition shadow-sm"
                >
                  {copied ? "Copied! ✓" : "Copy Email"}
                </button>
              </div>

              {/* Location Card */}
              <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm">
                <span className="block text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider mb-1">
                  Location & Timezone
                </span>
                <span className="text-sm sm:text-base font-semibold text-[var(--text-primary)]">
                  {profile.location} · {profile.timezone}
                </span>
              </div>

              {/* Social Links Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-blue-500 hover:text-blue-400 transition shadow-sm"
                >
                  <span>LinkedIn Profile</span>
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.62 1.62 0 1 0 0-3.24 1.62 1.62 0 0 0 0 3.24m1.4 9.74v-8.37H5.06v8.37z" />
                  </svg>
                </a>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-cyan-500 hover:text-cyan-400 transition shadow-sm"
                >
                  <span>GitHub Profile</span>
                  <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-9 shadow-lg space-y-5"
            >
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  Send a Direct Message
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Pick a topic or write your customized inquiry below.
                </p>
              </div>

              {/* Quick Subject Suggestions */}
              <div>
                <span className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
                  Topic Suggestion:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {subjectPills.map((pill) => (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setForm({ ...form, subject: pill })}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                        form.subject === pill
                          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                          : "border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:border-[var(--accent)]"
                      }`}
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Aditi Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={254}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="aditi@company.com"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  maxLength={180}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="What is this regarding?"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  minLength={10}
                  maxLength={5000}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Share details about the role, project scope, or questions..."
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition resize-y"
                />
              </div>

              {/* Bot Protection Honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="hidden"
                aria-hidden="true"
              />

              {/* Status Banner */}
              {status && (
                <div
                  className={`p-4 rounded-xl text-xs font-semibold ${
                    status.type === "success"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/10 text-red-400 border border-red-500/30"
                  }`}
                >
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-[#ffffff] hover:opacity-95 transition shadow-lg shadow-blue-500/25 disabled:opacity-60"
              >
                {isSending ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
