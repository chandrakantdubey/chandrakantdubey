import type { ThemeName } from "./theme";
import { ThemePicker } from "./ThemePicker";
import { navigation, type WorkspaceView } from "./navigation";
import { profile } from "../portfolio";
import { BrandMark, HomeIcon } from "./icons";

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
          <BrandMark className="h-10 w-10 shrink-0 drop-shadow-[0_0_18px_var(--accent-soft)] transition-transform duration-300 group-hover:scale-[1.04]" />
          <span className="hidden min-w-0 min-[380px]:block">
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
      {navigation.map((item) => <a key={item.id} href={item.id === "work" ? "#work" : `#${item.id}`} onClick={(event) => { event.preventDefault(); onNavigate(item.id); }} aria-current={view === item.id ? "page" : undefined} className={"flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[12px] font-medium leading-tight transition focus-visible:outline-2 focus-visible:outline-[var(--focus)] " + (view === item.id ? "text-[var(--accent)]" : "text-[var(--dim)] hover:text-[var(--ink)]")}><span aria-hidden="true" className="grid h-[20px] place-items-center text-[17px] leading-5">{item.id === "home" ? <HomeIcon className="h-[18px] w-[18px]" /> : item.glyph}</span><span className="truncate">{item.short}</span></a>)}
    </nav>
  </>;
}
