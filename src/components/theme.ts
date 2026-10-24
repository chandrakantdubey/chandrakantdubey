export type ThemeName = "evergreen" | "paper" | "void" | "glacial";

export const themes: { id: ThemeName; name: string; description: string; surface: string; scheme: "dark" | "light" }[] = [
  { id: "void", name: "Lightning Blue", description: "Electric blue · midnight shell", surface: "#071421", scheme: "dark" },
  { id: "evergreen", name: "Neon Green", description: "Laser green · deep forest", surface: "#081710", scheme: "dark" },
  { id: "paper", name: "Burning Red", description: "Signal red · warm ivory", surface: "#fff8f1", scheme: "light" },
  { id: "glacial", name: "Cyan", description: "Bright cyan · ice terminal", surface: "#effbff", scheme: "light" },
];

export const paletteClasses: Record<ThemeName, string> = {
  evergreen: "[--page:#081710] [--page-elevated:#0c2015] [--panel:#10271a] [--panel-solid:#15321f] [--panel-raised:#1c3d26] [--ink:#f2ffec] [--muted:#c3ddc5] [--dim:#8fad96] [--line:#284b34] [--line-strong:#3d6b46] [--lime:#b4ff45] [--ember:#ff765d] [--cyan:#53e6d2] [--violet:#c4a7ff] [--focus:#d6ff9c] [--accent:#adff3f] [--accent-ink:#11200b] [--accent-soft:#adff3f24] [--accent-line:#adff3f82] [--dragon:#adff3f] [--dragon-soft:#adff3f21] [--shadow-glass:#020b0570]",
  void: "[--page:#071421] [--page-elevated:#0b1d31] [--panel:#102740] [--panel-solid:#153150] [--panel-raised:#1c3e62] [--ink:#eff8ff] [--muted:#c2d8eb] [--dim:#8eabc7] [--line:#284867] [--line-strong:#3c6792] [--lime:#baff4a] [--ember:#ff705d] [--cyan:#5ef1ea] [--violet:#c1b5ff] [--focus:#a9d7ff] [--accent:#56adff] [--accent-ink:#071829] [--accent-soft:#56adff25] [--accent-line:#56adff85] [--dragon:#56adff] [--dragon-soft:#56adff25] [--shadow-glass:#020a147a]",
  paper: "[--page:#fff8f1] [--page-elevated:#fff0e6] [--panel:#fffdfb] [--panel-solid:#fffdfb] [--panel-raised:#ffe7d9] [--ink:#321e1b] [--muted:#654741] [--dim:#8a6b64] [--line:#efd5c8] [--line-strong:#d8aa98] [--lime:#397522] [--ember:#b83527] [--cyan:#087b76] [--violet:#7047a0] [--focus:#a82724] [--accent:#d6332b] [--accent-ink:#fffaf7] [--accent-soft:#d6332b18] [--accent-line:#d6332b75] [--dragon:#d6332b] [--dragon-soft:#d6332b16] [--shadow-glass:#5b2a201c]",
  glacial: "[--page:#effbff] [--page-elevated:#def5fb] [--panel:#fbfeff] [--panel-solid:#fbfeff] [--panel-raised:#d9f1f7] [--ink:#102c39] [--muted:#3c5d6b] [--dim:#64818e] [--line:#c5e5eb] [--line-strong:#91c8d2] [--lime:#477b23] [--ember:#bd492e] [--cyan:#007c96] [--violet:#6349a5] [--focus:#006f87] [--accent:#008da7] [--accent-ink:#f6feff] [--accent-soft:#008da71b] [--accent-line:#008da775] [--dragon:#008da7] [--dragon-soft:#008da718] [--shadow-glass:#143d4b1d]",
};

const storageKey = "chandrakant-portfolio-theme-terminal-v1";

export function getSavedTheme(): ThemeName {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "evergreen" || saved === "paper" || saved === "void" || saved === "glacial") return saved;
    if (saved === "jade" || saved === "forest") return "evergreen";
    if (saved === "amber" || saved === "light") return "paper";
    if (saved === "purple" || saved === "dragon") return "void";
    if (saved === "cyan" || saved === "ice") return "glacial";
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "paper" : "evergreen";
  } catch {
    return "evergreen";
  }
}
