import { useEffect, useRef, useState } from "react";
import type { ThemeName } from "./theme";
import { themes } from "./theme";

const swatches: Record<ThemeName, string> = {
  evergreen: "#b7f36b",
  paper: "#3c742d",
  void: "#d9a6ff",
  glacial: "#75e6f4",
};

export function ThemePicker({ theme, onChange }: { theme: ThemeName; onChange: (value: ThemeName) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

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

  return (
    <div className="relative" ref={root}>
      <button ref={trigger} type="button" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--line-strong)] bg-[var(--panel)] px-3 text-[14px] font-medium text-[var(--ink)] transition hover:border-[var(--accent-line)] hover:bg-[var(--panel-raised)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className="h-3 w-3 rounded-full shadow-[0_0_12px_var(--accent)]" style={{ backgroundColor: swatches[theme] }} aria-hidden="true" />
        <span className="hidden sm:inline">Theme</span>
        <span className="sr-only sm:hidden">Theme</span>
        <span className="text-[var(--dim)]" aria-hidden="true">⌄</span>
      </button>
      {open && <div role="dialog" aria-label="Choose a color theme" className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(21rem,calc(100vw-2rem))] rounded-2xl border border-[var(--line-strong)] bg-[var(--panel-solid)] p-3 shadow-[0_24px_80px_var(--shadow-glass)]">
        <p className="px-2 pb-2 pt-1 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.16em] text-[var(--dim)]">Shell appearance</p>
        <div className="grid gap-1">
          {themes.map((item) => <button key={item.id} type="button" className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-left transition hover:bg-[var(--panel-raised)] focus-visible:outline-2 focus-visible:outline-[var(--focus)]" aria-pressed={theme === item.id} onClick={() => { onChange(item.id); setOpen(false); trigger.current?.focus(); }}>
            <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line-strong)]" style={{ backgroundColor: item.surface }}>
              <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: swatches[item.id] }} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-[var(--ink)]">{item.name}</span>
              <span className="block text-[13px] text-[var(--muted)]">{item.description}</span>
            </span>
            {theme === item.id && <span className="text-[var(--accent)]" aria-label="Selected">✓</span>}
          </button>)}
        </div>
      </div>}
    </div>
  );
}
