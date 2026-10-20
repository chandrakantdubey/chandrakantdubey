import { motion, useReducedMotion } from "motion/react";
import { experience } from "../portfolio";

export function JournalView({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const reduceMotion = useReducedMotion();
  const selected = experience.find((role) => role.id === selectedId) ?? experience[0];
  return <div className="mx-auto max-w-[1500px] px-4 pb-14 pt-8 sm:px-7 sm:pt-10 lg:px-10">
    <div className="mb-5 flex items-center gap-2 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.15em] text-[var(--dim)]"><span className="text-[var(--accent)]">/</span> workspace <span className="text-[var(--line-strong)]">/</span> journal</div>
    <header className="mb-7 border-b border-[var(--line)] pb-6 sm:mb-8 sm:pb-7"><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.16em] text-[var(--accent)]">Engineering log</p><h1 id="view-heading" tabIndex={-1} className="mb-0 mt-2 text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-tight tracking-[-.045em] text-[var(--ink)] outline-none">Journal</h1><p className="mb-0 mt-2 max-w-3xl text-[16px] leading-relaxed text-[var(--muted)] sm:text-[17px]">A concise record of teams, products, and the systems I have helped build.</p></header>

    <div className="grid items-start gap-5 md:grid-cols-[minmax(220px,.45fr)_minmax(0,1fr)] xl:grid-cols-[minmax(285px,.48fr)_minmax(0,1fr)]">
      <nav className="rounded-[22px] border border-[var(--line)] bg-[var(--panel)] p-3 sm:p-4" aria-label="Experience entries">
        <p className="m-0 border-b border-[var(--line)] px-2 pb-3 font-[family-name:var(--font-mono)] text-[13px] text-[var(--dim)]">~/journal/roles</p>
        <div className="relative mt-2 space-y-1 before:absolute before:bottom-5 before:left-[19px] before:top-5 before:w-px before:bg-[var(--line-strong)]">
          {experience.map((role, index) => <button key={role.id} type="button" onClick={() => onSelect(role.id)} aria-current={selected?.id === role.id ? "true" : undefined} className={"group relative flex min-h-[86px] w-full items-start gap-3 rounded-xl px-2.5 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-[var(--focus)] " + (selected?.id === role.id ? "bg-[var(--accent-soft)]" : "hover:bg-[var(--panel-raised)]")}>
            <span className="relative z-10 mt-1.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border border-[var(--line-strong)] bg-[var(--panel-solid)]"><span className={"h-2 w-2 rounded-full " + (selected?.id === role.id ? "bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" : "bg-[var(--dim)]")} /></span>
            <span className="min-w-0 flex-1"><span className={"block text-[15px] font-semibold " + (selected?.id === role.id ? "text-[var(--ink)]" : "text-[var(--muted)] group-hover:text-[var(--ink)]")}>{role.company}</span><span className="mt-1 block text-[13px] text-[var(--muted)]">{role.role}</span><span className="mt-1.5 block font-[family-name:var(--font-mono)] text-[12px] text-[var(--dim)]">{role.period}</span></span>
            <span className="pt-0.5 font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]">0{index + 1}</span>
          </button>)}
        </div>
      </nav>

      {selected && <motion.article key={selected.id} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .24 }} className="min-w-0 rounded-[24px] border border-[var(--line-strong)] bg-[linear-gradient(145deg,var(--panel-solid),var(--page-elevated))] p-5 sm:p-7 lg:p-9">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="m-0 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.14em] text-[var(--accent)]">{selected.period}</p><h2 className="mb-0 mt-3 text-[clamp(1.75rem,3.4vw,3rem)] font-semibold leading-tight tracking-[-.04em] text-[var(--ink)]">{selected.role}</h2><p className="mb-0 mt-2 text-[17px] font-medium text-[var(--muted)]">{selected.company}</p></div><span className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--accent-line)] bg-[var(--accent-soft)] font-[family-name:var(--font-mono)] text-[15px] text-[var(--accent)]">{String(experience.indexOf(selected) + 1).padStart(2, "0")}</span></div>
        <p className="mb-0 mt-6 max-w-3xl border-l-2 border-[var(--accent)] pl-4 text-[16px] leading-[1.8] text-[var(--muted)] sm:text-[18px]">{selected.summary}</p>
        <section className="mt-8"><h3 className="mb-3 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.14em] text-[var(--dim)]">Selected contributions</h3><ul className="m-0 list-none space-y-3 p-0">{selected.highlights.map((highlight, index) => <li key={highlight} className="flex gap-3 text-[15px] leading-[1.75] text-[var(--muted)] sm:text-[16px]"><span className="mt-0.5 font-[family-name:var(--font-mono)] text-[12px] text-[var(--accent)]">0{index + 1}</span><span>{highlight}</span></li>)}</ul></section>
        <section className="mt-8 border-t border-[var(--line)] pt-5"><h3 className="mb-3 font-[family-name:var(--font-mono)] text-[12px] uppercase tracking-[.14em] text-[var(--dim)]">Technologies in this role</h3><div className="flex flex-wrap gap-2">{selected.technologies.map((technology) => <span key={technology} className="inline-flex min-h-9 items-center rounded-lg border border-[var(--line)] bg-[var(--panel)] px-3 text-[13px] text-[var(--muted)]">{technology}</span>)}</div></section>
      </motion.article>}
    </div>
    <p className="mt-7 rounded-xl border border-[var(--ember)]/25 bg-[var(--ember)]/5 px-4 py-3 text-[14px] leading-relaxed text-[var(--muted)]"><span className="font-semibold text-[var(--ember)]">Date note.</span> The résumé lists overlapping months at Kintree and Nutriiya (Sep–Dec 2025), and Kintree and Adeptken (Jan 2026). Dates are shown as provided.</p>
  </div>;
}
