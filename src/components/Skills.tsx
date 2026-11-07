import { useState, useMemo } from "react";
import { allSkills, skillCategories } from "../portfolio";
import { TechIcon } from "./TechIcons";

export function Skills() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filteredSkills = useMemo(() => {
    return allSkills.filter((skill) => {
      const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        skill.name.toLowerCase().includes(query) ||
        skill.category.toLowerCase().includes(query) ||
        skill.projectsUsed.some((p) => p.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, search]);

  return (
    <section className="py-20 sm:py-28 border-t border-[var(--border)] relative" id="skills">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] mb-3">
              <span>Comprehensive Toolchain & Stack</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
              All Technical Skills
            </h2>
            <p className="mt-3 text-base text-[var(--text-secondary)] max-w-xl">
              Languages, distributed backend architectures, databases, cloud DevOps, and applied ML inference tools deployed in production.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 30+ skills or projects..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition"
            />
            <svg
              className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-10 p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] w-fit max-w-full overflow-x-auto">
          {skillCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? "bg-[var(--accent-royal)] text-[#ffffff] shadow-md shadow-blue-500/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-[var(--bg-primary)] text-[var(--text-muted)]"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Skills Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredSkills.map((skill) => (
            <div
              key={skill.name}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent-line)] hover:bg-[var(--bg-card-hover)] transition-all duration-200 group flex flex-col justify-between shadow-sm"
            >
              <div>
                {/* Header: Icon, Name & Level */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center p-2 group-hover:border-[var(--accent)] transition shrink-0 shadow-sm">
                      <TechIcon name={skill.name} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition">
                        {skill.name}
                      </h3>
                      <span className="text-[11px] font-medium text-[var(--text-muted)]">
                        {skill.category}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      skill.level === "Expert"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        : skill.level === "Advanced"
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                        : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    }`}
                  >
                    {skill.level}
                  </span>
                </div>

                {/* Proficiency Bar */}
                <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded-full overflow-hidden mb-3 border border-[var(--border)]">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${skill.percentage}%` }}
                  />
                </div>
              </div>

              {/* Projects where it was used */}
              {skill.projectsUsed.length > 0 && (
                <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="text-[var(--text-muted)]">Applied in:</span>
                  {skill.projectsUsed.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded-md bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-secondary)] font-medium"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <div className="p-10 text-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-card)]">
            <p className="text-sm text-[var(--text-muted)]">No skills match “{search}”.</p>
          </div>
        )}
      </div>
    </section>
  );
}
