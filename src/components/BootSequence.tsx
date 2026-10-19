import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const bootLines = [
  "Opening portfolio workspace",
  "Preparing work, projects, and toolkit",
  "Ready to explore",
];

function shouldShowBoot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = "chandrakant-portfolio-boot-seen";
    if (window.sessionStorage.getItem(key)) return false;
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Keep the brief launch animation even if session storage is unavailable.
  }
  return true;
}

export function BootSequence() {
  const [visible, setVisible] = useState(shouldShowBoot);
  const skipRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!visible) return;
    const page = document.getElementById("site-content");
    page?.setAttribute("inert", "");
    skipRef.current?.focus();
    const duration = reduceMotion ? 550 : 1250;
    const timer = window.setTimeout(() => setVisible(false), duration);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
      page?.removeAttribute("inert");
    };
  }, [reduceMotion, visible]);

  return (
    <AnimatePresence onExitComplete={() => document.getElementById("main")?.focus({ preventScroll: true })}>
      {visible && <motion.div
        className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[var(--page)]/95 px-4 py-8 backdrop-blur-2xl"
        initial={reduceMotion ? false : { opacity: 1 }}
        exit={{ opacity: 0, scale: 1.012, filter: "blur(8px)" }}
        transition={{ duration: reduceMotion ? 0 : .38, ease: [.22, .72, .2, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label="Portfolio launch"
        onKeyDown={(event) => {
          if (event.key === "Escape") setVisible(false);
          if (event.key === "Tab") {
            event.preventDefault();
            skipRef.current?.focus();
          }
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--accent-soft),transparent_64%)]" aria-hidden="true" />
        <motion.section className="relative w-full max-w-[480px] overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] shadow-[var(--shadow-glass)] backdrop-blur-2xl" initial={reduceMotion ? false : { y: 10, scale: .99 }} animate={{ y: 0, scale: 1 }} transition={{ duration: .32 }}>
          <div className="flex min-h-12 items-center gap-3 border-b border-[var(--line)] px-4 sm:px-5">
            <span className="h-6 w-6 bg-[var(--accent)] [mask-image:url('/dragon-sigil.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" aria-hidden="true" />
            <span className="font-[family-name:var(--font-mono)] text-[13px] text-[var(--muted)]">cdubey@portfolio:~</span>
            <button ref={skipRef} className="ml-auto min-h-11 rounded-md px-2 text-[13px] text-[var(--muted)] hover:bg-[var(--panel-raised)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" type="button" onClick={() => setVisible(false)}>Skip intro</button>
          </div>
          <div className="p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[var(--accent-line)] bg-[var(--accent-soft)]">
                <span className="h-7 w-7 bg-[var(--accent)] [mask-image:url('/dragon-sigil.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]" aria-hidden="true" />
              </span>
              <div><p className="m-0 text-[12px] font-medium tracking-[.05em] text-[var(--accent)]">PORTFOLIO / START</p><h2 className="mt-1 text-[22px] font-semibold tracking-[-.03em] text-[var(--ink)] sm:text-[24px]">Welcome in.</h2></div>
            </div>
            <div className="space-y-2.5 text-[13px] text-[var(--muted)]" aria-live="polite">
              {bootLines.map((line, index) => <motion.p className="m-0 flex min-h-5 items-center gap-2.5" key={line} initial={reduceMotion ? false : { opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .22, delay: reduceMotion ? 0 : .12 + index * .2 }}>
                <span className="text-[var(--accent)]" aria-hidden="true">{index < 2 ? "✓" : "›"}</span>{line}
              </motion.p>)}
            </div>
            <div className="mt-5 h-1 overflow-hidden rounded-full bg-[var(--line)]" aria-hidden="true">
              <motion.div className="h-full rounded-full bg-[var(--accent)]" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: reduceMotion ? .2 : 1.1, ease: "easeInOut" }} />
            </div>
            <p className="mt-3 mb-0 font-[family-name:var(--font-mono)] text-[12px] text-[var(--dim)]">Explore work, projects, and tools.</p>
          </div>
        </motion.section>
      </motion.div>}
    </AnimatePresence>
  );
}
