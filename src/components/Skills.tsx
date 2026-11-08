import { useState, useMemo } from "react";
import { allSkills, skillCategories, type SkillItem } from "../portfolio";
import { TechIcon } from "./TechIcons";

export function Skills() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [activeSkill, setActiveSkill] = useState<SkillItem | null>(null);

  const filteredSkills = useMemo(() => {
    return allSkills.filter((skill) => {
      const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        skill.name.toLowerCase().includes(query) ||
        skill.category.toLowerCase().includes(query) ||
        skill.tag.toLowerCase().includes(query) ||
        skill.projectsUsed.some((p) => p.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, search]);

  return (
    <section className="py-20 sm:py-32 border-t border-[var(--border)] relative overflow-hidden" id="skills">
      {/* Background Ambient Glows */}
      <div
        className="pointer-events-none absolute top-1/4 -left-48 w-96 h-96 bg-blue-600/10 blur-[140px] rounded-full"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-600/10 blur-[140px] rounded-full"
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-cyan-500/15 text-blue-400 border border-blue-500/30 mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Full-Stack & Systems Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[var(--text-primary)]">
              Engineering Matrix &{" "}
              <span className="aurora-gradient-text">Tech Ecosystem</span>
            </h2>
            <p className="mt-4 text-base text-[var(--text-secondary)] leading-relaxed">
              Battle-tested toolchain spanning distributed microservices, reactive user interfaces, high-concurrency relational schemas, and containerized ML inference pipelines.
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 35+ skills, tags, or projects..."
              className="w-full pl-10 pr-10 py-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition shadow-inner"
            />
            <svg
              className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-3.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-primary)] px-1.5 py-0.5 rounded-md"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 4 Architectural Bento Spheres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Bento 1: Backend & Microservices */}
          <div className="p-7 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/25 via-[var(--bg-card)] to-[var(--bg-primary)] hover:border-cyan-400/50 transition-all duration-300 shadow-xl group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  Backend & Distributed Core
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400">&lt; 45ms P99 Latency</span>
              </div>
              <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 group-hover:text-cyan-400 transition">
                High-Concurrency Asynchronous Engines
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                Designing event-driven RESTful microservices, real-time WebSockets, and database connection pooling using Python, FastAPI, and Node.js for high-volume banking workloads.
              </p>

              {/* Tech Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["Python", "FastAPI", "Node.js", "SQLAlchemy", "WebSockets", "Pydantic"].map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[var(--bg-primary)] border border-cyan-500/20 text-cyan-200"
                  >
                    <TechIcon name={tech} className="w-3.5 h-3.5" />
                    <span>{tech}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-cyan-500/20 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Verified Scale: 10,000+ Enterprise Appraisals</span>
              <span className="text-cyan-400 font-bold">ACID Guarantee</span>
            </div>
          </div>

          {/* Bento 2: Frontend & Modern Canvas */}
          <div className="p-7 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/25 via-[var(--bg-card)] to-[var(--bg-primary)] hover:border-purple-400/50 transition-all duration-300 shadow-xl group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  Modern Web & Cross-Platform UI
                </span>
                <span className="text-xs font-mono font-bold text-purple-400">60 FPS Hardware-Accel</span>
              </div>
              <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 group-hover:text-purple-400 transition">
                Server Components & Interactive Graphs
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                Crafting performant web frontends with React 19, Next.js 15, and TypeScript. Engineering complex tree visualizations supporting 500k+ nodes with BalkanJS and Redux Toolkit.
              </p>

              {/* Tech Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["React 19", "Next.js", "TypeScript", "Tailwind CSS", "Redux", "Framer Motion"].map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[var(--bg-primary)] border border-purple-500/20 text-purple-200"
                  >
                    <TechIcon name={tech} className="w-3.5 h-3.5" />
                    <span>{tech}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-purple-500/20 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Tree Graph Scale: 500k+ Kinship Nodes</span>
              <span className="text-purple-400 font-bold">98+ Core Web Vitals</span>
            </div>
          </div>

          {/* Bento 3: Enterprise Data Tier */}
          <div className="p-7 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/25 via-[var(--bg-card)] to-[var(--bg-primary)] hover:border-emerald-400/50 transition-all duration-300 shadow-xl group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Data Persistence & Cache
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">-35% Query Latency</span>
              </div>
              <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 group-hover:text-emerald-400 transition">
                Enterprise Relational & In-Memory Stores
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                Architecting high-integrity schemas, composite indexes, partition pruning, and sub-millisecond Redis caches across Oracle Database, PostgreSQL, and SQLite.
              </p>

              {/* Tech Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["PostgreSQL", "Oracle", "Redis", "MongoDB", "SQLite"].map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[var(--bg-primary)] border border-emerald-500/20 text-emerald-200"
                  >
                    <TechIcon name={tech} className="w-3.5 h-3.5" />
                    <span>{tech}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-500/20 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Zero Data-Loss Transactions</span>
              <span className="text-emerald-400 font-bold">Sub-ms Session State</span>
            </div>
          </div>

          {/* Bento 4: DevOps & Applied AI */}
          <div className="p-7 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/25 via-[var(--bg-card)] to-[var(--bg-primary)] hover:border-amber-400/50 transition-all duration-300 shadow-xl group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  DevOps, Cloud & Applied AI
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">Zero-Downtime Builds</span>
              </div>
              <h3 className="text-xl font-black text-[var(--text-primary)] mb-2 group-hover:text-amber-400 transition">
                Containerized Workloads & ML Inference
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                Automating end-to-end CI/CD with GitHub Actions, orchestrating multi-container environments with Docker, hosting on AWS EC2 & S3, and serving real-time ML risk scoring.
              </p>

              {/* Tech Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["Docker", "AWS", "GitHub Actions", "Linux / RHEL", "ML Inference", "Pytest"].map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-[var(--bg-primary)] border border-amber-500/20 text-amber-200"
                  >
                    <TechIcon name={tech} className="w-3.5 h-3.5" />
                    <span>{tech}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-amber-500/20 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Hermetic Environment Builds</span>
              <span className="text-amber-400 font-bold">100% Automated Testing</span>
            </div>
          </div>
        </div>

        {/* Interactive Matrix Filter Deck */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                Comprehensive Technology Matrix
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Explore all 36 production tools, concrete specializations, and real-world system applications.
              </p>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)]">
              Showing {filteredSkills.length} of {allSkills.length} Technologies
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] w-fit max-w-full overflow-x-auto">
            {skillCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-[#ffffff] shadow-md shadow-blue-500/25"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    selectedCategory === cat.id
                      ? "bg-white/20 text-white"
                      : "bg-[var(--bg-primary)] text-[var(--text-muted)]"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Skills Cards Grid - NO PERCENTAGE BARS! VIBRANT COLORS & SPECIALIZATIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredSkills.map((skill) => {
            const isSelected = activeSkill?.name === skill.name;
            return (
              <div
                key={skill.name}
                onClick={() => setActiveSkill(isSelected ? null : skill)}
                className={`p-5 rounded-2xl border bg-[var(--bg-card)] transition-all duration-300 cursor-pointer group flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 ${
                  isSelected
                    ? "border-blue-400 ring-2 ring-blue-500/30 bg-[var(--bg-card-hover)]"
                    : "border-[var(--border)] hover:border-[var(--border-hover)]"
                }`}
                style={{
                  borderLeftColor: skill.accentColor,
                  borderLeftWidth: "4px",
                }}
              >
                {/* Subtle Brand Accent Glow on Hover */}
                <div
                  className="pointer-events-none absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-0 group-hover:opacity-20 transition duration-300 blur-xl"
                  style={{ backgroundColor: skill.accentColor }}
                />

                <div>
                  {/* Top Bar: Icon, Name & Experience */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center p-2 group-hover:scale-105 transition shrink-0 shadow-sm"
                        style={{
                          boxShadow: `0 4px 12px -2px ${skill.accentColor}25`,
                        }}
                      >
                        <TechIcon name={skill.name} className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-white transition flex items-center gap-2">
                          <span>{skill.name}</span>
                          {skill.featured && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Primary Stack" />
                          )}
                        </h4>
                        <span className="text-[11px] font-medium text-[var(--text-muted)]">
                          {skill.category}
                        </span>
                      </div>
                    </div>

                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
                      style={{
                        backgroundColor: `${skill.accentColor}15`,
                        color: skill.accentColor,
                        borderColor: `${skill.accentColor}40`,
                      }}
                    >
                      {skill.experience}
                    </span>
                  </div>

                  {/* Architectural Specialization Tag */}
                  <div className="mb-3.5">
                    <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                      {skill.tag}
                    </p>
                  </div>
                </div>

                {/* Projects Used Badge Chips */}
                <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-[var(--text-muted)] font-medium text-[10px] uppercase tracking-wider">
                    In Production:
                  </span>
                  {skill.projectsUsed.map((p) => (
                    <a
                      key={p}
                      href="#projects"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className="px-2 py-0.5 rounded-md bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-white hover:border-blue-400 hover:bg-blue-600/10 font-medium transition"
                    >
                      {p}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredSkills.length === 0 && (
          <div className="p-12 text-center rounded-3xl border border-dashed border-[var(--border)] bg-[var(--bg-card)]">
            <svg className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-[var(--text-primary)]">No matching technologies found</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Try searching for "FastAPI", "React", "Oracle", or "IDBI Bank".</p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
