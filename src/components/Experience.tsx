import { experience } from "../portfolio";
import { TechIcon } from "./TechIcons";

export function Experience() {
  return (
    <section className="py-20 sm:py-28 border-t border-[var(--border)] relative" id="experience">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] mb-3">
            <span>Career & Engineering Track Record</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            Professional Experience
          </h2>
          <p className="mt-3 text-base text-[var(--text-secondary)]">
            Delivering scalable enterprise architectures, real-time products, and production microservices in Mumbai, India 🇮🇳.
          </p>
        </div>

        {/* Timeline List */}
        <div className="relative pl-6 sm:pl-8 border-l border-[var(--border)] space-y-12">
          {experience.map((job) => (
            <div key={job.id} className="relative group">
              {/* Timeline Indicator Dot with Glow */}
              <div
                className="absolute -left-[31px] sm:-left-[39px] top-2 w-4 h-4 rounded-full border-2 border-[var(--border)] bg-[var(--bg-primary)] group-hover:scale-125 transition-transform duration-300 shadow-md"
                style={{ borderColor: job.accent }}
              >
                <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{ backgroundColor: job.accent }} />
              </div>

              {/* Card Container */}
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 sm:p-8 hover:border-[var(--accent-line)] hover:bg-[var(--bg-card-hover)] transition-all duration-300 shadow-sm hover:shadow-lg">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition">
                      {job.role}
                    </h3>
                    <p className="text-sm font-semibold mt-1" style={{ color: job.accent }}>
                      {job.company} · <span className="font-normal text-[var(--text-muted)]">{job.location}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-secondary)]">
                      {job.period}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-blue-500/20 bg-blue-500/10 text-blue-400">
                      {job.type}
                    </span>
                  </div>
                </div>

                {/* Role Summary */}
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                  {job.summary}
                </p>

                {/* Achievements List */}
                <div className="space-y-2.5 mb-6 pl-0 list-none">
                  {job.achievements.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      <span className="font-bold mt-0.5" style={{ color: job.accent }}>▸</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Tech Stack Badges */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border)]">
                  {job.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                    >
                      <TechIcon name={tech} className="w-3.5 h-3.5" />
                      <span>{tech}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
