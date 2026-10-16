import { profile } from "../portfolio";
import { PAGE_CONTAINER } from "./layout";

export function SiteFooter() {
  return (
    <footer className={PAGE_CONTAINER + " flex flex-col gap-3 border-t border-[var(--line)] py-6 text-[12px] text-[var(--dim)] sm:flex-row sm:items-center sm:justify-between"}>
      <a className="font-semibold text-[var(--ink)]" href="#top">{profile.name}</a>
      <span>Full-stack engineer · {profile.location}</span>
      <div className="flex items-center gap-5">
        <span>© {new Date().getFullYear()}</span>
        <a className="text-[var(--muted)] transition hover:text-[var(--accent)]" href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
