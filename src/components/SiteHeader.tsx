import type { ThemeName } from "./theme";
import { ThemePicker } from "./ThemePicker";
import { profile } from "../portfolio";
import { PAGE_CONTAINER } from "./layout";

const links = [
  ["Work", "#work"],
  ["Projects", "#projects"],
  ["Experience", "#experience"],
  ["Skills", "#skills"],
  ["Contact", "#contact"],
];

export function SiteHeader({ theme, onThemeChange }: { theme: ThemeName; onThemeChange: (value: ThemeName) => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--page)]/95 backdrop-blur-xl">
      <div className={PAGE_CONTAINER + " flex min-h-[68px] flex-wrap items-center justify-between gap-3 py-2 lg:min-h-[76px] lg:flex-nowrap lg:py-0"}>
        <a className="inline-flex shrink-0 items-center gap-3" href="#top" aria-label="Chandrakant Dubey, home">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line-strong)] text-[13px] font-bold tracking-[-.06em] text-[var(--accent)]">CD</span>
          <span className="text-[14px] font-semibold tracking-[-.025em] sm:text-[15px]">Chandrakant Dubey</span>
        </a>
        <nav aria-label="Main navigation" className="order-3 flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-[var(--line)] py-2.5 lg:order-none lg:w-auto lg:justify-start lg:gap-6 lg:border-0 lg:py-0">
          {links.map(([label, href]) => <a className="shrink-0 text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--accent)] focus-visible:text-[var(--accent)] sm:text-[13px]" href={href} key={href}>{label}</a>)}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
          <ThemePicker theme={theme} onChange={onThemeChange} />
          <a className="hidden min-h-10 items-center rounded-md border border-[var(--line-strong)] px-3 text-[12px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] sm:inline-flex" href={profile.resume} download>Résumé</a>
        </div>
      </div>
    </header>
  );
}
