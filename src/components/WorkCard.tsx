import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { ProjectArtwork } from "./ProjectArtwork";
import { ExternalArrow } from "./icons";

const tones: Record<string, string> = {
  enterprise: "var(--tone-enterprise)",
  inference: "var(--tone-community)",
  community: "var(--tone-wellness)",
  backend: "var(--tone-commerce)",
};

export function WorkCard({ project, index }: { project: (typeof import("../portfolio"))["workProjects"][number]; index: number }) {
  const reduceMotion = useReducedMotion();
  const style = { "--project-tone": tones[project.visual] ?? "var(--accent)" } as CSSProperties;

  return (
    <motion.article
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow-glass)] transition-colors hover:border-[var(--line-strong)]"
      style={style}
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
      transition={{ duration: reduceMotion ? 0 : .24, delay: reduceMotion ? 0 : index * .035 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
    >
      <ProjectArtwork type={project.visual} />
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <p className="mb-2 break-words font-[family-name:var(--font-mono)] text-[12px] text-[var(--project-tone)]">{project.category}</p>
        <h3 className="text-[21px] font-semibold leading-[1.2] tracking-[-.03em] text-[var(--ink)] sm:text-[23px]">{project.title}</h3>
        <p className="mt-2 font-[family-name:var(--font-mono)] text-[12px] leading-[1.55] text-[var(--dim)]">{project.role}</p>
        <p className="mt-3 text-[15px] leading-[1.65] text-[var(--muted)]">{project.description}</p>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label={project.title + " technologies"}>{project.tags.map((tag) => <li className="rounded border border-[var(--line)] bg-[var(--page-elevated)] px-2.5 py-1.5 text-[12px] leading-tight text-[var(--muted)]" key={tag}>{tag}</li>)}</ul>
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-3">
          {project.links.length ? project.links.map((link) => <a className="inline-flex min-h-11 items-center gap-1.5 text-[13px] font-semibold text-[var(--project-tone)] transition hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}<ExternalArrow /></a>) : <span className="inline-flex min-h-11 items-center font-[family-name:var(--font-mono)] text-[12px] text-[var(--dim)]">{project.accessLabel}</span>}
        </div>
      </div>
    </motion.article>
  );
}
