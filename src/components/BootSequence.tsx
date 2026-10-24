import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BrandMark } from "./icons";

const startupLines = [
  "mounting /home/chandrakant/workspace",
  "indexing selected work and engineering log",
  "starting the DRAKON shell",
];

export function BootSequence({ motionEnabled, themeClasses, onComplete }: { motionEnabled: boolean; themeClasses: string; onComplete: () => void }) {
  const reduceMotion = useReducedMotion();
  const animate = motionEnabled && !reduceMotion;
  const duration = animate ? 4000 : 3000;
  const [visible, setVisible] = useState(true);
  const [stage, setStage] = useState(0);
  const sequenceNumber = Math.min(stage + 1, startupLines.length).toString().padStart(2, "0");
  const progressWidth = ["w-[4%]", "w-1/3", "w-2/3", "w-full"][stage];
  const enterButton = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    enterButton.current?.focus({ preventScroll: true });
    const stageTimers = [1, 2, 3].map((nextStage) => window.setTimeout(
      () => setStage(nextStage),
      duration * nextStage / 4,
    ));
    const timer = window.setTimeout(() => setVisible(false), duration);
    return () => {
      stageTimers.forEach(window.clearTimeout);
      window.clearTimeout(timer);
    };
  }, [duration, visible]);

  function enterWorkspace() {
    setVisible(false);
  }

  return <AnimatePresence onExitComplete={onComplete}>
    {visible && <motion.div
      className={`fixed inset-0 z-[120] grid min-h-[100dvh] place-items-center overflow-y-auto bg-[var(--page)] px-4 py-7 text-[var(--ink)] ${themeClasses}`}
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: animate ? .2 : .08 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="boot-title"
      aria-describedby="boot-description"
      onKeyDown={(event) => {
        if (event.key === "Escape") enterWorkspace();
        if (event.key === "Tab") {
          event.preventDefault();
          enterButton.current?.focus();
        }
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,var(--accent-soft),transparent_62%)]" aria-hidden="true" />
      <motion.section
        className="relative w-full max-w-[660px] overflow-hidden rounded-[24px] border border-[var(--line-strong)] bg-[linear-gradient(145deg,var(--panel-solid),var(--page-elevated))] shadow-[0_28px_100px_var(--shadow-glass)]"
        initial={animate ? { y: 12, scale: .99 } : false}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: animate ? .35 : 0, ease: [.22, 1, .36, 1] }}
      >
        <header className="flex min-h-14 items-center gap-3 border-b border-[var(--line)] px-4 sm:px-6">
          <BrandMark className="h-8 w-8 shrink-0" />
          <span className="font-[family-name:var(--font-mono)] text-[13px] text-[var(--muted)]">chandrakant@drakon: ~</span>
          <span className="ml-auto hidden font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[.14em] text-[var(--dim)] sm:block">startup sequence</span>
          <span aria-live="polite" className="ml-auto font-[family-name:var(--font-mono)] text-[11px] text-[var(--accent)] sm:ml-0">{sequenceNumber} / 03</span>
        </header>

        <div className="grid gap-7 p-5 sm:grid-cols-[minmax(0,1fr)_148px] sm:items-center sm:gap-6 sm:p-8">
          <div>
            <p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.16em] text-[var(--accent)]">DRAKON · engineering workspace</p>
            <h1 id="boot-title" className="mb-0 mt-3 text-[clamp(1.8rem,5vw,2.5rem)] font-semibold leading-tight tracking-[-.045em] text-[var(--ink)]">Booting into your workspace.</h1>
            <p id="boot-description" className="mb-0 mt-2 max-w-[430px] text-[15px] leading-relaxed text-[var(--muted)]">Preparing Chandrakant Dubey’s portfolio environment.</p>

            <ul className="mt-6 space-y-2.5 p-0" aria-live="polite">
              {startupLines.map((line, index) => {
                const complete = index < stage;
                const active = index === stage;
                const status = complete ? "[ OK ]" : active ? "[ RUN ]" : "[···]";
                const statusColor = complete ? "text-[var(--accent)]" : active ? "text-[var(--ember)]" : "text-[var(--dim)]";
                return <motion.li
                  key={line}
                  className="flex min-h-6 items-center gap-2.5 font-[family-name:var(--font-mono)] text-[12px] leading-relaxed text-[var(--muted)] sm:text-[13px]"
                  initial={false}
                  animate={{ opacity: index <= stage ? 1 : .55, x: 0 }}
                  transition={{ duration: animate ? .22 : 0 }}
                ><span className={`shrink-0 font-medium ${statusColor}`} aria-hidden="true">{status}</span>{line}</motion.li>;
              })}
            </ul>

            <div role="progressbar" aria-label="Workspace startup" aria-valuemin={0} aria-valuemax={startupLines.length} aria-valuenow={stage} className="mt-6 h-1 overflow-hidden rounded-full bg-[var(--line)]">
              <div className={`h-full rounded-full bg-[var(--accent)] shadow-[0_0_14px_var(--accent)] ${progressWidth} ${animate ? "transition-[width] duration-1000 ease-out" : "transition-none"}`} />
            </div>
          </div>

          <div className="pointer-events-none absolute right-[-9%] top-[21%] grid aspect-square w-[38%] max-w-[150px] place-items-center opacity-[.12] sm:relative sm:right-auto sm:top-auto sm:w-full sm:opacity-100" aria-hidden="true">
            <div className="absolute inset-0 rounded-full border border-dashed border-[var(--accent-line)]" />
            <div className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,var(--accent-soft),transparent_70%)]" />
            <motion.div
              className="relative grid h-[58%] w-[58%] place-items-center drop-shadow-[0_0_24px_var(--accent-soft)]"
              animate={animate ? { rotate: [0, 3, 0] } : undefined}
              transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
            ><BrandMark className="h-full w-full" /></motion.div>
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-5 sm:col-span-2">
            <p className="m-0 font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">ESC to skip · motion follows your preference</p>
            <button ref={enterButton} type="button" onClick={enterWorkspace} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-[13px] font-semibold text-[var(--accent-ink)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)]">Enter workspace <span aria-hidden="true">→</span></button>
          </div>
        </div>
      </motion.section>
    </motion.div>}
  </AnimatePresence>;
}
