import { profile } from "../portfolio";
import { PAGE_CONTAINER } from "./layout";

export function SiteFooter() {
  return (
    <footer className={PAGE_CONTAINER + " pb-8 pt-3 text-[12px] text-[var(--dim)]"}>
      <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <a className="font-[family-name:var(--font-mono)] text-[13px] text-[var(--muted)]" href="#top"><span className="text-[var(--accent)]">$</span> cd ~/{profile.name.toLowerCase().replaceAll(" ", "")}</a>
        <div className="flex items-center gap-5 font-[family-name:var(--font-mono)] text-[12px]">
          <span>© {new Date().getFullYear()}</span>
          <a className="inline-flex min-h-11 items-center text-[var(--muted)] transition hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]" href="#top">top ↑</a>
        </div>
      </div>
    </footer>
  );
}
