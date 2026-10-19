import type { ThemeName } from "./theme";
import { ThemePicker } from "./ThemePicker";
import { profile } from "../portfolio";
import { PAGE_CONTAINER } from "./layout";

const links = [
  ["Work", "#work"],
  ["Projects", "#projects"],
  ["Experience", "#experience"],
  ["Stack", "#skills"],
  ["Contact", "#contact"],
];

export function SiteHeader({ theme, onThemeChange }: { theme: ThemeName; onThemeChange: (value: ThemeName) => void }) {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
      <div className={PAGE_CONTAINER + " px-0"}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] p-2 shadow-[var(--shadow-glass)] backdrop-blur-2xl lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-3 lg:px-3">
          <a className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-md px-1 text-[12px] font-semibold text-[var(--ink)] transition hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] sm:text-[13px]" href="#top" aria-label="Chandrakant Dubey home">
            <span className="h-6 w-6 shrink-0 bg-[var(--accent)] [mask-image:url('/dragon-sigil.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" aria-hidden="true" />
            <span className="truncate sm:hidden">cdubey</span>
            <span className="hidden truncate sm:inline">chandrakant@portfolio</span>
          </a>

          <nav aria-label="Main navigation" className="col-span-2 row-start-2 flex min-w-0 items-center gap-0.5 overflow-x-auto border-t border-[var(--line)] pt-1 lg:col-span-1 lg:row-start-auto lg:justify-center lg:border-t-0 lg:pt-0">
            {links.map(([label, href]) => <a className="inline-flex min-h-11 shrink-0 items-center rounded-md px-2 text-[13px] font-medium text-[var(--muted)] transition-colors hover:bg-[var(--panel-raised)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--focus)] sm:px-2.5" href={href} key={href}>{label}</a>)}
          </nav>

          <div className="col-start-2 row-start-1 flex shrink-0 items-center gap-1.5 lg:col-start-3 lg:row-start-auto lg:gap-2">
            <ThemePicker theme={theme} onChange={onThemeChange} />
            <a className="hidden min-h-11 items-center rounded-md border border-[var(--line-strong)] px-3 text-[13px] font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] lg:inline-flex" href={profile.resume} download>Résumé <span className="ml-1" aria-hidden="true">↓</span></a>
          </div>
        </div>
      </div>
    </header>
  );
}
