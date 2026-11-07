import { profile } from "../portfolio";

export function About() {
  const pillars = [
    {
      title: "Backend & Microservices",
      desc: "Architecting high-throughput RESTful services, real-time WebSockets, and asynchronous pipelines in Python, FastAPI, and Node.js.",
      badge: "FastAPI · Python · Node.js",
      gradient: "from-blue-500 to-cyan-500",
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
    },
    {
      title: "Modern Web Frontends",
      desc: "Delivering accessible, highly responsive web experiences using React 19, Next.js, TypeScript, and state management via Redux Toolkit & React Query.",
      badge: "React 19 · Next.js · Redux",
      gradient: "from-indigo-500 to-purple-500",
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Enterprise Data & Cache",
      desc: "Designing resilient relational schemas, index optimizations, and caching layers using Oracle Database, PostgreSQL, and Redis.",
      badge: "Oracle · PostgreSQL · Redis",
      gradient: "from-emerald-500 to-teal-500",
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
    },
    {
      title: "Applied ML Inference",
      desc: "Integrating machine learning models into live production applications with sub-50ms inference targets, validation layers, and containerization.",
      badge: "P99 < 45ms · RHEL · Docker",
      gradient: "from-pink-500 to-rose-500",
      icon: (
        <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 sm:py-28 border-t border-[var(--border)] relative" id="about">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)] mb-3">
            <span>Engineering Philosophy & Scope</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            Architecting solutions from interface to data layer.
          </h2>
          <p className="mt-4 text-base text-[var(--text-secondary)] leading-relaxed">
            {profile.about}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="p-6 sm:p-7 rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent-line)] hover:bg-[var(--bg-card-hover)] transition-all duration-300 group shadow-sm hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] flex items-center justify-center mb-5 group-hover:scale-110 transition shadow-sm">
                  {pillar.icon}
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border)]">
                <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  {pillar.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
