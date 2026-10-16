import { motion, useReducedMotion } from "motion/react";
import type { workProjects } from "../portfolio";
import { ExternalArrow } from "./icons";
import { ProjectArtwork } from "./ProjectArtwork";

type WorkProject = (typeof workProjects)[number];

export function WorkCard({ project, index = 0 }: { project: WorkProject; index?: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.article
      layout
      className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)] transition-colors hover:border-[var(--accent-line)]"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 10 }}
      viewport={{ once: true, amount: .12 }}
      transition={{ duration: .38, delay: index * .055, ease: [.22, .72, .2, 1] }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
    >
      <ProjectArtwork type={project.visual} />
      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <p className="mb-2 text-[12px] font-semibold text-[var(--accent)]">{project.category}</p>
        <h3 className="text-[21px] font-semibold leading-[1.2] tracking-[-.03em] text-[var(--ink)] sm:text-[23px]">{project.title}</h3>
        <p className="mt-2 text-[13px] font-medium text-[var(--muted)]">{project.role}</p>
        <p className="mt-3 text-[14px] leading-[1.7] text-[var(--muted)]">{project.description}</p>
        {project.products && <ul className="mt-4 flex flex-wrap gap-2" aria-label="Product areas">{project.products.map((item) => <li className="rounded border border-[var(--line)] bg-[var(--page)] px-2.5 py-1.5 text-[11px] text-[var(--muted)]" key={item}>{item}</li>)}</ul>}
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2" aria-label="Technologies">{project.tags.map((tag) => <li className="text-[12px] text-[var(--dim)]" key={tag}>{tag}</li>)}</ul>
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--line)] pt-4">
          {project.links.length ? project.links.map((link) => <a className="inline-flex min-h-8 items-center gap-1.5 text-[13px] font-semibold text-[var(--accent)] hover:underline hover:underline-offset-4" key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}<ExternalArrow /></a>) : <span className="inline-flex min-h-8 items-center text-[12px] text-[var(--dim)]">{project.accessLabel}</span>}
        </div>
      </div>
    </motion.article>
  );
}
