import { useState, type PointerEvent } from "react";
import { motion } from "motion/react";
import { profile } from "../portfolio";
import { ChakraIcon } from "./ChakraIcon";
import { TechIcon } from "./TechIcons";

export function Hero() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  }

  const featuredTechs = [
    { name: "Python", label: "Python" },
    { name: "FastAPI", label: "FastAPI" },
    { name: "React", label: "React 19" },
    { name: "TypeScript", label: "TypeScript" },
    { name: "Docker", label: "Docker" },
    { name: "Oracle", label: "Oracle DB" },
  ];

  return (
    <section
      className="relative pt-24 sm:pt-36 pb-20 sm:pb-28 overflow-hidden"
      id="hero"
      onPointerMove={handlePointerMove}
    >
      {/* Interactive Glowing Cursor Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 500px at ${mousePos.x}% ${mousePos.y}%, rgba(59, 130, 246, 0.18), transparent 75%)`,
        }}
        aria-hidden="true"
      />

      {/* Radiant Background Mesh Gradients */}
      <div
        className="pointer-events-none absolute top-10 left-1/4 w-[500px] h-[300px] bg-blue-600/15 blur-[120px] rounded-full"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-40 right-1/4 w-[400px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Heading, Bio, CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-400 shadow-sm mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
              </span>
              <span>Available for High-Impact Roles & Consulting</span>
            </div>

            {/* Main Headline with vibrant gradient */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.08] mb-6">
              Engineering scalable systems, resilient backends, &{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                intelligent web products.
              </span>
            </h1>

            {/* Introduction Paragraph */}
            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-6 max-w-2xl">
              Hello, I’m <strong className="text-[var(--text-primary)] font-semibold">{profile.name}</strong>, a full-stack software engineer based in Mumbai, India 🇮🇳. I specialize in designing fault-tolerant distributed architectures, sub-50ms ML inference microservices in Python & FastAPI, and performant web applications with React & Next.js.
            </p>

            {/* Featured Tech Stack Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-xs text-[var(--text-muted)] font-semibold mr-1">Primary Tools:</span>
              {featuredTechs.map((tech) => (
                <span
                  key={tech.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm hover:border-[var(--accent)] hover:scale-105 transition"
                >
                  <TechIcon name={tech.name} className="w-3.5 h-3.5" />
                  <span>{tech.label}</span>
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-12 w-full sm:w-auto">
              <a
                href="#projects"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-[#ffffff] hover:opacity-95 transition shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              >
                <span>Explore Featured Systems</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>

              <a
                href="#contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-semibold border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:border-[var(--accent)] transition shadow-sm"
              >
                <span>Get in Touch</span>
                <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              <a
                href={profile.resume}
                download="Chandrakant_Dubey.pdf"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
              >
                <span>Download Résumé</span>
                <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>

            {/* Real-World Production Metrics Bar */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-5 pt-8 border-t border-[var(--border)]">
              <div>
                <span className="block text-2xl sm:text-3xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  10,000+
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">Enterprise Users</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
                  &lt; 45ms
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">P99 ML Latency</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  500k+
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">Kinship Nodes</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
                  3+ Yrs
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">Production Work</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Animated Engineering Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm sm:max-w-md rounded-3xl border border-[var(--border)] bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-primary)] p-7 sm:p-8 shadow-2xl relative overflow-hidden group hover:border-[var(--accent-line)] transition-all duration-300">
              {/* Colorful Top Accent Line */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />

              {/* Central Geometric Chakra Animation */}
              <div className="relative py-8 flex items-center justify-center">
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-[var(--border)] flex items-center justify-center relative shadow-inner">
                  {/* Outer Pulsing Aura */}
                  <div className="absolute inset-2 rounded-full border border-dashed border-blue-500/40 animate-pulse" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="w-40 h-40 sm:w-48 sm:h-48 text-blue-400"
                  >
                    <ChakraIcon className="w-full h-full text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
                  </motion.div>
                  <div className="absolute w-10 h-10 rounded-full bg-[var(--bg-primary)] border-2 border-blue-400 flex items-center justify-center text-blue-400 font-extrabold text-xs shadow-lg">
                    CD
                  </div>
                </div>
              </div>

              {/* Telemetry Details */}
              <div className="space-y-3.5 pt-5 border-t border-[var(--border)]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Headquarters</span>
                  <span className="text-[var(--text-primary)] font-bold">Mumbai, Maharashtra, India 🇮🇳</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Focus</span>
                  <span className="text-blue-400 font-bold">Distributed Systems & AI</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Verified Scale</span>
                  <span className="text-emerald-400 font-bold">10,000+ Enterprise Platform</span>
                </div>
              </div>

              {/* Interactive trigger link */}
              <div className="mt-5 pt-4 border-t border-[var(--border)] text-center">
                <a
                  href="#projects"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"
                >
                  <span>Explore All 9 Verified Systems</span>
                  <span>↓</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
