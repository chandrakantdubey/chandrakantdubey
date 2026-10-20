import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { AppRail } from "./components/AppRail";
import { BootSequence } from "./components/BootSequence";
import { SystemBar } from "./components/SystemBar";
import { readHash, type WorkspaceView } from "./components/navigation";
import { getSavedTheme, paletteClasses, themes, type ThemeName } from "./components/theme";
import { profile } from "./portfolio";

const HomeView = lazy(() => import("./components/HomeView").then(({ HomeView: Component }) => ({ default: Component })));
const WorkbenchView = lazy(() => import("./components/WorkbenchView").then(({ WorkbenchView: Component }) => ({ default: Component })));
const JournalView = lazy(() => import("./components/JournalView").then(({ JournalView: Component }) => ({ default: Component })));
const PackagesView = lazy(() => import("./components/PackagesView").then(({ PackagesView: Component }) => ({ default: Component })));
const ContactView = lazy(() => import("./components/ContactView").then(({ ContactView: Component }) => ({ default: Component })));
const CommandPalette = lazy(() => import("./components/CommandPalette").then(({ CommandPalette: Component }) => ({ default: Component })));

function getSavedMotion() {
  try {
    const saved = window.localStorage.getItem("drakon-portfolio-motion");
    if (saved === "off") return false;
    if (saved === "on") return true;
  } catch {
    // The system preference remains available when storage is blocked.
  }
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function App() {
  const initialRoute = readHash();
  const [theme, setTheme] = useState<ThemeName>(getSavedTheme);
  const [motionEnabled, setMotionEnabled] = useState(getSavedMotion);
  const [view, setView] = useState<WorkspaceView>(initialRoute.view);
  const [selectedProjectId, setSelectedProjectId] = useState(initialRoute.projectId);
  const [selectedRoleId, setSelectedRoleId] = useState("adeptken");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [booting, setBooting] = useState(true);
  const lastView = useRef(initialRoute.view);
  const selectedTheme = themes.find((item) => item.id === theme) ?? themes[0];

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", selectedTheme.surface);
    try {
      window.localStorage.setItem("chandrakant-portfolio-theme-terminal-v1", theme);
    } catch {
      // Keep the selected palette for this visit if storage is unavailable.
    }
  }, [selectedTheme.surface, theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem("drakon-portfolio-motion", motionEnabled ? "on" : "off");
    } catch {
      // The session toggle still works when storage is blocked.
    }
  }, [motionEnabled]);

  const syncHash = useCallback(() => {
    const route = readHash();
    setView(route.view);
    setSelectedProjectId(route.projectId);
  }, []);

  useEffect(() => {
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [syncHash]);

  const navigate = useCallback((nextView: WorkspaceView) => {
    setView(nextView);
    setSelectedProjectId(undefined);
    const nextHash = nextView === "work" ? "#work" : `#${nextView}`;
    if (window.location.hash === nextHash) syncHash();
    else window.location.hash = nextHash;
  }, [syncHash]);

  const navigateToProject = useCallback((projectId: string) => {
    setView("work");
    setSelectedProjectId(projectId);
    const nextHash = `#work/${projectId}`;
    if (window.location.hash === nextHash) syncHash();
    else window.location.hash = nextHash;
  }, [syncHash]);

  const downloadResume = useCallback(() => {
    const anchor = document.createElement("a");
    anchor.href = profile.resume;
    anchor.download = "Chandrakant_Dubey.pdf";
    anchor.click();
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (lastView.current === view) return;
    lastView.current = view;
    const timer = window.setTimeout(() => document.getElementById("view-heading")?.focus(), 240);
    return () => window.clearTimeout(timer);
  }, [view]);

  useEffect(() => {
    if (!booting) document.getElementById("view-heading")?.focus({ preventScroll: true });
  }, [booting]);

  return <MotionConfig reducedMotion={motionEnabled ? "user" : "always"}>
    {booting && <BootSequence motionEnabled={motionEnabled} themeClasses={paletteClasses[theme]} onComplete={() => setBooting(false)} />}
    <div id="workspace-shell" inert={booting} className={[
      "min-h-screen min-w-0 overflow-x-clip bg-[var(--page)] font-[family-name:'DM_Sans',Inter,ui-sans-serif,system-ui,sans-serif] text-[var(--ink)] antialiased selection:bg-[var(--accent)] selection:text-[var(--accent-ink)] [--font-mono:'IBM_Plex_Mono',monospace]",
      selectedTheme.scheme === "light" ? "scheme-light" : "scheme-dark",
      paletteClasses[theme],
    ].join(" ")}>
      <a className="fixed left-3 top-3 z-[120] -translate-y-[160%] rounded-lg bg-[var(--accent)] px-4 py-3 text-[14px] font-semibold text-[var(--accent-ink)] transition-transform focus:translate-y-0" href="#main">Skip to workspace</a>
      <div className="relative z-10">
        <SystemBar theme={theme} onThemeChange={setTheme} motionEnabled={motionEnabled} onMotionToggle={() => setMotionEnabled((enabled) => !enabled)} onPaletteOpen={() => setPaletteOpen(true)} view={view} onNavigate={navigate} />
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[72px_minmax(0,1fr)]">
          <AppRail view={view} onNavigate={navigate} />
          <main id="main" tabIndex={-1} className="min-h-[calc(100dvh-120px)] min-w-0 outline-none">
            <Suspense fallback={null}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={view} initial={motionEnabled ? { opacity: 0, y: 7 } : false} animate={{ opacity: 1, y: 0 }} exit={motionEnabled ? { opacity: 0, y: -4 } : undefined} transition={{ duration: motionEnabled ? .2 : 0 }}>
                  {view === "home" && <HomeView motionEnabled={motionEnabled} onNavigate={navigate} />}
                  {view === "work" && <WorkbenchView selectedProjectId={selectedProjectId} onSelect={navigateToProject} motionEnabled={motionEnabled} />}
                  {view === "journal" && <JournalView selectedId={selectedRoleId} onSelect={setSelectedRoleId} />}
                  {view === "packages" && <PackagesView />}
                  {view === "contact" && <ContactView />}
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </main>
        </div>
      </div>
      <div className="sr-only" aria-live="polite" aria-atomic="true">{view === "home" ? "Overview" : view === "work" ? "Workbench" : view === "journal" ? "Journal" : view === "packages" ? "Packages" : "Contact"}</div>
      {paletteOpen && <Suspense fallback={null}><CommandPalette onClose={() => setPaletteOpen(false)} onNavigate={navigate} onResume={downloadResume} /></Suspense>}
    </div>
  </MotionConfig>;
}
