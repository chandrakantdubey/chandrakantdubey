export function HomeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none">
      <path d="m3.5 10.5 8.5-7 8.5 7v9a1 1 0 0 1-1 1h-5.25v-6.25h-4.5v6.25H4.5a1 1 0 0 1-1-1v-9Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 8.5v-2h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BrandMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 48 48" fill="none">
      <rect x="1.5" y="1.5" width="45" height="45" rx="15" fill="var(--panel-raised)" stroke="var(--accent)" strokeOpacity=".85" />
      <text x="22" y="34" textAnchor="middle" fill="var(--accent)" fontFamily="Georgia, 'Times New Roman', serif" fontSize="34" fontWeight="600">C</text>
      <circle cx="36.5" cy="33.5" r="2.5" fill="var(--cyan)" />
    </svg>
  );
}

export function ExternalArrow() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
      <path d="M5 3h8v8M13 3 6.5 9.5M11 9v4H3V5h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="none">
      <path d="M4.5 10h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
