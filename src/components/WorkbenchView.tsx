import { motion, useReducedMotion } from "motion/react";
import { Fragment } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { projectGroups, workspaceProjects, type ProjectGroup, type WorkspaceProject } from "../portfolio";
import { ExternalArrow } from "./icons";
import { Texture, type TextureKind } from "./Texture";

function ProjectDiagram({ diagram }: { diagram: NonNullable<WorkspaceProject["diagram"]> }) {
  if (diagram.kind === "branch") {
    const branches = diagram.nodes.slice(1);
    const count = branches.length;
    const centers = branches.map((_, index) => 600 * (index + 0.5) / count);
    const paths = centers.length > 0
      ? [`M300 0V20H${centers[0]}`, `M${centers[0]} 20H${centers[centers.length - 1]}`, ...centers.map((center) => `M${center} 20V48`)].join(" ")
      : "";

    return <div>
      <NodeCard label={diagram.nodes[0]} index={0} />
      <div className="my-2 flex justify-center text-[var(--accent)] md:hidden" aria-hidden="true">↓</div>
      <svg className="hidden h-10 w-full overflow-visible md:block" viewBox="0 0 600 48" preserveAspectRatio="none" aria-hidden="true">
        <path d={paths} fill="none" stroke="var(--accent)" strokeOpacity=".55" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="grid gap-2 border-l border-[var(--accent-line)] pl-3 md:grid-cols-3 md:border-l-0 md:pl-0">
        {branches.map((node, index) => <NodeCard key={node} label={node} index={index + 1} />)}
      </div>
    </div>;
  }

  if (diagram.kind === "layers") {
    return <div className="relative space-y-2 before:absolute before:bottom-4 before:left-[22px] before:top-4 before:w-px before:bg-[var(--accent-line)]">
      {diagram.nodes.map((node, index) => <div key={node} className="relative flex min-h-[58px] items-center gap-3 rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] px-3 py-2.5" style={{ marginLeft: `${index * 0.55}rem` }}>
        <span className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[var(--accent-line)] bg-[var(--panel-raised)] font-[family-name:var(--font-mono)] text-[11px] text-[var(--accent)]">0{index + 1}</span>
        <span className="text-[14px] font-medium text-[var(--ink)]">{node}</span>
        {index === diagram.nodes.length - 1 && <span className="ml-auto font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wide text-[var(--dim)]">data layer</span>}
      </div>)}
    </div>;
  }

  return <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_24px_minmax(0,1fr)_24px_minmax(0,1fr)_24px_minmax(0,1fr)] md:items-stretch">
    {diagram.nodes.map((node, index) => <Fragment key={node}>
      <NodeCard label={node} index={index} />
      {index < diagram.nodes.length - 1 && <span className="grid h-5 place-items-center text-[var(--accent)] md:hidden" aria-hidden="true">↓</span>}
      {index < diagram.nodes.length - 1 && <span className="hidden place-items-center text-[var(--accent)] md:grid" aria-hidden="true">→</span>}
    </Fragment>)}
  </div>;
}

function NodeCard({ label, index }: { label: string; index: number }) {
  return <div className="flex min-h-[62px] min-w-0 items-center gap-3 rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] px-3 py-2.5 md:min-h-[76px] md:flex-col md:items-start md:justify-between md:p-3">
    <span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--accent)]">{String(index + 1).padStart(2, "0")}</span>
    <span className="min-w-0 text-[14px] font-medium leading-snug text-[var(--ink)]">{label}</span>
  </div>;
}

