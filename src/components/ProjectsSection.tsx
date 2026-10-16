import { useState } from "react";
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

const marks: Record<string, string> = {
  "StyleScape": "S",
  "FitStream": "F",
  "MH15": "M",
  "Pokédex RPG": "P",
};

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
    <section className="scroll-mt-28 border-y border-[var(--line)] bg-[var(--panel)] py-16 sm:py-20" id="projects">
      <div className={PAGE_CONTAINER}>
        <SectionHeading number="02" label="Personal projects" title="Software I’ve built independently" description="A creative tool, fitness companion, notebook, and mobile RPG, each built around a different product idea." />

        <div className="mb-5 flex flex-col gap-3 border-y border-[var(--line)] py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter independent projects">
            {projectFilters.map((item) => {
              const count = item.value === "all" ? independentProjects.length : independentProjects.filter((project) => item.value === "creative" ? project.category.toLowerCase().includes("creative") : item.value === "fitness" ? project.category.toLowerCase().includes("fitness") : project.category.toLowerCase().includes("mobile") || project.category.toLowerCase().includes("android")).length;
              const selected = filter === item.value;
              return <motion.button key={item.value} className={"inline-flex min-h-10 items-center gap-2 rounded-md border px-2.5 text-[12px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-3 " + (selected ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--ink)]" : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[var(--page)]")} type="button" aria-pressed={selected} onClick={() => setFilter(item.value)} whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: .98 }}>
                {item.label}<span className="text-[11px] text-[var(--dim)]">{count}</span>
              </motion.button>;
            })}
          </div>
          <p className="m-0 text-[12px] text-[var(--dim)]" aria-live="polite">{visibleProjects.length} {visibleProjects.length === 1 ? "project" : "projects"}</p>
        </div>

        <motion.div layout className="grid items-stretch gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleProjects.map((project, index) => <motion.article
              layout
              key={project.number}
              className="group flex min-w-0 flex-col rounded-lg border border-[var(--line)] bg-[var(--page)] p-5 transition-colors hover:border-[var(--accent-line)] sm:p-6"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: reduceMotion ? 0 : .3, delay: reduceMotion ? 0 : index * .04 }}
              whileHover={reduceMotion ? undefined : { y: -3 }}
            >
              <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
                <motion.span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--accent-soft)] text-[17px] font-semibold text-[var(--accent)]" whileHover={reduceMotion ? undefined : { rotate: -5, scale: 1.04 }}>{marks[project.name] ?? project.name.slice(0, 1)}</motion.span>
                <div className="min-w-0"><p className="m-0 text-[12px] font-medium text-[var(--dim)]">Project {project.number}</p><p className="mt-0.5 text-[13px] font-medium text-[var(--muted)]">{project.category}</p></div>
              </div>
              <h3 className="mt-4 text-[22px] font-semibold leading-tight tracking-[-.025em] text-[var(--ink)]">{project.name}</h3>
              <p className="mt-2 text-[14px] leading-[1.7] text-[var(--muted)]">{project.description}</p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label={project.name + " technologies"}>{project.tags.map((tag) => <li className="rounded border border-[var(--line)] px-2.5 py-1.5 text-[12px] text-[var(--muted)]" key={tag}>{tag}</li>)}</ul>
              <div className="mt-auto flex flex-wrap gap-4 border-t border-[var(--line)] pt-4">
                {project.links.map((link) => <a className="inline-flex min-h-8 items-center gap-1.5 text-[13px] font-semibold text-[var(--accent)] hover:underline hover:underline-offset-4" href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label}<ExternalArrow /></a>)}
              </div>
            </motion.article>)}
          </AnimatePresence>
        </motion.div>

        <div className="mt-9">
          <div className="mb-4 flex items-end justify-between gap-4 border-b border-[var(--line)] pb-3">
            <div><p className="m-0 text-[12px] font-semibold text-[var(--accent)]">In development</p><h3 className="mt-1 text-[21px] font-semibold tracking-[-.025em] text-[var(--ink)]">Current projects</h3></div>
            <span className="text-[12px] text-[var(--dim)]">Private repositories</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {experiments.map((item, index) => <motion.article className="rounded-lg border border-[var(--line)] bg-[var(--page)] p-4 sm:p-5" key={item.name} initial={reduceMotion ? false : { opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .32, delay: index * .06 }}>
              <p className="m-0 text-[12px] font-medium text-[var(--dim)]">{item.type === "GAME DESIGN" ? "Game design" : "Agriculture data"}</p>
              <h4 className="mt-1 text-[18px] font-semibold text-[var(--ink)]">{item.name}</h4>
              <p className="mt-2 text-[14px] leading-[1.65] text-[var(--muted)]">{item.note}</p>
            </motion.article>)}
          </div>
        </div>

      </div>
    </section>
  );
}
