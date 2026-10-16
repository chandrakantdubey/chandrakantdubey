import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { otherWork, workProjects } from "../portfolio";
import { SectionHeading } from "./SectionHeading";
import { ExternalArrow } from "./icons";
import { PAGE_CONTAINER } from "./layout";
import { WorkCard } from "./WorkCard";

const filters = [
  { label: "All", value: "all" },
  { label: "Enterprise", value: "enterprise" },
  { label: "Health", value: "wellness" },
  { label: "Community", value: "community" },
  { label: "Commerce", value: "commerce" },
] as const;

type Filter = (typeof filters)[number]["value"];

export function WorkSection() {
  const [filter, setFilter] = useState<Filter>("all");
  const [showMore, setShowMore] = useState(false);
  const reduceMotion = useReducedMotion();
  const visibleProjects = workProjects.filter((project) => filter === "all" || project.visual === filter);

  return (
    <section className={PAGE_CONTAINER + " scroll-mt-28 py-16 sm:py-20"} id="work">
      <SectionHeading number="01" label="Selected work" title="Products I’ve worked on" description="Enterprise software, health, community, and commerce products across web and mobile." />
      <div className="mb-5 flex flex-col gap-3 border-y border-[var(--line)] py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter professional work">
          {filters.map((item) => {
            const count = item.value === "all" ? workProjects.length : workProjects.filter((project) => project.visual === item.value).length;
            const selected = filter === item.value;
            return <motion.button key={item.value} className={"inline-flex min-h-10 items-center gap-2 rounded-md border px-2.5 text-[12px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-3 " + (selected ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--ink)]" : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[var(--panel)]")} type="button" aria-pressed={selected} onClick={() => setFilter(item.value)} whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: .98 }}>
              {item.label}<span className="text-[11px] text-[var(--dim)]">{count}</span>
            </motion.button>;
          })}
        </div>
        <p className="m-0 text-[12px] text-[var(--dim)]" aria-live="polite">{visibleProjects.length} {visibleProjects.length === 1 ? "project" : "projects"}</p>
      </div>
      <motion.div layout className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleProjects.map((project, index) => <WorkCard key={project.number} project={project} index={index} />)}
        </AnimatePresence>
      </motion.div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)]">
        <button className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-[var(--panel-raised)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)] sm:px-5" type="button" aria-expanded={showMore} onClick={() => setShowMore((open) => !open)}>
          <span className="text-[14px] font-semibold text-[var(--ink)]">{showMore ? "Hide additional work" : "Additional work"}</span>
          <motion.span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] text-[17px] text-[var(--accent)]" animate={{ rotate: showMore ? 45 : 0 }} aria-hidden="true">+</motion.span>
        </button>
        <AnimatePresence initial={false}>
          {showMore && <motion.div id="additional-work" className="grid gap-3 overflow-hidden border-t border-[var(--line)] p-3 sm:grid-cols-2 sm:p-4" initial={reduceMotion ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .28 }}>
            {otherWork.map((project) => <article className="min-w-0 rounded-md border border-[var(--line)] bg-[var(--page)] p-4" key={project.name}>
              <p className="m-0 text-[12px] font-medium text-[var(--dim)]">{project.type}</p>
              <h3 className="mt-1 text-[18px] font-semibold text-[var(--ink)]">{project.name}</h3>
              <p className="mt-2 text-[14px] leading-[1.65] text-[var(--muted)]">{project.description}</p>
              {project.url && <a className="mt-3 inline-flex min-h-8 items-center gap-1.5 text-[13px] font-semibold text-[var(--accent)]" href={project.url} target="_blank" rel="noreferrer">Visit website <ExternalArrow /></a>}
            </article>)}
          </motion.div>}
        </AnimatePresence>
      </div>
    </section>
  );
}
