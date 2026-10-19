import { motion, useReducedMotion } from "motion/react";
import type { ReactNode, CSSProperties } from "react";

const tones: Record<string, string> = {
  enterprise: "var(--tone-enterprise)",
  inference: "var(--tone-community)",
  community: "var(--tone-wellness)",
  backend: "var(--tone-commerce)",
};

function Frame({ children, label, type }: { children: ReactNode; label: string; type: string }) {
  const style = { "--project-tone": tones[type] ?? "var(--accent)" } as CSSProperties;
  return (
    <div className="relative min-w-0 overflow-hidden border-b border-t-2 border-t-[var(--project-tone)] border-b-[var(--line)] bg-[var(--panel-raised)] px-4 py-4 sm:px-5" style={style} aria-hidden="true">
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[var(--project-tone)] opacity-[.09] blur-3xl" />
      <p className="relative mb-3 font-[family-name:var(--font-mono)] text-[12px] text-[var(--dim)]">{label}</p>
      <div className="relative">{children}</div>
    </div>
  );
}

function EnterpriseFlow() {
  const steps = ["Employee", "Review", "Approval"];
  return <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1.5 sm:gap-2">
    {steps.map((step, index) => <div className="contents" key={step}>
      <div className="grid min-h-[72px] min-w-0 place-items-center rounded-md border border-[var(--line)] bg-[var(--panel)] px-1.5 py-2 text-center">
        <span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--project-tone)] bg-[var(--project-tone)]/10 text-[12px] font-semibold text-[var(--project-tone)]">{["01", "02", "03"][index]}</span>
        <span className="mt-1 text-[11px] leading-tight text-[var(--muted)]">{step}</span>
      </div>
      {index < steps.length - 1 && <span className="text-[var(--project-tone)]" aria-hidden="true">→</span>}
    </div>)}
  </div>;
}

function InferenceFlow() {
  return <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1.5 sm:gap-2">
    {["Input", "Model", "Risk result"].map((step, index) => <div className="contents" key={step}>
      <div className="grid min-h-[72px] min-w-0 place-items-center rounded-md border border-[var(--line)] bg-[var(--panel)] px-1.5 py-2 text-center">
        <span className={"grid h-7 w-7 place-items-center rounded-md text-[11px] font-semibold " + (index === 1 ? "bg-[var(--project-tone)] text-[var(--page)]" : "border border-[var(--project-tone)] text-[var(--project-tone)]")}>{["IN", "ML", "OUT"][index]}</span>
        <span className="mt-1 text-[11px] leading-tight text-[var(--muted)]">{step}</span>
      </div>
      {index < 2 && <span className="text-[var(--project-tone)]" aria-hidden="true">→</span>}
    </div>)}
  </div>;
}

function FamilyGraph({ reduceMotion }: { reduceMotion: boolean | null }) {
  const nodes: [number, number, number][] = [[150, 12, 8], [92, 44, 7], [208, 44, 7], [48, 78, 6], [112, 78, 6], [188, 78, 6], [252, 78, 6]];
  return <div className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2">
    <svg className="h-[95px] w-full text-[var(--project-tone)]" viewBox="0 0 300 100" fill="none">
      <motion.path d="M150 20v14M150 34H92v10M150 34h58v10M92 51v14M92 65H48v7M92 65h20v7M208 51v14M208 65h-20v7M208 65h44v7" stroke="currentColor" strokeWidth="1.5" initial={reduceMotion ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: .8 }} />
      {nodes.map(([x, y, radius], index) => <motion.circle key={index} cx={x} cy={y} r={radius} fill="var(--panel)" stroke="currentColor" strokeWidth="1.5" initial={reduceMotion ? false : { scale: .7, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: .1 + index * .04 }} />)}
    </svg>
  </div>;
}

function ApiLayers() {
  return <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
    {["API", "Auth", "Game rules"].map((item, index) => <div className="contents" key={item}>
      <div className="flex min-h-10 min-w-0 items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--project-tone)]" />
        <span className="truncate font-[family-name:var(--font-mono)] text-[11px] text-[var(--muted)]">{item}</span>
      </div>
      {index < 2 && <span className="hidden text-center text-[var(--project-tone)] sm:block" aria-hidden="true">→</span>}
    </div>)}
    <div className="col-span-full mt-1 flex flex-wrap gap-2 border-t border-[var(--line)] pt-3">
      {["JWT", "Stats", "Breeding", "Evolution"].map((label) => <span className="rounded border border-[var(--line)] px-2 py-1 font-[family-name:var(--font-mono)] text-[11px] text-[var(--dim)]" key={label}>{label}</span>)}
    </div>
  </div>;
}

export function ProjectArtwork({ type }: { type: string }) {
  const reduceMotion = useReducedMotion();
  if (type === "inference") return <Frame label="model execution / assessment" type={type}><InferenceFlow /></Frame>;
  if (type === "community") return <Frame label="family connections / collaboration" type={type}><FamilyGraph reduceMotion={reduceMotion} /></Frame>;
  if (type === "backend") return <Frame label="service layers / domain rules" type={type}><ApiLayers /></Frame>;
  return <Frame label="review cycle / workflow" type={type}><EnterpriseFlow /></Frame>;
}
