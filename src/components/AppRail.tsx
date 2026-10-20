import { navigation, type WorkspaceView } from "./navigation";

export function AppRail({ view, onNavigate }: { view: WorkspaceView; onNavigate: (view: WorkspaceView) => void }) {
  return <aside className="sticky top-[88px] hidden h-[calc(100dvh-104px)] min-h-[420px] flex-col items-center justify-between border-r border-[var(--line)] py-5 lg:flex" aria-label="Workspace rail">
    <nav className="flex flex-col items-center gap-2" aria-label="Workspace navigation">
      {navigation.map((item) => <a key={item.id} href={item.id === "work" ? "#work" : `#${item.id}`} onClick={(event) => { event.preventDefault(); onNavigate(item.id); }} aria-current={view === item.id ? "page" : undefined} aria-label={item.label} title={item.label} className={"group relative grid h-12 w-12 place-items-center rounded-2xl border text-[20px] transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] " + (view === item.id ? "border-transparent bg-transparent text-[var(--accent)]" : "border-transparent text-[var(--dim)] hover:border-[var(--line)] hover:bg-[var(--panel)] hover:text-[var(--ink)]")}>
        {view === item.id && <span className="absolute -left-3 top-3 h-6 w-0.5 rounded-full bg-[var(--accent)] shadow-[0_0_9px_var(--accent)]" aria-hidden="true" />}
        <span aria-hidden="true">{item.glyph}</span>
      </a>)}
    </nav>
    <div className="flex flex-col items-center gap-2 text-[11px] text-[var(--dim)]" title="Mumbai, India">
      <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]" />
      <span className="[writing-mode:vertical-rl]">IN · UTC+5:30</span>
    </div>
  </aside>;
}
