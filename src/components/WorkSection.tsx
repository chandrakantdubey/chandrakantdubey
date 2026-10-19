import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { otherWork, workProjects } from "../portfolio";
import { SectionHeading } from "./SectionHeading";
import { ExternalArrow } from "./icons";
import { PAGE_CONTAINER } from "./layout";
import { WorkCard } from "./WorkCard";

const filters = [
  { label: "All", value: "all" },
  { label: "Enterprise", value: "enterprise" },
  { label: "Applied ML", value: "inference" },
  { label: "Real-time", value: "community" },
  { label: "Backend", value: "backend" },
] as const;

type Filter = (typeof filters)[number]["value"];

export function WorkSection() {
  const [filter, setFilter] = useState<Filter>("all");
  const [showMore, setShowMore] = useState(false);
  const reduceMotion = useReducedMotion();
  const visibleProjects = workProjects.filter((project) => filter === "all" || project.visual === filter);

  return (
    <section className={PAGE_CONTAINER + " scroll-mt-28 border-t border-[var(--line)] py-12 sm:py-16"} id="work">
      <SectionHeading number="01" label="Selected work" title="Systems built for real workflows" description="Enterprise applications, ML inference, real-time product work, and a backend project." />

      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-[var(--line)] bg-[var(--panel)] p-2 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter selected work">
          {filters.map((item) => {
            const selected = filter === item.value;
            return <motion.button key={item.value} className={"inline-flex min-h-11 shrink-0 items-center rounded-md border px-3 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] " + (selected ? "border-[var(--accent-line)] bg-[var(--accent-soft)] font-semibold text-[var(--ink)]" : "border-transparent text-[var(--muted)] hover:border-[var(--line)] hover:bg-[var(--panel-raised)]")} type="button" aria-pressed={selected} onClick={() => setFilter(item.value)} whileHover={reduceMotion ? undefined : { y: -1 }} whileTap={reduceMotion ? undefined : { scale: .98 }}>
              {item.label}
            </motion.button>;
          })}
        </div>
        <p className="m-0 px-2 font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)]" aria-live="polite">{String(visibleProjects.length).padStart(2, "0")} projects</p>
      </div>

      <motion.div layout className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibleProjects.map((project, index) => <WorkCard key={project.number} project={project} index={index} />)}
        </AnimatePresence>
      </motion.div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)]">
        <button id="additional-work-trigger" className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-[var(--panel-raised)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--focus)] sm:px-5" type="button" aria-expanded={showMore} aria-controls="additional-work" onClick={() => setShowMore((open) => !open)}>
          <span className="font-[family-name:var(--font-mono)] text-[13px] text-[var(--ink)]"><span className="mr-2 text-[var(--accent)]" aria-hidden="true">{showMore ? "−" : "+"}</span>{showMore ? "Hide additional work" : "More work"}</span>
          <motion.span className="grid h-8 w-8 place-items-center rounded border border-[var(--line)] text-[17px] text-[var(--accent)]" animate={{ rotate: showMore ? 45 : 0 }} aria-hidden="true">+</motion.span>
        </button>
        <div id="additional-work" role="region" aria-labelledby="additional-work-trigger" aria-hidden={!showMore}>
          <AnimatePresence initial={false}>
            {showMore && <motion.div className="grid gap-3 overflow-hidden border-t border-[var(--line)] p-3 sm:grid-cols-2 sm:p-4" initial={reduceMotion ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .28 }}>
              {otherWork.map((project, index) => <article className="min-w-0 rounded-md border border-l-2 border-[var(--line)] border-l-[var(--project-tone)] bg-[var(--page-elevated)] p-4" style={{ "--project-tone": ["var(--tone-wellness)", "var(--tone-commerce)", "var(--tone-community)", "var(--tone-enterprise)"][index] } as CSSProperties} key={project.name}>
                <p className="m-0 text-[12px] font-medium text-[var(--project-tone)]">{project.type}</p>
                <h3 className="mt-1 break-words text-[18px] font-semibold text-[var(--ink)]">{project.name}</h3>
                <p className="mt-2 text-[15px] leading-[1.6] text-[var(--muted)]">{project.description}</p>
                {project.links.length > 0 && <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {project.links.map((link) => <a className="inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-[var(--project-tone)] transition hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label}<ExternalArrow /></a>)}
                </div>}
              </article>)}
            </motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
