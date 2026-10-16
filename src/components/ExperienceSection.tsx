import { motion, useReducedMotion } from "motion/react";
import { experience, profile } from "../portfolio";
import { SectionHeading } from "./SectionHeading";
import { PAGE_CONTAINER } from "./layout";

export function ExperienceSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className={PAGE_CONTAINER + " grid scroll-mt-28 gap-8 py-16 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-16"} id="experience">
      <div>
        <SectionHeading number="03" label="Experience" title="Engineering roles" description="Full-stack and frontend roles across enterprise software, wellness, community, and commerce." />
        <a className="inline-flex min-h-10 items-center rounded-md border border-[var(--line-strong)] px-3.5 text-[13px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]" href={profile.resume} target="_blank" rel="noreferrer">View résumé</a>
      </div>
      <div className="relative grid gap-3">
        <motion.div className="absolute bottom-5 left-[9px] top-5 w-px origin-top bg-[var(--line-strong)]" initial={reduceMotion ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .7 }} aria-hidden="true" />
        {experience.map((job, index) => (
          <motion.article
            className="relative rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 pl-8 transition-colors hover:border-[var(--accent-line)] sm:p-5 sm:pl-9"
            key={job.company}
            initial={reduceMotion ? false : { opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: .18 }}
            transition={{ duration: reduceMotion ? 0 : .34, delay: reduceMotion ? 0 : index * .05 }}
          >
            <motion.span className="absolute left-[3px] top-6 grid h-3.5 w-3.5 place-items-center rounded-full border border-[var(--line-strong)] bg-[var(--page)]" animate={{ borderColor: index === 0 ? "var(--accent)" : "var(--line-strong)" }} aria-hidden="true">
              <motion.i className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" animate={index === 0 && !reduceMotion ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 2.4, repeat: Infinity }} />
            </motion.span>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div><h3 className="text-[19px] font-semibold tracking-[-.02em] text-[var(--ink)]">{job.company}</h3><p className="mt-1 text-[13px] font-medium text-[var(--accent)]">{job.role}</p></div>
              <span className="mt-1 shrink-0 text-[12px] font-medium text-[var(--dim)] sm:text-right">{job.period}</span>
            </div>
            <p className="mt-3 text-[14px] leading-[1.7] text-[var(--muted)]">{job.summary}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
