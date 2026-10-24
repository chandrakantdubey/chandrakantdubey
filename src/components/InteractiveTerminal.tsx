import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useReducedMotion } from "motion/react";
import { profile, workspaceProjects } from "../portfolio";
import type { WorkspaceView } from "./navigation";

type Line = { command: string; response: string };

const commandList = ["help", "whoami", "ls", "cat about.md", "work", "journal", "packages", "resume", "contact", "clear"];
const helpOutput = [
  "help          command list",
  "whoami        profile",
  "ls            projects",
  "cat about.md   introduction",
  "work          open workbench",
  "journal       experience",
  "packages      technology stack",
  "resume        download résumé",
  "contact       contact options",
  "clear         clear screen",
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
      whoami: `${profile.name} · ${profile.role} · ${profile.location}`,
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
    <div className="flex min-h-[60px] items-center gap-3 border-b border-[var(--line)] bg-[var(--page)]/35 px-4 sm:px-5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)] font-[family-name:var(--font-mono)] text-[12px] font-semibold text-[var(--accent)]" aria-hidden="true">$_</span>
      <div className="min-w-0 flex-1">
        <h2 id="terminal-heading" className="m-0 truncate font-[family-name:var(--font-mono)] text-[13px] font-semibold text-[var(--ink)]">Terminal <span className="font-normal text-[var(--dim)]">— chandrakant@drakon</span></h2>
        <p className="m-0 truncate font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">~/workspace</p>
      </div>
      <span className="hidden items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)] sm:inline-flex"><span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />DRAKON</span>
    </div>
    <div ref={output} className="max-h-[250px] min-h-[146px] space-y-3 overflow-y-auto bg-[radial-gradient(ellipse_at_15%_0%,var(--accent-soft),transparent_55%)] px-4 py-4 font-[family-name:var(--font-mono)] text-[13px] leading-relaxed sm:px-5" aria-live="polite" aria-relevant="additions text">
      {lines.length === 0 ? <div className="space-y-2"><p className="m-0 text-[var(--accent)]">~/workspace <span className="text-[var(--cyan)]">·</span> ready</p><p className="m-0 break-words text-[var(--muted)]">Run <button type="button" onClick={() => execute("help")} className="inline-flex min-h-11 items-center rounded px-2 font-semibold text-[var(--accent)] underline decoration-[var(--accent-line)] underline-offset-4 hover:text-[var(--ink)]">help</button> to browse commands.</p></div> : lines.map((line, index) => <div key={`${line.command}-${index}`} className="space-y-1.5"><p className="m-0 break-all"><span className="text-[var(--accent)]">chandrakant@drakon</span><span className="text-[var(--dim)]">:</span><span className="text-[var(--cyan)]">~/workspace</span><span className="text-[var(--accent)]">$ </span><span className="text-[var(--ink)]">{line.command}</span></p><p className="m-0 break-words whitespace-pre-wrap text-[var(--muted)]">{line.response}</p></div>)}
    </div>
    <form onSubmit={handleSubmit} className="flex min-h-[58px] items-center gap-2 border-t border-[var(--line)] px-4 sm:px-5">
      <label htmlFor="terminal-command" className="shrink-0 font-[family-name:var(--font-mono)] text-[12px] text-[var(--accent)] sm:text-[13px]"><span className="hidden text-[var(--muted)] md:inline">chandrakant@drakon:</span><span className="text-[var(--cyan)]">~/workspace</span>$</label>
      <input ref={input} id="terminal-command" value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={handleKeyDown} autoComplete="off" spellCheck={false} aria-describedby="terminal-help" placeholder="Type a command…" className="min-w-0 flex-1 bg-transparent py-3 font-[family-name:var(--font-mono)] text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--dim)]" />
      <button type="submit" className="min-h-11 shrink-0 rounded-xl border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3 text-[13px] font-medium text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] focus-visible:outline-2 focus-visible:outline-[var(--focus)]">Run</button>
    </form>
    <p id="terminal-help" className="m-0 border-t border-[var(--line)] bg-[var(--page)]/25 px-4 py-2.5 font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)] sm:px-5">Tab complete <span className="px-1 text-[var(--line-strong)]">·</span> ↑ history</p>
  </section>;
}
