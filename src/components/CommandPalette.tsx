import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { navigation, type WorkspaceView } from "./navigation";
import { profile } from "../portfolio";

type Command = { id: string; label: string; detail: string; view?: WorkspaceView; resume?: true };
const commands: Command[] = [
  ...navigation.map((item) => ({ id: item.id, label: item.label, detail: `Open ${item.label.toLowerCase()} view`, view: item.id })),
  { id: "resume", label: "Download résumé", detail: "Save the current PDF résumé", resume: true },
];

export function CommandPalette({ onClose, onNavigate, onResume }: { onClose: () => void; onNavigate: (view: WorkspaceView) => void; onResume: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => commands.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query.trim().toLowerCase())), [query]);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    input.current?.focus();
    return () => previous?.focus();
  }, []);

  useEffect(() => setActiveIndex(0), [query]);

  function select(item?: Command) {
    if (!item) return;
    onClose();
    if (item.view) onNavigate(item.view);
    if (item.resume) onResume();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(results.length, 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      select(results[activeIndex]);
    }
    if (event.key === "Tab" && dialog.current) {
      const focusable = Array.from(dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [href]'));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  }

  return <div className="fixed inset-0 z-[100] grid place-items-start bg-black/60 px-3 pt-[12vh] backdrop-blur-sm sm:px-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="command-title" onKeyDown={handleKeyDown} className="w-full max-w-[620px] overflow-hidden rounded-[22px] border border-[var(--line-strong)] bg-[var(--panel-solid)] shadow-[0_30px_120px_#0009]">
      <div className="border-b border-[var(--line)] px-4 py-3 sm:px-5"><h2 id="command-title" className="sr-only">Jump to a workspace view</h2><label className="flex min-h-12 items-center gap-3"><span className="text-[20px] text-[var(--accent)]" aria-hidden="true">⌕</span><span className="sr-only">Search navigation commands</span><input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search views and actions…" className="min-w-0 flex-1 bg-transparent text-[16px] text-[var(--ink)] outline-none placeholder:text-[var(--dim)]"/><kbd className="rounded-md border border-[var(--line)] px-2 py-1 font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">ESC</kbd></label></div>
      <div className="max-h-[min(60vh,440px)] overflow-y-auto p-2" role="listbox" aria-label="Workspace commands">
        {results.length ? results.map((item, index) => <button key={item.id} type="button" role="option" aria-selected={activeIndex === index} onMouseEnter={() => setActiveIndex(index)} onClick={() => select(item)} className={"flex min-h-[60px] w-full items-center gap-3 rounded-xl px-3 text-left transition focus-visible:outline-2 focus-visible:outline-[var(--focus)] " + (activeIndex === index ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--panel-raised)]")}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-[var(--panel)] font-[family-name:var(--font-mono)] text-[15px] text-[var(--accent)]">{item.resume ? "↓" : navigation.find((link) => link.id === item.view)?.glyph}</span><span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold text-[var(--ink)]">{item.label}</span><span className="mt-0.5 block text-[13px] text-[var(--muted)]">{item.detail}</span></span><span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">↵</span>
        </button>) : <p className="px-4 py-8 text-center text-[15px] text-[var(--muted)]">No matching workspace action.</p>}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--line)] px-4 py-3 text-[12px] text-[var(--dim)] sm:px-5"><span>↑ ↓ navigate</span><span>↵ open</span><span>esc close</span><span className="ml-auto">{profile.name}</span></div>
    </div>
  </div>;
}
