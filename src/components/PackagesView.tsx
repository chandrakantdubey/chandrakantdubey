import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { skillGroups } from "../portfolio";

export function PackagesView() {
  const [activeGroup, setActiveGroup] = useState(skillGroups[0]?.id ?? "languages");
  const [query, setQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const group = skillGroups.find((item) => item.id === activeGroup) ?? skillGroups[0];
  const visibleSkills = useMemo(() => group?.items.filter((skill) => skill.toLowerCase().includes(query.toLowerCase())) ?? [], [group, query]);
  const currentSkill = selectedSkill && visibleSkills.includes(selectedSkill) ? selectedSkill : visibleSkills[0];

  return <div className="mx-auto max-w-[1500px] px-4 pb-14 pt-8 sm:px-7 sm:pt-10 lg:px-10">
    <div className="mb-5 flex items-center gap-2 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.15em] text-[var(--dim)]"><span className="text-[var(--accent)]">/</span> workspace <span className="text-[var(--line-strong)]">/</span> packages</div>
    <header className="mb-7 border-b border-[var(--line)] pb-6 sm:mb-8 sm:pb-7"><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.16em] text-[var(--accent)]">Toolchain index</p><h1 id="view-heading" tabIndex={-1} className="mb-0 mt-2 text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-tight tracking-[-.045em] text-[var(--ink)] outline-none">Packages</h1><p className="mb-0 mt-2 max-w-3xl text-[16px] leading-relaxed text-[var(--muted)] sm:text-[17px]">A browsable index of languages and tools used across the work. Choose a group, then inspect an entry.</p></header>

    <div className="grid items-start gap-5 md:grid-cols-[minmax(210px,.4fr)_minmax(0,1fr)] xl:grid-cols-[minmax(240px,.4fr)_minmax(0,1fr)]">
      <nav className="rounded-[22px] border border-[var(--line)] bg-[var(--panel)] p-3 sm:p-4" aria-label="Technology groups">
        <p className="m-0 border-b border-[var(--line)] px-2 pb-3 font-[family-name:var(--font-mono)] text-[13px] text-[var(--dim)]">~/packages/index</p>
        <div className="mt-2 space-y-1">{skillGroups.map((item, index) => <button key={item.id} type="button" onClick={() => { setActiveGroup(item.id); setSelectedSkill(null); setQuery(""); }} aria-current={activeGroup === item.id ? "true" : undefined} className={"flex min-h-[54px] w-full items-center gap-3 rounded-xl px-3 text-left transition focus-visible:outline-2 focus-visible:outline-[var(--focus)] " + (activeGroup === item.id ? "bg-[var(--accent-soft)] text-[var(--ink)]" : "text-[var(--muted)] hover:bg-[var(--panel-raised)] hover:text-[var(--ink)]")}><span className="font-[family-name:var(--font-mono)] text-[12px] text-[var(--accent)]">0{index + 1}</span><span className="min-w-0 flex-1 text-[14px] font-medium">{item.title}</span><span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">{item.items.length}</span></button>)}</div>
      </nav>

      {group && <motion.section key={group.id} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .22 }} className="min-w-0 rounded-[24px] border border-[var(--line-strong)] bg-[linear-gradient(145deg,var(--panel-solid),var(--page-elevated))] p-5 sm:p-7 lg:p-9">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.14em] text-[var(--accent)]">{group.items.length} entries · package group</p><h2 className="mb-0 mt-2 text-[clamp(1.7rem,3.4vw,2.8rem)] font-semibold leading-tight tracking-[-.04em] text-[var(--ink)]">{group.title}</h2><p className="mb-0 mt-2 text-[15px] leading-relaxed text-[var(--muted)]">{group.note}</p></div><span className="rounded-xl border border-[var(--line-strong)] bg-[var(--panel)] px-3 py-2 font-[family-name:var(--font-mono)] text-[12px] text-[var(--dim)]">selected toolchain</span></div>
        <label className="mt-6 flex min-h-12 items-center gap-3 rounded-xl border border-[var(--line-strong)] bg-[var(--page)]/65 px-3.5 focus-within:border-[var(--accent-line)]"><span className="text-[var(--accent)]" aria-hidden="true">⌕</span><span className="sr-only">Filter packages</span><input value={query} onChange={(event) => { setQuery(event.target.value); setSelectedSkill(null); }} placeholder="Filter this group" className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--ink)] outline-none placeholder:text-[var(--dim)]" /></label>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(190px,.55fr)_minmax(0,1fr)]">
          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]" role="listbox" aria-label={group.title}>
            {visibleSkills.length ? visibleSkills.map((skill, index) => <button key={skill} type="button" role="option" aria-selected={currentSkill === skill} onClick={() => setSelectedSkill(skill)} className={"flex min-h-[48px] w-full items-center gap-3 px-2 text-left transition focus-visible:outline-2 focus-visible:outline-[var(--focus)] " + (currentSkill === skill ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--ink)]")}><span className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">{String(index + 1).padStart(2, "0")}</span><span className="flex-1 text-[15px]">{skill}</span><span className="text-[var(--dim)]">›</span></button>) : <p className="p-3 text-[14px] text-[var(--muted)]">No matching package in this group.</p>}
          </div>
          <div className="min-h-[220px] rounded-2xl border border-[var(--line)] bg-[var(--page)]/45 p-5 sm:p-6">
            {currentSkill ? <><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.14em] text-[var(--dim)]">Package detail</p><h3 className="mb-0 mt-4 break-words text-[clamp(1.5rem,3vw,2.3rem)] font-semibold tracking-[-.04em] text-[var(--ink)]">{currentSkill}</h3><div className="mt-5 flex items-center gap-2 text-[14px] text-[var(--muted)]"><span className="h-2 w-2 rounded-full bg-[var(--accent)]" />Listed in the portfolio toolchain</div><p className="mb-0 mt-6 max-w-xl border-t border-[var(--line)] pt-4 text-[14px] leading-relaxed text-[var(--dim)]">{group.note}. The index reflects the current portfolio record; depth varies by area.</p></> : <div className="grid min-h-[180px] place-items-center text-[15px] text-[var(--muted)]">Try a different filter.</div>}
          </div>
        </div>
      </motion.section>}
    </div>
    <p className="mt-7 max-w-4xl text-[14px] leading-relaxed text-[var(--dim)]">LLM application patterns and RAG fundamentals are learning and project-focus areas; this portfolio does not claim a production RAG deployment.</p>
  </div>;
}
