import type { ThemeName } from "./theme";
import { ThemePicker } from "./ThemePicker";
import { navigation, type WorkspaceView } from "./navigation";
import { profile } from "../portfolio";

export function SystemBar({ theme, onThemeChange, motionEnabled, onMotionToggle, onPaletteOpen, view, onNavigate }: {
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  motionEnabled: boolean;
  onMotionToggle: () => void;
  onPaletteOpen: () => void;
  view: WorkspaceView;
  onNavigate: (view: WorkspaceView) => void;
}) {
  return <>
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--page)]/90 px-3 backdrop-blur-2xl sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[68px] max-w-[1600px] items-center gap-2 sm:gap-5">
        <a href="#home" onClick={(event) => { event.preventDefault(); onNavigate("home"); }} className="group flex min-h-12 min-w-0 items-center gap-2 rounded-xl pr-1 focus-visible:outline-2 focus-visible:outline-[var(--focus)] sm:gap-3" aria-label="Chandrakant Dubey workspace home">
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_24px_var(--accent-soft)]" aria-hidden="true">
            <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 28c2-5 6-9 12-11 3-1 5-4 4-9 4 4 7 7 12 8l-5 3c-2 4-6 6-11 4-3 4-7 6-12 5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M25 10c2-3 5-5 9-6-1 4-.5 7 2 10M15 24c-4 2-6 5-6 9m13-11c2 3 4 5 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="29" cy="17" r="1.2" fill="var(--ember)" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold tracking-tight text-[var(--ink)] sm:text-[15px]">DRAKON</span>
            <span className="hidden font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)] sm:block">{profile.name.toLowerCase().replaceAll(" ", "")}</span>
          </span>
        </a>
        <div className="hidden h-8 w-px bg-[var(--line)] lg:block" />
        <nav className="hidden min-w-0 flex-1 items-center gap-1 lg:flex" aria-label="Main navigation">
          {navigation.map((item) => <a key={item.id} href={item.id === "work" ? "#work" : `#${item.id}`} onClick={(event) => { event.preventDefault(); onNavigate(item.id); }} aria-current={view === item.id ? "page" : undefined} className={"inline-flex min-h-11 items-center rounded-xl px-4 text-[14px] font-medium transition focus-visible:outline-2 focus-visible:outline-[var(--focus)] " + (view === item.id ? "bg-[var(--panel-raised)] text-[var(--ink)]" : "text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--ink)]")}>{item.label}</a>)}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button type="button" onClick={onMotionToggle} aria-label={motionEnabled ? "Motion on" : "Motion off"} aria-pressed={motionEnabled} title={motionEnabled ? "Turn motion off" : "Turn motion on"} className="inline-flex h-11 w-11 items-center justify-center gap-2 rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] text-[13px] font-medium text-[var(--muted)] transition hover:border-[var(--accent-line)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--focus)] lg:w-auto lg:px-3"><span className="relative h-4 w-7 rounded-full border border-[var(--line-strong)] bg-[var(--page)]"><span className={"absolute top-[2px] h-2.5 w-2.5 rounded-full transition-all " + (motionEnabled ? "left-[13px] bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" : "left-[2px] bg-[var(--dim)]")} /></span><span className="hidden text-[13px] lg:inline">Motion</span></button>
          <ThemePicker theme={theme} onChange={onThemeChange} />
          <button type="button" onClick={onPaletteOpen} className="hidden h-11 items-center gap-3 rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] px-3 text-[14px] text-[var(--muted)] transition hover:border-[var(--accent-line)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--focus)] sm:flex" aria-label="Open command palette"><span aria-hidden="true">⌕</span><span>Jump to</span><kbd className="rounded-md border border-[var(--line-strong)] px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">⌘ K</kbd></button>
          <button type="button" onClick={onPaletteOpen} className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] text-[19px] text-[var(--muted)] sm:hidden" aria-label="Open command palette">⌕</button>
        </div>
      </div>
    </header>
    <nav className="sticky top-[68px] z-30 grid grid-cols-5 border-b border-[var(--line)] bg-[var(--page)]/95 px-2 py-1 backdrop-blur-2xl lg:hidden" aria-label="Mobile navigation">
      {navigation.map((item) => <a key={item.id} href={item.id === "work" ? "#work" : `#${item.id}`} onClick={(event) => { event.preventDefault(); onNavigate(item.id); }} aria-current={view === item.id ? "page" : undefined} className={"flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[12px] font-medium leading-tight transition focus-visible:outline-2 focus-visible:outline-[var(--focus)] " + (view === item.id ? "text-[var(--accent)]" : "text-[var(--dim)] hover:text-[var(--ink)]")}><span aria-hidden="true" className="text-[17px] leading-5">{item.glyph}</span><span className="truncate">{item.short}</span></a>)}
    </nav>
  </>;
}
