import { useId } from "react";

export type TextureKind = "scales" | "contours" | "circuit" | "grid" | "dots";

export function Texture({ kind, className = "", opacity = 0.12 }: { kind: TextureKind; className?: string; opacity?: number }) {
  const patternId = `drakon-${kind}-${useId().replaceAll(":", "")}`;

  return <svg className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} viewBox="0 0 480 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      {kind === "scales" && <pattern id={patternId} width="56" height="48" patternUnits="userSpaceOnUse">
        <path d="M0 0c1 13 13 23 28 23S55 13 56 0M-28 24c1 13 13 23 28 23s27-10 28-23m0 0c1 13 13 23 28 23s27-10 28-23" fill="none" stroke="var(--dragon)" strokeWidth=".85" />
        <path d="M28 23v4m-28 20v-4m56 4v-4" stroke="var(--dragon)" strokeOpacity=".45" strokeWidth=".7" strokeLinecap="round" />
      </pattern>}
      {kind === "contours" && <pattern id={patternId} width="220" height="156" patternUnits="userSpaceOnUse">
        <path d="M-42 104c27-43 62-57 93-38 32 19 53 20 87-6 28-22 59-27 103-9M-48 125c34-39 62-48 92-30 34 20 58 19 92-7 33-24 61-26 105-7M-35 82c24-43 62-62 94-42 30 18 49 20 83-5 31-23 59-29 100-12M-26 59c24-42 58-61 91-42 31 18 47 20 80-5 31-23 58-29 99-13" fill="none" stroke="var(--dragon)" strokeWidth=".9" />
      </pattern>}
      {kind === "circuit" && <pattern id={patternId} width="128" height="104" patternUnits="userSpaceOnUse">
        <path d="M0 24h31v26h24m0 0h21V13h52M31 24V0M55 50v34h25v20M76 50h52M17 50v31h17m42-31V27h26" fill="none" stroke="var(--dragon)" strokeWidth=".9" />
        <circle cx="31" cy="24" r="2.2" fill="var(--panel)" stroke="var(--dragon)" strokeWidth="1" /><circle cx="55" cy="50" r="2.2" fill="var(--panel)" stroke="var(--dragon)" strokeWidth="1" /><circle cx="76" cy="50" r="2.2" fill="var(--panel)" stroke="var(--dragon)" strokeWidth="1" />
      </pattern>}
      {kind === "grid" && <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0v40" fill="none" stroke="var(--dragon)" strokeOpacity=".72" strokeWidth=".65" />
        <path d="M20 0v40M0 20h40" fill="none" stroke="var(--dragon)" strokeOpacity=".25" strokeWidth=".55" strokeDasharray="1 5" />
        <circle cx="0" cy="0" r="1.2" fill="var(--dragon)" />
      </pattern>}
      {kind === "dots" && <pattern id={patternId} width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="3" r=".85" fill="var(--dragon)" />
        <circle cx="14" cy="14" r=".55" fill="var(--cyan)" fillOpacity=".75" />
      </pattern>}
    </defs>
    <rect width="100%" height="100%" fill={`url(#${patternId})`} opacity={opacity} />
  </svg>;
}
