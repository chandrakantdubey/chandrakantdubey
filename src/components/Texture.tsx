import { useId } from "react";

export type TextureKind = "scales" | "contours" | "circuit" | "grid" | "dots";

export function Texture({ kind, className = "", opacity = 0.16 }: { kind: TextureKind; className?: string; opacity?: number }) {
  const patternId = `drakon-${kind}-${useId().replaceAll(":", "")}`;

  return <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} viewBox="0 0 480 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      {kind === "scales" && <pattern id={patternId} width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M0 0c0 8 8 16 16 16S32 8 32 0M-16 16c0 8 8 16 16 16s16-8 16-16m0 0c0 8 8 16 16 16s16-8 16-16" fill="none" stroke="var(--dragon)" strokeWidth="1" />
      </pattern>}
      {kind === "contours" && <pattern id={patternId} width="180" height="120" patternUnits="userSpaceOnUse">
        <path d="M-36 66c27-45 58-52 88-37s47 13 75-9 56-19 78 1M-42 88c31-39 58-42 86-27s49 14 79-8 58-20 83-1M-38 110c28-31 57-34 84-18s50 14 81-8 56-20 84-2M-30 43C2 1 34-7 64 8s48 14 76-8 51-20 73 1" fill="none" stroke="var(--dragon)" strokeWidth="1" />
      </pattern>}
      {kind === "circuit" && <pattern id={patternId} width="96" height="80" patternUnits="userSpaceOnUse">
        <path d="M0 20h26v20h22m0 0h18V8h30M26 20V0M48 40v26h24v14M66 40h30M18 40v24h16m32-24V20" fill="none" stroke="var(--dragon)" strokeWidth="1" />
        <circle cx="26" cy="20" r="2.5" fill="var(--dragon)" /><circle cx="48" cy="40" r="2.5" fill="var(--dragon)" /><circle cx="66" cy="40" r="2.5" fill="var(--dragon)" />
      </pattern>}
      {kind === "grid" && <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
        <path d="M28 0H0v28" fill="none" stroke="var(--dragon)" strokeWidth=".8" />
      </pattern>}
      {kind === "dots" && <pattern id={patternId} width="18" height="18" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.15" fill="var(--dragon)" />
      </pattern>}
    </defs>
    <rect width="100%" height="100%" fill={`url(#${patternId})`} opacity={opacity} />
  </svg>;
}
