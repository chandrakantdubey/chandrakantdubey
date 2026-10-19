import { useLayoutEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { ContactSection } from "./components/ContactSection";
import { BootSequence } from "./components/BootSequence";
import { ExperienceSection } from "./components/ExperienceSection";
import { Hero } from "./components/Hero";
import { ProjectsSection } from "./components/ProjectsSection";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { ToolkitSection } from "./components/ToolkitSection";
import { WorkSection } from "./components/WorkSection";
import { getSavedTheme, paletteClasses, themes, type ThemeName } from "./components/theme";

export default function App() {
  const [theme, setTheme] = useState<ThemeName>(getSavedTheme);
  const selectedTheme = themes.find((item) => item.id === theme) ?? themes[0];

  useLayoutEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", selectedTheme.surface);
    try {
      window.localStorage.setItem("chandrakant-portfolio-theme-terminal-v1", theme);
    } catch {
      // Keep the selected palette for this visit if storage is unavailable.
    }
  }, [selectedTheme.surface, theme]);

  return (
    <MotionConfig reducedMotion="user">
      <div className={[
        "min-h-screen min-w-0 overflow-x-clip motion-safe:scroll-smooth motion-reduce:scroll-auto bg-[var(--page)] font-[family-name:'DM_Sans',Inter,ui-sans-serif,system-ui,sans-serif] text-[var(--ink)] antialiased selection:bg-[var(--accent)] selection:text-[var(--accent-ink)] [--font-mono:'IBM_Plex_Mono',monospace]",
        selectedTheme.scheme === "light" ? "scheme-light" : "scheme-dark",
        paletteClasses[theme],
      ].join(" ")}>
        <a className="fixed left-3 top-3 z-[60] -translate-y-[160%] rounded-md bg-[var(--accent)] px-4 py-3 text-[14px] font-bold text-[var(--accent-ink)] transition-transform focus:translate-y-0" href="#main">Skip to content</a>
        <div id="site-content" className="relative z-10">
          <SiteHeader theme={theme} onThemeChange={setTheme} />
          <main id="main" tabIndex={-1}>
            <Hero />
            <WorkSection />
            <ProjectsSection />
            <ExperienceSection />
            <ToolkitSection />
            <ContactSection />
          </main>
          <SiteFooter />
        </div>
        <BootSequence />
      </div>
    </MotionConfig>
  );
}
