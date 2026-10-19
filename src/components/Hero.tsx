import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { profile } from "../portfolio";
import { ArrowIcon } from "./icons";
import { PAGE_CONTAINER } from "./layout";

const focusAreas = [
  { title: "Backend systems", detail: "Python, FastAPI, Node.js, SQL, and dependable APIs." },
  { title: "ML inference", detail: "Model execution integrated into enterprise workflows." },
  { title: "LLM + RAG patterns", detail: "A growing focus: retrieval, grounding, and useful AI products." },
  { title: "Cloud delivery", detail: "Docker, Linux, AWS EC2, and CI/CD workflows." },
];

const proofPoints = [
  { value: "3+ years", label: "software engineering" },
  { value: "Python + TypeScript", label: "core languages" },
  { value: "Enterprise + product", label: "across roles and projects" },
  { value: "ML inference", label: "enterprise platform work" },
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [orbitRunning, setOrbitRunning] = useState(true);

  return (
    <section className={PAGE_CONTAINER + " relative scroll-mt-32 pb-12 pt-6 sm:pb-16 sm:pt-10"} id="top">
      <div className="pointer-events-none absolute inset-x-4 top-6 h-[calc(100%-5rem)] overflow-hidden rounded-2xl sm:inset-x-6 sm:top-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_74%_20%,var(--accent-soft),transparent_55%)]" />
        <div className="absolute inset-0 hidden bg-[url('/dragon-scales.svg')] bg-repeat opacity-[.055] md:block" />
        <div className="absolute -right-24 top-16 hidden h-[min(50vw,560px)] w-[min(50vw,560px)] bg-[var(--accent)] opacity-[.045] [mask-image:url('/dragon-sigil.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] md:block" />
      </div>

      <div className="relative overflow-hidden rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] shadow-[var(--shadow-glass)] backdrop-blur-2xl">
        <div className="flex min-h-11 items-center justify-between gap-4 border-b border-[var(--line)] px-4 sm:px-6">
          <p className="m-0 font-[family-name:var(--font-mono)] text-[12px] text-[var(--dim)]"><span className="text-[var(--accent)]">$</span> cat ~/about.md</p>
          <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">profile / 01</span>
        </div>

        <div className="grid gap-8 p-5 sm:p-8 md:grid-cols-[1.08fr_.92fr] md:items-center md:gap-7 md:p-10 lg:gap-10 lg:p-12">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, ease: [.22, .72, .2, 1] }}>
            <p className="mb-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-[family-name:var(--font-mono)] text-[12px] font-medium tracking-[.04em] text-[var(--accent)] sm:text-[13px]">
              <motion.span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" animate={reduceMotion ? undefined : { opacity: [.62, 1, .62] }} transition={{ duration: 3, repeat: Infinity }} aria-hidden="true" />
              FULL STACK <span className="text-[var(--dim)]">/</span> BACKEND + APPLIED AI
            </p>
            <h1 className="max-w-[620px] text-[clamp(37px,5.8vw,64px)] font-semibold leading-[1.03] tracking-[-.055em] text-[var(--ink)]">
              I build useful software, from reliable APIs to AI-powered products.
            </h1>
            <p className="mt-5 max-w-[530px] text-[16px] leading-[1.7] text-[var(--muted)] sm:text-[17px]">
              I’m Chandrakant, a backend-focused full-stack engineer working across enterprise applications, ML inference, and cloud delivery. I care about clean architecture, dependable APIs, and products people can use.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <motion.a className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[var(--accent)] px-4 font-semibold text-[var(--accent-ink)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus)] sm:px-5" href="#work" whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: .98 }}>
                Explore selected work <ArrowIcon />
              </motion.a>
              <a className="inline-flex min-h-12 items-center rounded-md border border-[var(--line-strong)] px-4 font-medium text-[var(--ink)] transition hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" href={profile.resume} download>Download résumé</a>
              <a className="inline-flex min-h-12 items-center px-1 text-[14px] font-medium text-[var(--muted)] transition hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" href="#contact">Get in touch <span className="ml-1" aria-hidden="true">↗</span></a>
            </div>
          </motion.div>

          <motion.aside className="relative min-w-0 overflow-hidden rounded-lg border border-[var(--line-strong)] bg-[radial-gradient(ellipse_at_top_right,var(--accent-soft),transparent_58%),var(--panel-raised)] p-3.5 shadow-[var(--shadow-glass)] backdrop-blur-xl sm:p-5" aria-label="Engineering focus areas" initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .64, delay: .1, ease: [.22, .72, .2, 1] }}>
            <div className="pointer-events-none absolute inset-0 bg-[url('/dragon-scales.svg')] bg-repeat opacity-[.05] md:hidden" aria-hidden="true" />
            <div className="relative flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <p className="m-0 font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)]"><span className="text-[var(--accent)]">$</span> system.profile()</p>
              <button className="min-h-11 rounded-md border border-[var(--line)] px-3 font-[family-name:var(--font-mono)] text-[12px] text-[var(--dim)] transition hover:border-[var(--accent-line)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" type="button" onClick={() => setOrbitRunning((value) => !value)} aria-pressed={orbitRunning} aria-label={orbitRunning ? "Pause orbit animation" : "Resume orbit animation"}>{orbitRunning ? "pause" : "resume"}</button>
            </div>

            <div className="relative my-4 grid grid-cols-[minmax(0,.86fr)_minmax(0,1.14fr)] items-center gap-2 sm:gap-4">
              <div className="relative mx-auto grid aspect-square w-full max-w-[210px] place-items-center" aria-hidden="true">
                <motion.div className="absolute inset-1.5 rounded-full border border-dashed border-[var(--line-strong)]" animate={reduceMotion || !orbitRunning ? undefined : { rotate: 360 }} transition={{ duration: 34, repeat: Infinity, ease: "linear" }}>
                  <span className="absolute left-[calc(50%-5px)] top-0 h-2.5 w-2.5 rounded-full bg-[var(--lime)] shadow-[0_0_12px_var(--lime)]" />
                  <span className="absolute bottom-[13%] right-[8%] h-2 w-2 rounded-full bg-[var(--ember)]" />
                </motion.div>
                <motion.div className="absolute inset-[19%] rounded-full border border-[var(--accent-line)]" animate={reduceMotion || !orbitRunning ? undefined : { rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}>
                  <span className="absolute left-[18%] top-[15%] h-2 w-2 rounded-full bg-[var(--violet)]" />
                </motion.div>
                <motion.div className="relative z-10 grid h-[62px] w-[62px] place-items-center rounded-full border border-[var(--accent-line)] bg-[var(--panel-solid)] text-[var(--accent)] shadow-[0_0_35px_var(--accent-soft)] sm:h-[76px] sm:w-[76px]" animate={reduceMotion ? undefined : { scale: [1, 1.025, 1] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
                  <span className="h-8 w-8 bg-current [mask-image:url('/dragon-sigil.svg')] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain] sm:h-10 sm:w-10" />
                </motion.div>
              </div>

              <div className="grid min-w-0 gap-1.5">
                {focusAreas.map((area, index) => <motion.button className={"grid min-h-11 min-w-0 grid-cols-[25px_minmax(0,1fr)] items-center gap-2 rounded-md border px-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--focus)] sm:px-2 " + (active === index ? "border-[var(--accent-line)] bg-[var(--accent-soft)]" : "border-transparent hover:bg-[var(--panel)]")} key={area.title} type="button" aria-pressed={active === index} onClick={() => setActive(index)} whileHover={reduceMotion ? undefined : { x: 2 }}>
                  <span className={"grid h-6 w-6 place-items-center rounded font-[family-name:var(--font-mono)] text-[11px] font-semibold " + (active === index ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "bg-[var(--panel)] text-[var(--dim)]")}>{String(index + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 font-[family-name:var(--font-mono)] text-[11px] leading-tight text-[var(--ink)] sm:text-[12px]">{area.title}</span>
                </motion.button>)}
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={active} className="relative min-h-[48px] border-t border-[var(--line)] pt-3 font-[family-name:var(--font-mono)] text-[12px] leading-[1.55] text-[var(--muted)] sm:text-[13px]" initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -4 }} transition={{ duration: .2 }} aria-live="polite"><span className="mr-2 text-[var(--accent)]" aria-hidden="true">↳</span>{focusAreas[active].detail}</motion.div>
            </AnimatePresence>
          </motion.aside>
        </div>

        <div className="grid grid-cols-2 border-t border-[var(--line)] bg-[var(--page-elevated)]/70 sm:grid-cols-4">
          {proofPoints.map((point, index) => <div className={"min-w-0 px-4 py-3 sm:px-5 sm:py-4 " + (index % 2 === 1 ? "border-l border-[var(--line)] sm:border-l-0" : "") + (index > 1 ? " border-t border-[var(--line)] sm:border-t-0" : "") + (index > 0 ? " sm:border-l" : "")} key={point.label}>
            <p className="m-0 break-words text-[14px] font-semibold leading-tight text-[var(--ink)] sm:text-[15px]">{point.value}</p>
            <p className="mt-1 mb-0 text-[12px] leading-snug text-[var(--muted)]">{point.label}</p>
          </div>)}
        </div>
      </div>
    </section>
  );
}
