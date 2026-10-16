import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { independentProjects, skills, workProjects } from "../portfolio";
import { SectionHeading } from "./SectionHeading";
import { PAGE_CONTAINER } from "./layout";

const projectIndex = [
  ...workProjects.map((project) => ({ name: project.title, tags: project.tags })),
  ...independentProjects.map((project) => ({ name: project.name, tags: project.tags })),
];

export function ToolkitSection() {
  const [activeSkill, setActiveSkill] = useState("React");
  const reduceMotion = useReducedMotion();
  const activeGroup = skills.find((group) => group.items.includes(activeSkill)) ?? skills[0];
  const relatedProjects = projectIndex.filter((project) => project.tags.includes(activeSkill));

  return (
    <section className="scroll-mt-28 border-y border-[var(--line)] bg-[var(--panel)] py-16 sm:py-20" id="skills">
      <div className={PAGE_CONTAINER}>
        <SectionHeading number="04" label="Skills" title="Technologies I work with" description="Select a technology to see where I’ve used it in project work." />
        <div className="grid gap-3 lg:grid-cols-3">
          {skills.map((group, index) => (
            <motion.article
              className="min-w-0 rounded-lg border border-[var(--line)] bg-[var(--page)] p-5 sm:p-6"
              key={group.category}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: .18 }}
              transition={{ duration: reduceMotion ? 0 : .34, delay: reduceMotion ? 0 : index * .055 }}
            >
              <p className="m-0 text-[12px] font-semibold text-[var(--accent)]">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-[19px] font-semibold tracking-[-.02em] text-[var(--ink)]">{group.category}</h3>
              <p className="mt-2 min-h-[48px] text-[14px] leading-[1.6] text-[var(--muted)]">{group.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={"Select a " + group.category + " skill"}>
                {group.items.map((item) => {
                  const selected = activeSkill === item;
                  return <motion.button
                    className={"min-h-9 rounded-md border px-2.5 py-1.5 text-[12px] leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] " + (selected ? "border-[var(--accent-line)] bg-[var(--accent-soft)] text-[var(--ink)]" : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:border-[var(--accent-line)] hover:text-[var(--ink)]")}
                    type="button"
                    key={item}
                    aria-pressed={selected}
                    onClick={() => setActiveSkill(item)}
                    whileHover={reduceMotion ? undefined : { y: -1 }}
                    whileTap={reduceMotion ? undefined : { scale: .97 }}
                  >{item}</motion.button>;
                })}
              </div>
            </motion.article>
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={activeSkill} className="mt-4 grid gap-3 rounded-lg border border-[var(--line)] bg-[var(--page)] p-5 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center sm:p-6" initial={reduceMotion ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -5 }} transition={{ duration: reduceMotion ? 0 : .2 }} aria-live="polite">
            <div><p className="m-0 text-[12px] text-[var(--dim)]">Selected technology</p><h3 className="mt-1 text-[17px] font-semibold text-[var(--ink)]">{activeSkill}</h3></div>
            <div className="min-w-0">
              <p className="m-0 text-[14px] leading-[1.6] text-[var(--muted)]">{activeGroup.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[12px] font-medium text-[var(--dim)]">Used in</span>
                {relatedProjects.length ? relatedProjects.map((project, index) => <motion.span className="rounded border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-[12px] text-[var(--muted)]" key={project.name} initial={reduceMotion ? false : { opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .025 }}>{project.name}</motion.span>) : <span className="text-[13px] text-[var(--muted)]">Used across my wider project work</span>}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
