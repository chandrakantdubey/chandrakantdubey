import { useState } from "react";
import type { Project } from "../portfolio";
import { TechIcon } from "./TechIcons";

export function ArchitectureModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"flow" | "code">("flow");
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    if (!project.codeSnippet) return;
    try {
      await navigator.clipboard.writeText(project.codeSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl p-5 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-line)]">
                {project.categoryLabel}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                Architecture Blueprint
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              {project.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 my-5 p-1 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("flow")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "flow"
                ? "bg-[var(--accent-royal)] text-[#ffffff] shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            Interactive System Flow
          </button>
          {project.codeSnippet && (
            <button
              type="button"
              onClick={() => setActiveTab("code")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "code"
                  ? "bg-[var(--accent-royal)] text-[#ffffff] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Production Code Preview
            </button>
          )}
        </div>

        {/* System Flow Diagram Tab */}
        {activeTab === "flow" && (
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Step-by-step architectural execution pipeline for <strong className="text-[var(--text-primary)]">{project.name}</strong>:
            </p>

            {project.systemFlow && project.systemFlow.length > 0 ? (
              <div className="space-y-3 pt-2">
                {project.systemFlow.map((step, idx) => (
                  <div
                    key={idx}
                    className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] hover:border-[var(--accent-line)] transition group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-line)] text-[var(--accent)] flex items-center justify-center font-bold text-xs shrink-0">
                        0{idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition">
                            {step.title}
                          </h4>
                          <span className="text-[11px] font-medium text-[var(--text-muted)]">
                            · {step.role}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          {step.detail}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)]">
                        {step.tech}
                      </span>
                      {step.latency && (
                        <span className="px-2 py-0.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold">
                          ~{step.latency}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
                High-level architecture documentation for this system.
              </div>
            )}
          </div>
        )}

        {/* Code Snippet Tab */}
        {activeTab === "code" && project.codeSnippet && (
          <div>
            <div className="flex items-center justify-between gap-3 mb-2 px-1">
              <span className="font-mono text-xs text-[var(--text-muted)]">
                {project.codeSnippet.filename}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="px-3 py-1 rounded-lg text-xs font-semibold border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition"
              >
                {copied ? "Copied! ✓" : "Copy Code"}
              </button>
            </div>
            <pre className="p-4 sm:p-5 rounded-2xl bg-[#030712] border border-[var(--border)] overflow-x-auto text-xs sm:text-sm font-mono text-blue-200 leading-relaxed">
              <code>{project.codeSnippet.code}</code>
            </pre>
          </div>
        )}

        {/* Footer Tech Badges */}
        <div className="mt-6 pt-5 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Stack:</span>
            {project.stack.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)]"
              >
                <TechIcon name={t} className="w-3.5 h-3.5" />
                <span>{t}</span>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--accent-royal)] text-[#ffffff] hover:bg-blue-600 transition"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
}
