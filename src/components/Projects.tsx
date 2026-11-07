import { useState } from "react";
import { projects, type ProjectCategory, type Project } from "../portfolio";
import { TechIcon } from "./TechIcons";
import { ArchitectureModal } from "./ArchitectureModal";

export function Projects() {
  const [filter, setFilter] = useState<ProjectCategory>("all");
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filterTabs: { id: ProjectCategory; label: string }[] = [
    { id: "all", label: "All Work" },
    { id: "enterprise", label: "Enterprise Systems" },
    { id: "ai", label: "Applied ML & AI" },
    { id: "fullstack", label: "Full-Stack Web" },
    { id: "mobile", label: "Mobile & Skia" },
    { id: "opensource", label: "Open Source" },
  ];

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = filter === "all" || project.category === filter;
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      project.name.toLowerCase().includes(query) ||
      project.summary.toLowerCase().includes(query) ||
      project.stack.some((tech) => tech.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-20 sm:py-28 border-t border-[var(--border)] relative overflow-hidden" id="projects">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] mb-3">
              <span>Featured Systems & Engineering Portfolio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
              Production Architectures
            </h2>
            <p className="mt-3 text-base text-[var(--text-secondary)] max-w-xl">
              Battle-tested banking platforms, real-time kinship graphs, low-latency ML scoring engines, and open-source tools.
            </p>
          </div>

          {/* Interactive Search Bar */}
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tech or keyword..."
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

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-10 p-1.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] w-fit max-w-full overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                filter === tab.id
                  ? "bg-[var(--accent-royal)] text-[#ffffff] shadow-md shadow-blue-500/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              className="flex flex-col justify-between rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-7 hover:border-[var(--accent-line)] hover:bg-[var(--bg-card-hover)] transition-all duration-300 group shadow-sm hover:shadow-xl hover:-translate-y-1 relative"
            >
              <div>
                {/* Top Header: Category & Metric */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                    {project.categoryLabel}
                  </span>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span>{project.metric}</span>
                  </div>
                </div>

                {/* Title & Role */}
                <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition mb-1">
                  {project.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-medium mb-3">
                  {project.role}
                </p>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                  {project.summary}
                </p>

                {/* Highlights */}
                <ul className="space-y-2 mb-6 pl-0 list-none">
                  {project.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                      <span className="text-[var(--accent)] font-bold mt-0.5">▸</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom: Stack, Interactive Blueprint Trigger & Links */}
              <div className="pt-4 border-t border-[var(--border)]">
                {/* Tech Stack Icons & Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.stack.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-secondary)]"
                    >
                      <TechIcon name={t} className="w-3.5 h-3.5" />
                      <span>{t}</span>
                    </span>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"
                  >
                    <span>Inspect Architecture Flow</span>
                    <span>→</span>
                  </button>

                  {project.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:border-[var(--accent)] transition"
                    >
                      <span>{link.label}</span>
                      <svg className="w-3.5 h-3.5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="p-12 text-center rounded-3xl border border-dashed border-[var(--border)] bg-[var(--bg-card)]">
            <p className="text-base text-[var(--text-muted)]">No projects match your filter or search query.</p>
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
              className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-royal)] text-[#ffffff]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Interactive Blueprint Modal */}
      {selectedProject && (
        <ArchitectureModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  );
}
