import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { experiments, independentProjects } from "../portfolio";
import { SectionHeading } from "./SectionHeading";
import { ExternalArrow } from "./icons";
import { PAGE_CONTAINER } from "./layout";

const projectFilters = [
  { label: "All projects", value: "all" },
  { label: "Creative tools", value: "creative" },
  { label: "Fitness", value: "fitness" },
  { label: "Mobile", value: "mobile" },
] as const;

type ProjectFilter = (typeof projectFilters)[number]["value"];

const projectTone: Record<string, string> = {
  StyleScape: "var(--tone-community)",
  FitStream: "var(--tone-wellness)",
  MH15: "var(--tone-commerce)",
};

function ProjectBanner({ name, visual }: { name: string; visual: string }) {
  const toneStyle = { "--project-tone": projectTone[name] ?? "var(--accent)" } as CSSProperties;
  return (
    <div className="relative mb-4 flex h-[124px] items-center overflow-hidden rounded-md border border-[var(--line)] bg-[var(--panel-raised)] px-5" style={toneStyle} aria-hidden="true">
      <div className="absolute -right-6 -top-12 h-36 w-36 rounded-full bg-[var(--project-tone)] opacity-[.1] blur-3xl" />
      <span className="absolute right-3 top-3 font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">project / {name.toLowerCase()}</span>
      {visual === "stylescape" && <div className="relative grid grid-cols-4 gap-1.5 rounded-md border border-[var(--line)] bg-[var(--panel)] p-2.5">
        {["--project-tone", "--accent", "--ember", "--cyan", "--violet", "--cyan", "--project-tone", "--accent"].map((color, index) => <i className="h-5 w-5 rounded-sm" style={{ backgroundColor: `var(${color})` }} key={index} />)}
      </div>}
      {visual === "fitstream" && <div className="relative flex h-[72px] w-full max-w-[248px] items-end gap-1 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 pb-2 pt-5">
        <span className="absolute left-3 top-2 font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)]">activity</span>
        {[24, 36, 28, 45, 34, 52, 39, 48].map((height, index) => <motion.i className="min-w-0 flex-1 rounded-t-sm bg-[var(--project-tone)]" key={index} initial={{ height: 0 }} whileInView={{ height }} viewport={{ once: true }} transition={{ duration: .42, delay: index * .035 }} />)}
      </div>}
      {visual === "mh15" && <div className="relative w-[180px] rotate-[-2deg] rounded-md border border-[var(--line)] bg-[var(--panel)] p-3.5">
        <div className="space-y-2.5 border-l border-[var(--project-tone)]/60 pl-3"><i className="block h-1.5 w-4/5 rounded-full bg-[var(--line-strong)]" /><i className="block h-1.5 w-full rounded-full bg-[var(--line)]" /><i className="block h-1.5 w-3/5 rounded-full bg-[var(--project-tone)]" /></div>
        <svg className="absolute bottom-2 right-3 h-7 w-12 text-[var(--project-tone)]" viewBox="0 0 48 28" fill="none"><path d="M3 22c8-1 10-13 16-13 4 0 3 9 8 9s6-9 11-9 5 7 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </div>}
    </div>
  );
}

function ExperimentArtwork({ visual }: { visual: string }) {
  if (visual === "game") return <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
    {Array.from({ length: 15 }, (_, index) => <span className={"aspect-square rounded-sm border " + ([2, 7, 12].includes(index) ? "border-[var(--project-tone)] bg-[var(--accent-soft)]" : "border-[var(--line)] bg-[var(--panel)]")} key={index} />)}
  </div>;
  return <svg className="h-[70px] w-full text-[var(--project-tone)]" viewBox="0 0 260 70" fill="none" aria-hidden="true">
    {[20, 38, 56].map((y) => <path key={y} d={`M0 ${y}H260`} stroke="var(--line)" strokeWidth="1" strokeDasharray="3 5" />)}
    <motion.path d="M4 48C31 48 36 26 61 26s29 17 53 17 31-27 55-27 27 19 47 19 25-17 40-17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: .8 }} />
    {[61, 114, 169, 216].map((x, index) => <circle key={x} cx={x} cy={[26, 43, 16, 35][index]} r="3.5" fill="var(--panel-solid)" stroke="currentColor" strokeWidth="1.5" />)}
  </svg>;
}

export function ProjectsSection() {
  const [filter, setFilter] = useState<ProjectFilter>("all");
  const reduceMotion = useReducedMotion();
  const visibleProjects = independentProjects.filter((project) => {
    if (filter === "all") return true;
    if (filter === "creative") return project.category.toLowerCase().includes("creative");
    if (filter === "fitness") return project.category.toLowerCase().includes("fitness");
    return project.category.toLowerCase().includes("mobile") || project.category.toLowerCase().includes("android");
  });

  return (
    <section className="scroll-mt-28 border-y border-[var(--line)] bg-[var(--page-elevated)]/75 py-12 backdrop-blur-xl sm:py-16" id="projects">
      <div className={PAGE_CONTAINER}>
        <SectionHeading number="02" label="Projects" title="Independent builds" description="Small products with a clear purpose, from creative tools to mobile apps." />

        <div className="mb-5 flex flex-col gap-3 border-y border-[var(--line)] py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter independent projects">
            {projectFilters.map((item) => {
              const selected = filter === item.value;
              return <motion.button key={item.value} className={"inline-flex min-h-11 shrink-0 items-center rounded-md border px-3 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] " + (selected ? "border-[var(--accent-line)] bg-[var(--accent-soft)] font-semibold text-[var(--ink)]" : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[var(--panel-raised)]")} type="button" aria-pressed={selected} onClick={() => setFilter(item.value)} whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: .98 }}>
                {item.label}
              </motion.button>;
            })}
          </div>
          <p className="m-0 px-2 font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)]" aria-live="polite">{String(visibleProjects.length).padStart(2, "0")} projects</p>
        </div>

        <motion.div layout className="grid items-stretch gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleProjects.map((project, index) => <motion.article
              layout
              key={project.number}
              className="group flex min-w-0 flex-col rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[var(--shadow-glass)] backdrop-blur-xl transition-colors hover:border-[var(--line-strong)] sm:p-5"
              style={{ "--project-tone": projectTone[project.name] ?? "var(--accent)" } as CSSProperties}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: reduceMotion ? 0 : .26, delay: reduceMotion ? 0 : index * .04 }}
              whileHover={reduceMotion ? undefined : { y: -3 }}
            >
              <ProjectBanner name={project.name} visual={project.visual} />
              <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[var(--project-tone)] bg-[var(--panel-raised)] font-[family-name:var(--font-mono)] text-[17px] font-semibold text-[var(--project-tone)]">{project.name.slice(0, 1)}</span>
                <div className="min-w-0"><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] text-[var(--dim)]">project_{project.number}</p><p className="mt-0.5 text-[13px] text-[var(--muted)]">{project.category}</p></div>
              </div>
              <h3 className="mt-4 break-words text-[22px] font-semibold leading-tight tracking-[-.025em] text-[var(--ink)]">{project.name}</h3>
              <p className="mt-2 text-[15px] leading-[1.65] text-[var(--muted)]">{project.description}</p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label={project.name + " technologies"}>{project.tags.map((tag) => <li className="rounded border border-[var(--line)] bg-[var(--page-elevated)] px-2.5 py-1.5 text-[12px] text-[var(--muted)]" key={tag}>{tag}</li>)}</ul>
              <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--line)] pt-3">
                {project.links.map((link) => <a className="inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-[var(--project-tone)] transition hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label}<ExternalArrow /></a>)}
              </div>
            </motion.article>)}
          </AnimatePresence>
        </motion.div>

        <div className="mt-9">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line)] pb-3">
            <div><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] text-[var(--accent)]">currently building</p><h3 className="mt-1 text-[21px] font-semibold tracking-[-.025em] text-[var(--ink)]">In development</h3></div>
            <span className="text-[13px] text-[var(--muted)]">Early concepts, clearly marked.</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {experiments.map((item, index) => <motion.article className="grid min-w-0 grid-cols-[minmax(0,1fr)_88px] items-center gap-4 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 backdrop-blur-xl sm:grid-cols-[minmax(0,1fr)_112px] sm:p-5" style={{ "--project-tone": item.visual === "game" ? "var(--tone-community)" : "var(--tone-enterprise)" } as CSSProperties} key={item.name} initial={reduceMotion ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: reduceMotion ? 0 : .3, delay: reduceMotion ? 0 : index * .06 }}>
              <div className="min-w-0">
                <p className="m-0 font-[family-name:var(--font-mono)] text-[11px] font-semibold tracking-[.04em] text-[var(--project-tone)]">IN DEVELOPMENT</p>
                <h4 className="mt-1 break-words text-[18px] font-semibold text-[var(--ink)]">{item.name}</h4>
                <p className="mt-2 text-[14px] leading-[1.55] text-[var(--muted)]">{item.note}</p>
              </div>
              <ExperimentArtwork visual={item.visual} />
            </motion.article>)}
          </div>
        </div>
      </div>
    </section>
  );
}
