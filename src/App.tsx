import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Projects } from "./components/Projects";
import { Experience } from "./components/Experience";
import { Skills } from "./components/Skills";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("portfolio-theme");
      if (saved) return saved === "dark";
      return true; // Default to dark mode (Blue, Black & White)
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
    } catch {
      // Storage unavailable
    }
    if (isDark) {
      document.documentElement.classList.remove("theme-light");
    } else {
      document.documentElement.classList.add("theme-light");
    }
  }, [isDark]);

  return (
    <div className={`min-h-screen ${isDark ? "" : "theme-light"} bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-300 selection:bg-[var(--accent)] selection:text-[#030712]`}>
      <Navbar isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
      <main id="main-content">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
