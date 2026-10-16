import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { profile } from "../portfolio";
import { ArrowIcon, ExternalArrow } from "./icons";
import { PAGE_CONTAINER } from "./layout";

const layers = [
  { title: "Web interfaces", detail: "Responsive websites and app screens built with React, Next.js, and TypeScript." },
  { title: "Mobile apps", detail: "React Native applications for mobile workflows and device-specific features." },
  { title: "APIs & data", detail: "Node.js and Python APIs, relational databases, and real-time services." },
  { title: "Delivery", detail: "Docker, cloud infrastructure, and release workflows for production software." },
];

export function Hero() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [orbitRunning, setOrbitRunning] = useState(true);

  return (
    <section className={PAGE_CONTAINER + " scroll-mt-28 pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24"} id="top">
      <div className="grid items-center gap-10 md:grid-cols-[1.04fr_.96fr] md:gap-8 lg:gap-12">
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .58, ease: [.22, .72, .2, 1] }}>
          <p className="mb-5 flex items-center gap-2 text-[12px] font-semibold text-[var(--muted)] sm:text-[13px]">
            <motion.span className="h-2 w-2 rounded-full bg-[var(--accent)]" animate={reduceMotion ? undefined : { opacity: [.5, 1, .5] }} transition={{ duration: 2.8, repeat: Infinity }} />
            Full-stack engineer <span className="text-[var(--dim)]">·</span> {profile.location}
          </p>
          <h1 className="max-w-[600px] text-[clamp(44px,6vw,66px)] font-semibold leading-[1.04] tracking-[-.055em] text-[var(--ink)]">
            I build reliable <span className="text-[var(--accent)]">web and mobile products.</span>
          </h1>
          <p className="mt-6 max-w-[540px] text-[16px] leading-[1.75] text-[var(--muted)] sm:text-[18px]">
            I build React and TypeScript interfaces, APIs with Node.js and Python, and the data and delivery layers behind them.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <motion.a className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--accent-ink)] transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]" href="#work" whileHover={reduceMotion ? undefined : { y: -2 }} whileTap={reduceMotion ? undefined : { scale: .98 }}>
              View selected work <ArrowIcon />
            </motion.a>
            <a className="inline-flex min-h-12 items-center rounded-md border border-[var(--line-strong)] px-4 text-[14px] font-semibold text-[var(--ink)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]" href={profile.resume} download>Download résumé</a>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3" aria-label="Professional profiles">
            <a className="inline-flex min-h-8 items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] transition hover:text-[var(--accent)]" href={profile.github} target="_blank" rel="noreferrer">GitHub <ExternalArrow /></a>
            <a className="inline-flex min-h-8 items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] transition hover:text-[var(--accent)]" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn <ExternalArrow /></a>
            <a className="inline-flex min-h-8 items-center gap-1.5 text-[13px] font-medium text-[var(--muted)] transition hover:text-[var(--accent)]" href={"mailto:" + profile.email}>Email <ExternalArrow /></a>
          </div>
        </motion.div>

        <motion.aside className="relative rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-7" aria-label="Interactive overview of product engineering" initial={reduceMotion ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .66, delay: .1, ease: [.22, .72, .2, 1] }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="m-0 text-[12px] font-semibold text-[var(--accent)]">Product engineering</p>
              <h2 className="mt-1 text-[20px] font-semibold tracking-[-.025em] text-[var(--ink)] sm:text-[22px]">From interface to delivery</h2>
            </div>
            <button className="min-h-9 shrink-0 rounded-md border border-[var(--line)] px-3 text-[12px] font-medium text-[var(--muted)] transition hover:border-[var(--accent-line)] hover:text-[var(--ink)]" type="button" onClick={() => setOrbitRunning((value) => !value)} aria-pressed={orbitRunning}>{orbitRunning ? "Pause" : "Rotate"}</button>
          </div>
          <div className="my-7 grid grid-cols-[minmax(140px,.82fr)_minmax(0,1.18fr)] items-center gap-4 sm:gap-6">
            <div className="relative mx-auto grid aspect-square w-full max-w-[210px] place-items-center">
              <motion.div className="absolute inset-2 rounded-full border border-dashed border-[var(--line-strong)]" animate={reduceMotion || !orbitRunning ? undefined : { rotate: 360 }} transition={{ duration: 34, repeat: Infinity, ease: "linear" }} aria-hidden="true">
                <span className="absolute left-[calc(50%-5px)] top-0 h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-4 ring-[var(--panel)]" />
                <span className="absolute bottom-[13%] right-[8%] h-2 w-2 rounded-full bg-[var(--art-highlight)] ring-4 ring-[var(--panel)]" />
              </motion.div>
              <motion.div className="absolute inset-8 rounded-full border border-[var(--accent-line)]" animate={reduceMotion || !orbitRunning ? undefined : { rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} aria-hidden="true">
                <span className="absolute left-[18%] top-[15%] h-2 w-2 rounded-full bg-[var(--line-strong)]" />
              </motion.div>
              <motion.div className="relative z-10 grid h-[82px] w-[82px] place-items-center rounded-full border border-[var(--line)] bg-[var(--page)] text-[18px] font-semibold tracking-[-.05em] text-[var(--ink)] shadow-[0_10px_28px_rgba(0,0,0,.08)]" animate={reduceMotion ? undefined : { scale: [1, 1.025, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>CD</motion.div>
            </div>
            <div className="grid gap-1">
              {layers.map((layer, index) => <motion.button className={"grid min-h-[44px] grid-cols-[28px_minmax(0,1fr)] items-center gap-2 rounded-md border px-2.5 text-left transition-colors " + (active === index ? "border-[var(--accent-line)] bg-[var(--accent-soft)]" : "border-transparent hover:bg-[var(--page)]")} key={layer.title} type="button" aria-pressed={active === index} onClick={() => setActive(index)} whileHover={reduceMotion ? undefined : { x: 2 }}>
                <span className={"grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold " + (active === index ? "bg-[var(--accent)] text-[var(--accent-ink)]" : "bg-[var(--page)] text-[var(--dim)]")}>{index + 1}</span>
                <span className="text-[13px] font-medium text-[var(--ink)]">{layer.title}</span>
              </motion.button>)}
            </div>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={active} className="min-h-[48px] border-t border-[var(--line)] pt-4 text-[13px] leading-[1.65] text-[var(--muted)]" initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -4 }} transition={{ duration: .2 }} aria-live="polite">{layers[active].detail}</motion.p>
          </AnimatePresence>
        </motion.aside>
      </div>
      <div className="mt-12 flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-[13px] font-medium text-[var(--muted)]">Product work across web, mobile, backend services, and cloud delivery.</p>
        <a className="inline-flex min-h-9 items-center gap-2 text-[13px] font-semibold text-[var(--accent)] hover:underline hover:underline-offset-4" href="#contact">Open to full-stack roles <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}
