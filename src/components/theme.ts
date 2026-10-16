export type ThemeName = "nocturne" | "clay" | "cobalt" | "grove";

export const themes: { id: ThemeName; name: string; swatchClass: string; surface: string }[] = [
  { id: "nocturne", name: "Nocturne", swatchClass: "bg-[#c7e7a3]", surface: "#111817" },
  { id: "clay", name: "Clay", swatchClass: "bg-[#b34b35]", surface: "#faf8f3" },
  { id: "cobalt", name: "Cobalt", swatchClass: "bg-[#aebdff]", surface: "#171a2b" },
  { id: "grove", name: "Grove", swatchClass: "bg-[#aacb8d]", surface: "#171d18" },
];

export const paletteClasses: Record<ThemeName, string> = {
  nocturne: "[--page:#111817] [--panel:#19211f] [--panel-raised:#202b27] [--ink:#f5f4ec] [--muted:#c4cbc3] [--dim:#9ba69d] [--line:#303b36] [--line-strong:#4b5a51] [--accent:#c7e7a3] [--accent-ink:#1d281e] [--accent-soft:rgba(199,231,163,.12)] [--accent-line:rgba(199,231,163,.35)] [--art-panel:#e7eee1] [--art-ink:#26372b] [--art-muted:#5b6b5d] [--art-highlight:#d89071]",
  clay: "[--page:#faf8f3] [--panel:#ffffff] [--panel-raised:#f2eee6] [--ink:#252720] [--muted:#5e625b] [--dim:#777c73] [--line:#e3e2d9] [--line-strong:#c9cbc1] [--accent:#a63e2d] [--accent-ink:#fffaf4] [--accent-soft:rgba(166,62,45,.08)] [--accent-line:rgba(166,62,45,.34)] [--art-panel:#eeece3] [--art-ink:#31372f] [--art-muted:#636b60] [--art-highlight:#d89071]",
  cobalt: "[--page:#171a2b] [--panel:#20243a] [--panel-raised:#292e47] [--ink:#f4f4fc] [--muted:#c6c9da] [--dim:#9ca3be] [--line:#363d58] [--line-strong:#535c7b] [--accent:#aebdff] [--accent-ink:#20263e] [--accent-soft:rgba(174,189,255,.13)] [--accent-line:rgba(174,189,255,.36)] [--art-panel:#e9eaf4] [--art-ink:#30364e] [--art-muted:#656c84] [--art-highlight:#edaa83]",
  grove: "[--page:#171d18] [--panel:#202820] [--panel-raised:#29332a] [--ink:#f1f4e9] [--muted:#c0c9bd] [--dim:#99a696] [--line:#354239] [--line-strong:#536253] [--accent:#aacb8d] [--accent-ink:#1d291f] [--accent-soft:rgba(170,203,141,.12)] [--accent-line:rgba(170,203,141,.37)] [--art-panel:#e5ebdf] [--art-ink:#2c392f] [--art-muted:#5d6a5f] [--art-highlight:#d89071]",
};

export function getSavedTheme(): ThemeName {
  if (typeof window === "undefined") return "clay";
  try {
    const saved = window.localStorage.getItem("chandrakant-portfolio-theme-v2");
    if (themes.some((theme) => theme.id === saved)) return saved as ThemeName;
  } catch {
    // The palette selector stays usable when storage is unavailable.
  }
  return "clay";
}
