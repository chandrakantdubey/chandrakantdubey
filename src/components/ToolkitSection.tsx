import { useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { experience, independentProjects, skills, workProjects } from "../portfolio";
import { SectionHeading } from "./SectionHeading";
import { PAGE_CONTAINER } from "./layout";

const workIndex = [
  ...workProjects.map((project) => ({ name: project.title, tags: project.tags })),
  ...independentProjects.map((project) => ({ name: project.name, tags: project.tags })),
  ...experience.map((job) => ({ name: job.company, tags: job.technologies })),
];

const skillTones = ["var(--tone-enterprise)", "var(--tone-wellness)", "var(--tone-community)", "var(--tone-commerce)", "var(--tone-enterprise)", "var(--tone-community)"];

export function ToolkitSection() {
  const [activeSkill, setActiveSkill] = useState("FastAPI");
  const reduceMotion = useReducedMotion();
  const activeGroup = skills.find((group) => group.items.includes(activeSkill)) ?? skills[0];
  const relatedWork = workIndex.filter((project) => project.tags.includes(activeSkill));

  return (
    <section className="scroll-mt-28 border-y border-[var(--line)] bg-[var(--panel)] py-12 backdrop-blur-xl sm:py-16" id="skills">
      <div className={PAGE_CONTAINER}>
        <SectionHeading number="04" label="Stack" title="A practical engineering toolkit" description="Grouped by the work I do, with links between technologies and related projects." />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {skills.map((group, index) => (
            <motion.article
              className="min-w-0 rounded-lg border border-t-2 border-[var(--line)] border-t-[var(--skill-tone)] bg-[var(--panel-solid)]/55 p-4 backdrop-blur-xl sm:p-5"
              style={{ "--skill-tone": skillTones[index % skillTones.length] } as CSSProperties}
              key={group.category}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: .12 }}
              transition={{ duration: reduceMotion ? 0 : .32, delay: reduceMotion ? 0 : index * .04 }}
            >
              <div className="flex items-start gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-[var(--skill-tone)]" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="m-0 font-[family-name:var(--font-mono)] text-[12px] text-[var(--skill-tone)]">0{index + 1} / {group.category.toLowerCase().replaceAll(" & ", "_").replaceAll(" ", "_")}</p>
                  <h3 className="mt-1.5 text-[18px] font-semibold tracking-[-.02em] text-[var(--ink)]">{group.category}</h3>
                </div>
              </div>
              <p className="mt-2 min-h-[44px] text-[14px] leading-[1.55] text-[var(--muted)]">{group.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={"Select a " + group.category + " skill"}>
                {group.items.map((item) => {
                  const selected = activeSkill === item;
                  return <motion.button
                    className={"min-h-11 rounded-md border px-2.5 py-1.5 text-left text-[12px] leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] " + (selected ? "border-[var(--accent-line)] bg-[var(--accent-soft)] font-semibold text-[var(--ink)]" : "border-[var(--line)] bg-[var(--panel)] text-[var(--muted)] hover:border-[var(--accent-line)] hover:text-[var(--ink)]")}
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
          <motion.div key={activeSkill} className="mt-4 grid min-w-0 gap-3 rounded-lg border border-[var(--accent-line)] bg-[var(--panel-raised)] p-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-center sm:p-5" initial={reduceMotion ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -5 }} transition={{ duration: reduceMotion ? 0 : .2 }} aria-live="polite">
            <div><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] text-[var(--dim)]">selected skill</p><h3 className="mt-1 break-words text-[17px] font-semibold text-[var(--ink)]">{activeSkill}</h3></div>
            <div className="min-w-0">
              <p className="m-0 text-[15px] leading-[1.6] text-[var(--muted)]">{activeSkill === "LLM patterns" || activeSkill === "RAG fundamentals" ? "A current learning focus; no production RAG project is presented here." : activeGroup.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[12px] font-medium text-[var(--muted)]">Related work</span>
                {relatedWork.length ? relatedWork.map((project, index) => <motion.span className="rounded border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-[12px] text-[var(--muted)]" key={project.name} initial={reduceMotion ? false : { opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .18, delay: index * .025 }}>{project.name}</motion.span>) : <span className="text-[13px] text-[var(--muted)]">No public project listed for this skill yet.</span>}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
