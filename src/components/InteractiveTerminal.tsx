import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useReducedMotion } from "motion/react";
import { profile, workspaceProjects } from "../portfolio";
import type { WorkspaceView } from "./navigation";

type Line = { command: string; response: string };

const commandList = ["help", "whoami", "ls", "cat about.md", "work", "journal", "packages", "resume", "contact", "clear"];
const helpOutput = [
  "whoami       identity and engineering focus",
  "ls           browse the workspace",
  "cat about.md read the short introduction",
  "work         inspect selected projects",
  "journal      explore professional experience",
  "packages     inspect engineering tools",
  "resume       download the résumé",
  "contact      open contact options",
  "clear        clear terminal output",
].join("\n");

export function InteractiveTerminal({ onNavigate, onResume, motionEnabled }: { onNavigate: (view: WorkspaceView) => void; onResume: () => void; motionEnabled: boolean }) {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyPosition, setHistoryPosition] = useState(-1);
  const [lines, setLines] = useState<Line[]>([{ command: "help", response: helpOutput }]);
  const input = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  function execute(raw: string) {
    const command = raw.trim().replace(/\s+/g, " ").toLowerCase();
    if (!command) return;
    setHistory((items) => [...items, command]);
    setHistoryPosition(-1);
    setValue("");

    if (command === "clear") {
      setLines([]);
      return;
    }
    if (!commandList.includes(command)) {
      setLines((items) => [...items, { command, response: `Command not found. Try “help” to see what this workstation can do.` }]);
      requestAnimationFrame(() => output.current?.scrollTo({ top: output.current.scrollHeight, behavior: motionEnabled && !reduceMotion ? "smooth" : "auto" }));
      return;
    }

    const responses: Record<string, string> = {
      help: helpOutput,
      whoami: `${profile.name} — ${profile.role}, based in ${profile.location}. Focus: full-stack product engineering, backend systems, and ML inference integration.`,
      ls: workspaceProjects.map((project) => project.id).join("   "),
      "cat about.md": profile.introduction,
    };
    setLines((items) => [...items, { command, response: responses[command] ?? `Opening ${command === "work" ? "Workbench" : command === "journal" ? "Journal" : command === "packages" ? "Packages" : command === "contact" ? "Contact" : "résumé"}.` }]);
    if (command === "work") onNavigate("work");
    if (command === "journal") onNavigate("journal");
    if (command === "packages") onNavigate("packages");
    if (command === "contact") onNavigate("contact");
    if (command === "resume") onResume();
    requestAnimationFrame(() => output.current?.scrollTo({ top: output.current.scrollHeight, behavior: motionEnabled && !reduceMotion ? "smooth" : "auto" }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    execute(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = historyPosition < 0 ? history.length - 1 : Math.max(0, historyPosition - 1);
      setHistoryPosition(next);
      setValue(history[next] ?? "");
    }
    if (event.key === "ArrowDown" && historyPosition >= 0) {
      event.preventDefault();
      const next = historyPosition + 1;
      setHistoryPosition(next >= history.length ? -1 : next);
      setValue(history[next] ?? "");
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const matching = commandList.find((command) => command.startsWith(value.toLowerCase()));
      if (matching) setValue(matching);
    }
  }

  return <section className="overflow-hidden rounded-[24px] border border-[var(--line-strong)] bg-[var(--panel)] shadow-[0_24px_70px_var(--shadow-glass)]" aria-labelledby="terminal-heading">
    <div className="flex min-h-[60px] items-center gap-3 border-b border-[var(--line)] px-4 sm:px-5">
      <div className="flex gap-1.5" aria-hidden="true"><span className="h-2.5 w-2.5 rounded-full bg-[var(--ember)]" /><span className="h-2.5 w-2.5 rounded-full bg-[var(--lime)]" /><span className="h-2.5 w-2.5 rounded-full bg-[var(--cyan)]" /></div>
      <h2 id="terminal-heading" className="m-0 min-w-0 flex-1 truncate font-[family-name:var(--font-mono)] text-[13px] font-medium text-[var(--muted)]">chandrakant@drakon <span className="text-[var(--dim)]">: ~/workspace</span></h2>
      <span className="hidden items-center gap-2 rounded-full border border-[var(--line)] px-2.5 py-1 text-[12px] text-[var(--muted)] sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> simulated shell</span>
    </div>
    <div ref={output} className="max-h-[220px] min-h-[128px] space-y-3 overflow-y-auto px-4 py-4 font-[family-name:var(--font-mono)] text-[13px] leading-relaxed sm:px-5" aria-live="polite" aria-relevant="additions text">
      {lines.length === 0 ? <div className="space-y-2"><p className="m-0 text-[var(--accent)]">DRAKON workstation · portfolio shell</p><p className="m-0 break-words text-[var(--muted)]">This is a safe, simulated command surface. Try <button type="button" onClick={() => execute("help")} className="inline-flex min-h-11 items-center rounded px-2 underline decoration-[var(--accent-line)] underline-offset-4 hover:text-[var(--ink)]">help</button> to get started.</p></div> : lines.map((line, index) => <div key={`${line.command}-${index}`} className="space-y-1.5"><p className="m-0 break-all text-[var(--accent)]"><span className="text-[var(--dim)]">chandrakant@drakon:~$ </span>{line.command}</p><p className="m-0 break-words whitespace-pre-wrap text-[var(--muted)]">{line.response}</p></div>)}
    </div>
    <form onSubmit={handleSubmit} className="flex min-h-[58px] items-center gap-2 border-t border-[var(--line)] px-4 sm:px-5">
      <label htmlFor="terminal-command" className="font-[family-name:var(--font-mono)] text-[14px] text-[var(--accent)]">$</label>
      <input ref={input} id="terminal-command" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={handleKeyDown} autoComplete="off" spellCheck={false} aria-describedby="terminal-help" placeholder="Type a command…" className="min-w-0 flex-1 bg-transparent py-3 font-[family-name:var(--font-mono)] text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--dim)]" />
      <button type="submit" className="min-h-11 shrink-0 rounded-xl border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 text-[13px] font-medium text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] focus-visible:outline-2 focus-visible:outline-[var(--focus)]">Run</button>
    </form>
    <p id="terminal-help" className="m-0 border-t border-[var(--line)] px-4 py-2.5 text-[12px] leading-relaxed text-[var(--dim)] sm:px-5">Allowlisted commands only. Tab completes · ↑ recalls history. Nothing runs on your device.</p>
  </section>;
}
