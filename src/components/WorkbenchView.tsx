import { motion, useReducedMotion } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { projectGroups, workspaceProjects, type ProjectGroup } from "../portfolio";
import { ExternalArrow } from "./icons";

export function WorkbenchView({ selectedProjectId, onSelect, motionEnabled }: { selectedProjectId?: string; onSelect: (projectId: string) => void; motionEnabled: boolean }) {
  const reduceMotion = useReducedMotion();
  const [mobileListOpen, setMobileListOpen] = useState(!selectedProjectId);
  const detailRef = useRef<HTMLElement>(null);
  const selected = workspaceProjects.find((project) => project.id === selectedProjectId) ?? workspaceProjects[0];
  const projectsByGroup = (group: ProjectGroup) => workspaceProjects.filter((project) => project.group === group);

  useEffect(() => {
    setMobileListOpen(!selectedProjectId);
    if (!selectedProjectId || !window.matchMedia("(max-width: 767px)").matches) return;
    const timer = window.setTimeout(() => detailRef.current?.scrollIntoView({ behavior: motionEnabled && !reduceMotion ? "smooth" : "auto", block: "start" }), 80);
    return () => window.clearTimeout(timer);
  }, [motionEnabled, reduceMotion, selectedProjectId]);

  return <div className="mx-auto max-w-[1500px] px-4 pb-14 pt-8 sm:px-7 sm:pt-10 lg:px-10">
    <div className="mb-5 flex items-center gap-2 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.15em] text-[var(--dim)]"><span className="text-[var(--accent)]">/</span> workspace <span className="text-[var(--line-strong)]">/</span> workbench</div>
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-6 sm:mb-8 sm:pb-7"><div><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.16em] text-[var(--accent)]">Selected engineering work</p><h1 id="view-heading" tabIndex={-1} className="mb-0 mt-2 text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-tight tracking-[-.045em] text-[var(--ink)] outline-none">Workbench</h1><p className="mb-0 mt-2 max-w-2xl text-[16px] leading-relaxed text-[var(--muted)] sm:text-[17px]">A file-browser view through enterprise systems, shipped products, and independent builds.</p></div><span className="rounded-full border border-[var(--line-strong)] bg-[var(--panel)] px-3 py-2 font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)]">~/work</span></header>

    <div className="grid items-start gap-5 md:grid-cols-[minmax(220px,.42fr)_minmax(0,1fr)] xl:grid-cols-[minmax(260px,.43fr)_minmax(0,1fr)]">
      <aside className={"rounded-[22px] border border-[var(--line)] bg-[var(--panel)] p-3 sm:p-4 " + (mobileListOpen ? "block " : "hidden ") + "md:block"} aria-label="Project files">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-2 pb-3"><h2 className="m-0 font-[family-name:var(--font-mono)] text-[13px] font-medium text-[var(--ink)]">FILES</h2><span className="text-[12px] text-[var(--dim)]">project tree</span></div>
        <div className="mt-2 space-y-1">
          {projectGroups.map((group) => <section key={group.id} className="pt-2">
            <div className="flex items-center justify-between gap-2 px-2 pb-1.5"><h3 className="m-0 text-[13px] font-semibold text-[var(--muted)]">{group.label}</h3><span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">{String(projectsByGroup(group.id).length).padStart(2, "0")}</span></div>
            <p className="m-0 px-2 pb-1.5 text-[12px] leading-relaxed text-[var(--dim)]">{group.hint}</p>
            <div className="space-y-0.5">
              {projectsByGroup(group.id).map((project) => <button key={project.id} type="button" onClick={() => onSelect(project.id)} aria-current={selected?.id === project.id ? "true" : undefined} className={"group flex min-h-[46px] w-full min-w-0 items-center gap-2.5 rounded-xl px-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-[var(--focus)] " + (selected?.id === project.id ? "bg-[var(--accent-soft)] text-[var(--ink)]" : "text-[var(--muted)] hover:bg-[var(--panel-raised)] hover:text-[var(--ink)]")}>
                <span className={"font-[family-name:var(--font-mono)] text-[13px] " + (selected?.id === project.id ? "text-[var(--accent)]" : "text-[var(--dim)]")} aria-hidden="true">{project.group === "labs" ? "◌" : "▱"}</span><span className="min-w-0 flex-1 truncate text-[14px]">{project.name}</span><span className="text-[11px] text-[var(--dim)]" aria-hidden="true">↗</span>
              </button>)}
            </div>
          </section>)}
        </div>
      </aside>

      {selected && <motion.article ref={detailRef} key={selected.id} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .24 }} className="scroll-mt-[130px] min-w-0 overflow-hidden rounded-[24px] border border-[var(--line-strong)] bg-[linear-gradient(145deg,var(--panel-solid),var(--page-elevated))] shadow-[0_20px_60px_var(--shadow-glass)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] px-5 py-3.5 font-[family-name:var(--font-mono)] text-[12px] text-[var(--dim)] sm:px-7"><span>~/work</span><span>/</span><span className="truncate text-[var(--accent)]">{selected.id}</span><button type="button" onClick={() => setMobileListOpen(true)} className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--line-strong)] px-3 font-sans text-[13px] font-medium text-[var(--muted)] md:hidden">Project files <span aria-hidden="true">↑</span></button><span className="ml-auto hidden rounded-full border border-[var(--line-strong)] px-2.5 py-1 text-[11px] md:inline-flex">{selected.stage ?? projectGroups.find((group) => group.id === selected.group)?.label}</span></div>
        <div className="p-5 sm:p-7 lg:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.14em] text-[var(--accent)]">{selected.role}</p><h2 className="mb-0 mt-3 max-w-4xl break-words text-[clamp(1.7rem,3.6vw,3.2rem)] font-semibold leading-[1.08] tracking-[-.045em] text-[var(--ink)]">{selected.name}</h2></div><div className="flex gap-2" aria-hidden="true"><span className="h-3 w-3 rounded-full bg-[var(--lime)]"/><span className="h-3 w-3 rounded-full bg-[var(--cyan)]"/><span className="h-3 w-3 rounded-full bg-[var(--ember)]"/></div></div>
          <p className="mb-0 mt-5 max-w-3xl text-[16px] leading-[1.8] text-[var(--muted)] sm:text-[18px]">{selected.summary}</p>

          {selected.diagram && <section className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--page)]/55 p-4 sm:p-6" aria-label={selected.diagram.caption}>
            <div className="mb-4 flex items-center justify-between gap-3"><h3 className="m-0 text-[14px] font-semibold text-[var(--ink)]">{selected.diagram.caption}</h3><span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wide text-[var(--dim)]">schematic</span></div>
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
              {selected.diagram.nodes.map((node, index) => <Fragment key={node}>
                <div className="flex min-h-[62px] min-w-0 flex-1 items-center gap-3 rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] px-3 py-2.5 xl:min-h-[76px] xl:flex-col xl:items-start xl:justify-between xl:p-3"><span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--accent)]">0{index + 1}</span><span className="min-w-0 text-[14px] font-medium leading-snug text-[var(--ink)]">{node}</span></div>
                {index < selected.diagram!.nodes.length - 1 && <span className="grid h-5 shrink-0 place-items-center text-[var(--accent)] xl:h-7 xl:w-7"><span className="xl:hidden">↓</span><span className="hidden xl:inline">→</span></span>}
              </Fragment>)}
            </div>
          </section>}

          {selected.stack.length > 0 && <section className="mt-7"><h3 className="mb-3 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.14em] text-[var(--dim)]">Tools in this build</h3><div className="flex flex-wrap gap-2">{selected.stack.map((tool) => <span key={tool} className="inline-flex min-h-9 items-center rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 text-[13px] text-[var(--muted)]">{tool}</span>)}</div></section>}

          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-5">
            {selected.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] px-4 text-[14px] font-medium text-[var(--ink)] transition hover:border-[var(--accent-line)] hover:bg-[var(--panel-raised)] focus-visible:outline-2 focus-visible:outline-[var(--focus)]">{link.label}<ExternalArrow /></a>)}
            {selected.access && <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-[var(--line-strong)] px-4 text-[13px] text-[var(--muted)]"><span className="text-[var(--ember)]">◈</span>{selected.access}</span>}
            {selected.stage && <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-[var(--line-strong)] px-4 text-[13px] text-[var(--muted)]"><span className="text-[var(--ember)]">◌</span>{selected.stage}</span>}
            {selected.links.length === 0 && !selected.access && !selected.stage && <span className="text-[14px] text-[var(--dim)]">No public link for this work.</span>}
          </div>
        </div>
      </motion.article>}
    </div>
    <footer className="mt-10 border-t border-[var(--line)] pt-4 text-[13px] text-[var(--dim)]">Architecture sketches are illustrative summaries of the work described above.</footer>
  </div>;
}
