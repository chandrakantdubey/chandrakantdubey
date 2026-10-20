import { useEffect, useRef, useState } from "react";
import type { ThemeName } from "./theme";
import { themes } from "./theme";

const swatches: Record<ThemeName, string[]> = {
  evergreen: ["#d4f36b", "#ff9e64", "#65e2c3"],
  void: ["#ff79b7", "#ffad6e", "#79e6e7"],
  paper: ["#b83f20", "#557b19", "#08746e"],
  glacial: ["#086cae", "#087d91", "#6248ad"],
};

export function ThemePicker({ theme, onChange }: { theme: ThemeName; onChange: (value: ThemeName) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const selected = themes.find((item) => item.id === theme) ?? themes[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return <div className="relative" ref={root}>
    <button ref={trigger} type="button" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--line-strong)] bg-[var(--panel)] px-3 text-[14px] font-medium text-[var(--ink)] transition hover:border-[var(--accent-line)] hover:bg-[var(--panel-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <span className="flex -space-x-1.5" aria-hidden="true">{swatches[theme].map((color) => <span key={color} className="h-3.5 w-3.5 rounded-full border-2 border-[var(--panel)]" style={{ backgroundColor: color }} />)}</span>
      <span className="hidden sm:inline">Themes</span><span className="sr-only sm:hidden">Choose theme</span>
      <span className="text-[var(--dim)]" aria-hidden="true">⌄</span>
    </button>
    {open && <div role="dialog" aria-label="Choose a color theme" className="fixed left-1/2 top-[76px] z-50 max-h-[calc(100dvh-5.5rem)] w-[min(22rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-y-auto rounded-2xl border border-[var(--line-strong)] bg-[var(--panel-solid)] p-3 shadow-[0_24px_80px_var(--shadow-glass)] sm:absolute sm:left-auto sm:top-[calc(100%+10px)] sm:translate-x-0">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-2 pb-3 pt-1">
        <div><p className="m-0 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[.16em] text-[var(--dim)]">Shell appearance</p><p className="mb-0 mt-1 text-[14px] font-semibold text-[var(--ink)]">{selected.name}</p></div>
        <span className="rounded-full border border-[var(--line)] px-2 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wide text-[var(--muted)]">{selected.scheme} mode</span>
      </div>
      {(["dark", "light"] as const).map((scheme) => <section key={scheme} className="pt-3">
        <h2 className="mb-1 px-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[.16em] text-[var(--dim)]">{scheme === "dark" ? "01 · Night palettes" : "02 · Day palettes"}</h2>
        <div className="grid gap-1">
          {themes.filter((item) => item.scheme === scheme).map((item) => <button key={item.id} type="button" className="flex min-h-[58px] items-center gap-3 rounded-xl px-2.5 text-left transition hover:bg-[var(--panel-raised)] focus-visible:outline-2 focus-visible:outline-[var(--focus)]" aria-pressed={theme === item.id} onClick={() => { onChange(item.id); setOpen(false); trigger.current?.focus(); }}>
            <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--line-strong)] p-1" style={{ backgroundColor: item.surface }} aria-hidden="true">
              <span className="flex h-full w-full flex-col justify-between rounded-md p-1"><span className="h-1 w-4/5 rounded-full" style={{ backgroundColor: swatches[item.id][0] }} /><span className="flex gap-0.5"><span className="h-1 w-1/2 rounded-full" style={{ backgroundColor: swatches[item.id][1] }} /><span className="h-1 w-1/3 rounded-full" style={{ backgroundColor: swatches[item.id][2] }} /></span></span>
            </span>
            <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold text-[var(--ink)]">{item.name}</span><span className="block text-[12px] text-[var(--muted)]">{item.description}</span></span>
            {theme === item.id && <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--accent-soft)] text-[13px] font-bold text-[var(--accent)]" aria-label="Selected">✓</span>}
          </button>)}
        </div>
      </section>)}
    </div>}
  </div>;
}