export function WorkbenchView({ selectedProjectId, onSelect, motionEnabled }: { selectedProjectId?: string; onSelect: (projectId: string) => void; motionEnabled: boolean }) {
  const reduceMotion = useReducedMotion();
  const [mobileListOpen, setMobileListOpen] = useState(!selectedProjectId);
  const [query, setQuery] = useState("");
  const detailRef = useRef<HTMLElement>(null);
  const selected = workspaceProjects.find((project) => project.id === selectedProjectId) ?? workspaceProjects[0];
  const projectsByGroup = (group: ProjectGroup) => workspaceProjects.filter((project) => project.group === group);
  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return workspaceProjects.filter((project) => !normalizedQuery || [project.name, project.summary, ...project.stack].join(" ").toLowerCase().includes(normalizedQuery));
  }, [query]);
  const selectedIndex = selected ? workspaceProjects.findIndex((project) => project.id === selected.id) : -1;
  const previousProject = workspaceProjects[(selectedIndex - 1 + workspaceProjects.length) % workspaceProjects.length];
  const nextProject = workspaceProjects[(selectedIndex + 1) % workspaceProjects.length];
  const groupName = projectGroups.find((group) => group.id === selected?.group)?.label ?? "Project";
  const textureKind: TextureKind = selected?.group === "enterprise" ? "circuit" : selected?.group === "product" ? "scales" : selected?.group === "independent" ? "grid" : "dots";

  useEffect(() => {
    setMobileListOpen(!selectedProjectId);
    if (!selectedProjectId || !window.matchMedia("(max-width: 767px)").matches) return;
    const timer = window.setTimeout(() => detailRef.current?.scrollIntoView({ behavior: motionEnabled && !reduceMotion ? "smooth" : "auto", block: "start" }), 80);
    return () => window.clearTimeout(timer);
  }, [motionEnabled, reduceMotion, selectedProjectId]);

  return <div className="mx-auto max-w-[1500px] px-4 pb-14 pt-8 sm:px-7 sm:pt-10 lg:px-10">
    <div className="mb-5 flex items-center gap-2 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.15em] text-[var(--dim)]"><span className="text-[var(--accent)]">/</span> workspace <span className="text-[var(--line-strong)]">/</span> workbench</div>
    <header className="relative mb-7 overflow-hidden border-b border-[var(--line)] pb-6 sm:mb-8 sm:pb-7">
      <Texture kind="grid" className="hidden left-auto right-0 h-full w-[40%] opacity-50 sm:block" opacity={0.14} />
      <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
        <div><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.16em] text-[var(--accent)]">Selected engineering work</p><h1 id="view-heading" tabIndex={-1} className="mb-0 mt-2 text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-tight tracking-[-.045em] text-[var(--ink)] outline-none">Workbench</h1><p className="mb-0 mt-2 max-w-2xl text-[16px] leading-relaxed text-[var(--muted)] sm:text-[17px]">Explore shipped products, enterprise systems, and independent builds through their scope and simplified architecture.</p></div>
        <div className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--panel)]/80 px-3 py-2.5 font-[family-name:var(--font-mono)] text-[12px] text-[var(--muted)]"><span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />{workspaceProjects.length} projects <span className="text-[var(--line-strong)]">·</span> ~/work</div>
      </div>
    </header>

    <div className="grid items-start gap-5 md:grid-cols-[minmax(230px,.42fr)_minmax(0,1fr)] xl:grid-cols-[minmax(270px,.43fr)_minmax(0,1fr)]">
      <aside className={"relative isolate overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--panel)] p-3 sm:p-4 " + (mobileListOpen ? "block " : "hidden ") + "md:block"} aria-label="Project files">
        <Texture kind="dots" className="hidden left-auto h-40 w-40 opacity-40 sm:block" opacity={0.14} />
        <div className="relative z-10">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-2 pb-3"><h2 className="m-0 font-[family-name:var(--font-mono)] text-[13px] font-medium text-[var(--ink)]">PROJECT FILES</h2><span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">{String(visibleProjects.length).padStart(2, "0")} / {String(workspaceProjects.length).padStart(2, "0")}</span></div>
          <label className="mt-3 flex min-h-11 items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--page)]/65 px-3 focus-within:border-[var(--accent-line)]"><span className="text-[var(--accent)]" aria-hidden="true">⌕</span><span className="sr-only">Filter project files</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a project or tool" className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--ink)] outline-none placeholder:text-[var(--dim)]" /></label>
          <div className="mt-2 space-y-1">
            {projectGroups.map((group) => {
              const projects = projectsByGroup(group.id).filter((project) => visibleProjects.some((visible) => visible.id === project.id));
              if (projects.length === 0) return null;
              return <section key={group.id} className="pt-2">
                <div className="flex items-center justify-between gap-2 px-2 pb-1.5"><h3 className="m-0 text-[13px] font-semibold text-[var(--muted)]">{group.label}</h3><span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">{String(projects.length).padStart(2, "0")}</span></div>
                <div className="space-y-0.5">{projects.map((project) => <button key={project.id} type="button" onClick={() => onSelect(project.id)} aria-current={selected?.id === project.id ? "true" : undefined} className={"group flex min-h-[46px] w-full min-w-0 items-center gap-2.5 rounded-xl px-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-[var(--focus)] " + (selected?.id === project.id ? "bg-[var(--accent-soft)] text-[var(--ink)]" : "text-[var(--muted)] hover:bg-[var(--panel-raised)] hover:text-[var(--ink)]")}>
                  <span className={"font-[family-name:var(--font-mono)] text-[13px] " + (selected?.id === project.id ? "text-[var(--accent)]" : "text-[var(--dim)]")} aria-hidden="true">{project.group === "labs" ? "◌" : "▱"}</span><span className="min-w-0 flex-1 truncate text-[14px]">{project.name}</span><span className="text-[11px] text-[var(--dim)]" aria-hidden="true">↗</span>
                </button>)}</div>
              </section>;
            })}
            {visibleProjects.length === 0 && <p className="px-2 py-4 text-[14px] text-[var(--muted)]">No project matches “{query}”.</p>}
          </div>
        </div>
      </aside>

      {selected && <motion.article ref={detailRef} key={selected.id} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .24 }} className="relative isolate scroll-mt-[130px] min-w-0 overflow-hidden rounded-[24px] border border-[var(--line-strong)] bg-[linear-gradient(145deg,var(--panel-solid),var(--page-elevated))] shadow-[0_20px_60px_var(--shadow-glass)]">
        <Texture kind={textureKind} className="hidden left-auto top-auto h-56 w-72 opacity-50 sm:block" opacity={0.18} />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] px-5 py-3.5 font-[family-name:var(--font-mono)] text-[12px] text-[var(--dim)] sm:px-7"><span>~/work</span><span>/</span><span className="truncate text-[var(--accent)]">{selected.id}</span><button type="button" onClick={() => setMobileListOpen(true)} className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--line-strong)] px-3 font-sans text-[13px] font-medium text-[var(--muted)] md:hidden">Project files <span aria-hidden="true">↑</span></button><span className="ml-auto hidden rounded-full border border-[var(--line-strong)] px-2.5 py-1 text-[11px] md:inline-flex">{selected.stage ?? groupName}</span></div>
          <div className="p-5 sm:p-7 lg:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.14em] text-[var(--accent)]">{selected.role}</p><h2 className="mb-0 mt-3 max-w-4xl break-words text-[clamp(1.7rem,3.6vw,3.2rem)] font-semibold leading-[1.08] tracking-[-.045em] text-[var(--ink)]">{selected.name}</h2></div><div className="flex gap-2" aria-hidden="true"><span className="h-3 w-3 rounded-full bg-[var(--lime)]"/><span className="h-3 w-3 rounded-full bg-[var(--cyan)]"/><span className="h-3 w-3 rounded-full bg-[var(--ember)]"/></div></div>
            <p className="mb-0 mt-5 max-w-3xl text-[16px] leading-[1.8] text-[var(--muted)] sm:text-[18px]">{selected.summary}</p>

            {selected.capabilities && <section className="mt-7"><div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h3 className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.14em] text-[var(--dim)]">Areas represented</h3><span className="text-[12px] text-[var(--dim)]">Project scope</span></div><div className="grid gap-2 sm:grid-cols-2">{selected.capabilities.map((capability, index) => <div key={capability} className="flex min-h-[48px] items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)]/80 px-3 py-2"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] font-[family-name:var(--font-mono)] text-[10px] text-[var(--accent)]">{String(index + 1).padStart(2, "0")}</span><span className="text-[14px] leading-snug text-[var(--ink)]">{capability}</span></div>)}</div></section>}

            {selected.diagram && <section className="mt-7 rounded-2xl border border-[var(--line)] bg-[var(--page)]/55 p-4 sm:p-6" aria-label={selected.diagram.caption}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h3 className="m-0 text-[15px] font-semibold text-[var(--ink)]">{selected.diagram.caption}</h3><p className="mb-0 mt-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[.14em] text-[var(--dim)]">{selected.diagram.kind === "branch" ? "Product map" : selected.diagram.kind === "layers" ? "Layer view" : "Request / activity flow"}</p></div><span className="rounded-full border border-[var(--accent-line)] bg-[var(--accent-soft)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wide text-[var(--accent)]">Illustrative</span></div>
              <ProjectDiagram diagram={selected.diagram} />
              {selected.diagram.note && <p className="mb-0 mt-4 border-t border-[var(--line)] pt-3 text-[13px] leading-relaxed text-[var(--dim)]">{selected.diagram.note}</p>}
            </section>}

            {selected.stack.length > 0 && <section className="mt-7"><div className="mb-3 flex items-baseline justify-between gap-3"><h3 className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.14em] text-[var(--dim)]">Tools in this build</h3><span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">{String(selected.stack.length).padStart(2, "0")} recorded</span></div><div className="flex flex-wrap gap-2">{selected.stack.map((tool, index) => <span key={tool} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 text-[13px] text-[var(--muted)]"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ["var(--accent)", "var(--cyan)", "var(--ember)", "var(--violet)"][index % 4] }} />{tool}</span>)}</div></section>}

            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-5">
              {selected.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] px-4 text-[14px] font-medium text-[var(--ink)] transition hover:border-[var(--accent-line)] hover:bg-[var(--panel-raised)] focus-visible:outline-2 focus-visible:outline-[var(--focus)]">{link.label}<ExternalArrow /></a>)}
              {selected.access && <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-[var(--line-strong)] px-4 text-[13px] text-[var(--muted)]"><span className="text-[var(--ember)]">◈</span>{selected.access}</span>}
              {selected.stage && <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-[var(--line-strong)] px-4 text-[13px] text-[var(--muted)]"><span className="text-[var(--ember)]">◌</span>{selected.stage}</span>}
              {selected.links.length === 0 && !selected.access && !selected.stage && <span className="text-[14px] text-[var(--dim)]">No public link for this work.</span>}
            </div>
            <nav className="mt-6 grid gap-2 border-t border-[var(--line)] pt-5 sm:grid-cols-2" aria-label="Browse adjacent projects">
              <button type="button" onClick={() => onSelect(previousProject.id)} className="group flex min-h-14 items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-left transition hover:border-[var(--accent-line)]"><span className="text-[var(--accent)]" aria-hidden="true">←</span><span className="min-w-0"><span className="block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wide text-[var(--dim)]">Previous</span><span className="block truncate text-[13px] font-medium text-[var(--ink)]">{previousProject.name}</span></span></button>
              <button type="button" onClick={() => onSelect(nextProject.id)} className="group flex min-h-14 items-center justify-end gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-3 text-right transition hover:border-[var(--accent-line)]"><span className="min-w-0"><span className="block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wide text-[var(--dim)]">Next</span><span className="block truncate text-[13px] font-medium text-[var(--ink)]">{nextProject.name}</span></span><span className="text-[var(--accent)]" aria-hidden="true">→</span></button>
            </nav>
          </div>
        </div>
      </motion.article>}
    </div>
    <footer className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--line)] pt-4 text-[13px] text-[var(--dim)]"><span>{workspaceProjects.length} project records · four directories</span><span>Architecture sketches summarize the available portfolio detail.</span></footer>
  </div>;
}
