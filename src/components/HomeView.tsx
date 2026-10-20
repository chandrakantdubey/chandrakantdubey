import { motion, useReducedMotion } from "motion/react";
import { profile, workspaceProjects } from "../portfolio";
import { ArrowIcon, ExternalArrow } from "./icons";
import { DragonIllustration } from "./DragonIllustration";
import { InteractiveTerminal } from "./InteractiveTerminal";
import { Texture } from "./Texture";
import type { WorkspaceView } from "./navigation";

export function HomeView({ motionEnabled, onNavigate }: { motionEnabled: boolean; onNavigate: (view: WorkspaceView) => void }) {
  const reduceMotion = useReducedMotion();
  const animate = motionEnabled && !reduceMotion;
  const featured = [workspaceProjects[0], workspaceProjects[1], workspaceProjects[3]].filter(Boolean);

  function downloadResume() {
    const anchor = document.createElement("a");
    anchor.href = profile.resume;
    anchor.download = "Chandrakant_Dubey.pdf";
    anchor.click();
  }

  return <div className="mx-auto max-w-[1500px] px-4 pb-12 pt-7 sm:px-7 sm:pt-10 lg:px-10 lg:pt-12">
    <div className="mb-5 flex items-center gap-2 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.15em] text-[var(--dim)] sm:mb-7"><span className="text-[var(--accent)]">/</span> workspace <span className="text-[var(--line-strong)]">/</span> overview <span className="ml-auto hidden normal-case tracking-normal text-[var(--muted)] sm:inline">session: chandrakant@drakon</span></div>

    <section className="relative grid min-h-[560px] items-center overflow-hidden rounded-[28px] border border-[var(--line)] bg-[radial-gradient(ellipse_at_70%_42%,var(--dragon-soft),transparent_48%),linear-gradient(145deg,var(--page-elevated),var(--page)_65%)] px-5 py-9 sm:px-9 sm:py-12 md:grid-cols-[minmax(0,1.05fr)_minmax(230px,.95fr)] md:gap-2 lg:grid-cols-[1.02fr_.98fr] lg:px-12 lg:py-10">
      <Texture kind="scales" className="hidden -right-[12%] left-auto w-[72%] opacity-70 [mask-image:linear-gradient(110deg,transparent,black_52%,black)] sm:block" opacity={0.18} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/70 to-transparent" aria-hidden="true" />
      <div className="relative z-10 max-w-[700px]">
        <div className="mb-5">
          <motion.p className="m-0 inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] px-3.5 py-2 font-[family-name:var(--font-mono)] text-[12px] leading-relaxed tracking-wide text-[var(--accent)] sm:text-[13px]" initial={animate ? { y: 8 } : false} animate={{ y: 0 }} transition={{ duration: .55 }}><span className="h-2 w-2 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" /><span>CHANDRAKANT DUBEY</span><span className="text-[var(--dim)]">/</span><span>FULL-STACK ENGINEER</span></motion.p>
          <p className="mb-0 mt-2 pl-3 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.13em] text-[var(--dim)]">Backend systems <span className="text-[var(--accent)]">·</span> Applied AI</p>
        </div>
        <motion.h1 id="view-heading" tabIndex={-1} className="max-w-[720px] text-[clamp(2.2rem,5.5vw,5rem)] font-semibold leading-[.98] tracking-[-.055em] text-[var(--ink)] outline-none" initial={animate ? { y: 18 } : false} animate={{ y: 0 }} transition={{ duration: .72, delay: .08, ease: [.22, 1, .36, 1] }}>I build reliable systems <span className="text-[var(--accent)]">and the products around them.</span></motion.h1>
        <motion.p className="mt-6 max-w-[580px] text-[16px] leading-[1.75] text-[var(--muted)] sm:text-[18px]" initial={animate ? { y: 12 } : false} animate={{ y: 0 }} transition={{ duration: .6, delay: .18 }}>{profile.introduction}</motion.p>
        <motion.div className="mt-8 flex flex-wrap items-center gap-3" initial={animate ? { y: 8 } : false} animate={{ y: 0 }} transition={{ duration: .5, delay: .28 }}>
          <button type="button" onClick={() => onNavigate("work")} className={"group inline-flex min-h-12 items-center gap-3 rounded-xl bg-[var(--accent)] px-5 text-[14px] font-semibold text-[var(--accent-ink)] shadow-[0_10px_35px_var(--accent-soft)] transition focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--focus)] " + (motionEnabled ? "hover:-translate-y-0.5 hover:shadow-[0_16px_40px_var(--accent-soft)]" : "")} >Open workbench <span className="transition-transform group-hover:translate-x-1"><ArrowIcon /></span></button>
          <a href={profile.resume} download className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--line-strong)] bg-[var(--panel)]/65 px-4 text-[14px] font-medium text-[var(--ink)] transition hover:border-[var(--accent-line)] hover:bg-[var(--panel-raised)] focus-visible:outline-2 focus-visible:outline-[var(--focus)]">Download résumé <span className="text-[var(--accent)]" aria-hidden="true">↓</span></a>
        </motion.div>
        <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--line)] pt-5 text-[14px] text-[var(--muted)]">
          <span><span className="mr-2 text-[var(--accent)]">⌖</span>{profile.location}</span>
          <span><span className="mr-2 text-[var(--accent)]">◉</span>Full-stack · backend · applied AI</span>
        </div>
      </div>

      <div className="pointer-events-none absolute right-[-20%] top-[-2%] z-0 w-[90%] max-w-[360px] opacity-25 md:pointer-events-auto md:relative md:right-auto md:top-auto md:z-auto md:mx-auto md:mt-0 md:w-full md:max-w-[560px] md:opacity-100 lg:-mr-6 lg:scale-[1.1]">
        <div className="absolute left-[4%] top-[19%] z-10 hidden rounded-xl border border-[var(--line-strong)] bg-[var(--panel-solid)]/85 px-3 py-2 font-[family-name:var(--font-mono)] text-[11px] leading-relaxed text-[var(--muted)] shadow-[0_12px_35px_var(--shadow-glass)] backdrop-blur-md md:block sm:left-0 sm:text-[12px]"><span className="text-[var(--accent)]">01</span> &nbsp;systems that scale</div>
        <div className="absolute right-[2%] top-[39%] z-10 hidden rounded-xl border border-[var(--line-strong)] bg-[var(--panel-solid)]/85 px-3 py-2 font-[family-name:var(--font-mono)] text-[11px] leading-relaxed text-[var(--muted)] shadow-[0_12px_35px_var(--shadow-glass)] backdrop-blur-md md:block sm:text-[12px]"><span className="text-[var(--cyan)]">02</span> &nbsp;products with care</div>
        <div className="absolute bottom-[13%] left-[11%] z-10 hidden rounded-xl border border-[var(--line-strong)] bg-[var(--panel-solid)]/85 px-3 py-2 font-[family-name:var(--font-mono)] text-[11px] leading-relaxed text-[var(--muted)] shadow-[0_12px_35px_var(--shadow-glass)] backdrop-blur-md md:block sm:text-[12px]"><span className="text-[var(--ember)]">03</span> &nbsp;ideas made tangible</div>
        <DragonIllustration motionEnabled={motionEnabled} />
      </div>
    </section>

    <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(280px,.74fr)_minmax(0,1.26fr)]">
      <div className="relative isolate overflow-hidden rounded-[24px] border border-[var(--line)] bg-[linear-gradient(145deg,var(--panel),var(--page-elevated))] p-5 sm:p-7">
        <Texture kind="contours" className="hidden left-auto top-auto h-36 w-52 opacity-60 sm:block" opacity={0.2} />
        <div className="relative z-10">
        <div className="flex items-center justify-between gap-3"><div><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.15em] text-[var(--dim)]">Explore the workspace</p><h2 className="mb-0 mt-2 text-[24px] font-semibold tracking-[-.03em] text-[var(--ink)] sm:text-[28px]">A few open paths.</h2></div><span className="text-[28px] text-[var(--accent)]" aria-hidden="true">⌁</span></div>
        <div className="mt-6 divide-y divide-[var(--line)]">
          {[
            { title: "Workbench", detail: "Selected products and systems", view: "work" as const, glyph: "▤" },
            { title: "Journal", detail: "Roles, responsibilities, and dates", view: "journal" as const, glyph: "◷" },
            { title: "Packages", detail: "Tools used across the work", view: "packages" as const, glyph: "▧" },
          ].map((entry) => <button key={entry.view} type="button" onClick={() => onNavigate(entry.view)} className="group flex min-h-[68px] w-full items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-[var(--focus)]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line-strong)] bg-[var(--panel-raised)] text-[19px] text-[var(--accent)] transition group-hover:border-[var(--accent-line)] group-hover:bg-[var(--accent-soft)]">{entry.glyph}</span>
            <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold text-[var(--ink)]">{entry.title}</span><span className="mt-0.5 block text-[13px] text-[var(--muted)]">{entry.detail}</span></span>
            <span className="text-[var(--dim)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]"><ArrowIcon /></span>
          </button>)}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--line)] pt-4 text-[13px]">
          <a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-[var(--muted)] hover:text-[var(--accent)]">GitHub <ExternalArrow /></a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-[var(--muted)] hover:text-[var(--accent)]">LinkedIn <ExternalArrow /></a>
          <button type="button" onClick={() => onNavigate("contact")} className="ml-auto inline-flex min-h-11 items-center gap-1.5 font-semibold text-[var(--accent)]">Get in touch <ArrowIcon /></button>
        </div>
        </div>
      </div>
      <InteractiveTerminal onNavigate={onNavigate} onResume={downloadResume} motionEnabled={motionEnabled} />
    </section>

    <section className="mt-8" aria-labelledby="featured-heading">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3"><div><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.15em] text-[var(--dim)]">Selected directory</p><h2 id="featured-heading" className="mb-0 mt-2 text-[24px] font-semibold tracking-[-.03em] text-[var(--ink)] sm:text-[28px]">Work, at a glance.</h2></div><button type="button" onClick={() => onNavigate("work")} className="inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-[var(--accent)]">Browse workbench <ArrowIcon /></button></div>
      <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {featured.map((project, index) => project && <button key={project.id} type="button" onClick={() => { window.location.hash = `work/${project.id}`; }} className="group grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 py-4 text-left sm:grid-cols-[54px_minmax(0,1fr)_minmax(120px,.48fr)_auto] sm:gap-4 sm:py-5">
          <span className="font-[family-name:var(--font-mono)] text-[12px] text-[var(--dim)]">0{index + 1}</span>
          <span className="min-w-0"><span className="block truncate text-[16px] font-semibold text-[var(--ink)] group-hover:text-[var(--accent)]">{project.name}</span><span className="mt-1 block line-clamp-2 text-[14px] leading-relaxed text-[var(--muted)]">{project.summary}</span></span>
          <span className="hidden text-[13px] text-[var(--dim)] sm:block">{project.group === "independent" ? "Independent" : project.group === "enterprise" ? "Enterprise systems" : "Product delivery"}</span>
          <span className="text-[var(--dim)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]"><ArrowIcon /></span>
        </button>)}
      </div>
    </section>

    <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-5 text-[13px] text-[var(--dim)]"><span>DRAKON · Personal engineering workspace</span><span>Built with React, Tailwind, and Motion</span></footer>
  </div>;
}
