import { type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { experience, profile } from "../portfolio";
import { SectionHeading } from "./SectionHeading";
import { PAGE_CONTAINER } from "./layout";

export function ExperienceSection() {
  const reduceMotion = useReducedMotion();
  const tones = ["var(--tone-enterprise)", "var(--tone-wellness)", "var(--tone-community)", "var(--tone-commerce)"];

  return (
    <section className={PAGE_CONTAINER + " grid scroll-mt-28 gap-7 border-t border-[var(--line)] py-12 sm:gap-9 sm:py-16 lg:grid-cols-[.8fr_1.2fr] lg:gap-14"} id="experience">
      <div>
        <SectionHeading number="03" label="Experience" title="Where I’ve worked" description="Professional roles across enterprise software, product engineering, and customer-facing applications." />
        <a className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--line-strong)] px-3.5 text-[13px] font-medium text-[var(--ink)] transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" href={profile.resume} target="_blank" rel="noreferrer">View résumé <span aria-hidden="true">↗</span></a>
      </div>

      <div className="relative grid min-w-0 gap-3">
        <motion.div className="absolute bottom-5 left-[9px] top-5 w-px origin-top bg-[var(--line-strong)]" initial={reduceMotion ? false : { scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true, amount: .15 }} transition={{ duration: reduceMotion ? 0 : .7 }} aria-hidden="true" />
        {experience.map((job, index) => (
          <motion.article
            className="relative min-w-0 rounded-lg border border-l-2 border-[var(--line)] border-l-[var(--experience-tone)] bg-[var(--panel)] p-4 pl-8 backdrop-blur-xl transition-colors hover:border-[var(--line-strong)] sm:p-5 sm:pl-9"
            style={{ "--experience-tone": tones[index % tones.length] } as CSSProperties}
            key={job.company}
            initial={reduceMotion ? false : { opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: .12 }}
            transition={{ duration: reduceMotion ? 0 : .32, delay: reduceMotion ? 0 : index * .045 }}
          >
            <motion.span className="absolute left-[3px] top-6 grid h-3.5 w-3.5 place-items-center rounded-full border border-[var(--experience-tone)] bg-[var(--page)]" aria-hidden="true">
              <motion.i className="h-1.5 w-1.5 rounded-full bg-[var(--experience-tone)]" animate={index === 0 && !reduceMotion ? { scale: [1, 1.3, 1] } : { scale: 1 }} transition={{ duration: 2.6, repeat: Infinity }} />
            </motion.span>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0"><h3 className="break-words text-[19px] font-semibold tracking-[-.02em] text-[var(--ink)]">{job.company}</h3><p className="mt-1 text-[13px] font-medium text-[var(--experience-tone)]">{job.role}</p></div>
              <span className="mt-1 shrink-0 text-[12px] leading-relaxed text-[var(--muted)] sm:text-right">{job.period}</span>
            </div>
            <p className="mt-3 text-[15px] leading-[1.6] text-[var(--muted)]">{job.summary}</p>
            <ul className="mt-3 grid gap-2">
              {job.highlights.map((highlight) => <li className="flex gap-2.5 text-[14px] leading-[1.6] text-[var(--muted)]" key={highlight}><span className="mt-[.5em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--experience-tone)]" aria-hidden="true" /><span>{highlight}</span></li>)}
            </ul>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
