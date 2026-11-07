import { profile } from "../portfolio";
import { ChakraIcon } from "./ChakraIcon";

export function Footer() {
  return (
    <footer className="py-14 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand & Location */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--accent)] shadow-sm">
              <ChakraIcon className="w-5 h-5 text-[var(--accent)]" animated />
            </div>
            <div>
              <p className="text-base font-bold text-[var(--text-primary)]">
                {profile.name}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Full-Stack Software Engineer · Mumbai, India 🇮🇳
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-[var(--text-secondary)]">
            <a href="#about" className="hover:text-[var(--accent)] transition">About</a>
            <a href="#projects" className="hover:text-[var(--accent)] transition">Projects</a>
            <a href="#experience" className="hover:text-[var(--accent)] transition">Experience</a>
            <a href="#skills" className="hover:text-[var(--accent)] transition">All Skills</a>
            <a href="#contact" className="hover:text-[var(--accent)] transition">Contact</a>
            <a href="#hero" className="hover:text-[var(--accent)] transition text-[var(--accent)]">Back to Top ↑</a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} Chandrakant Dubey. Built with passion in Mumbai, India 🇮🇳.</p>
          <p>React 19 · Next.js · TypeScript · Tailwind CSS · Motion</p>
        </div>
      </div>
    </footer>
  );
}
