export type ThemeName = "evergreen" | "paper" | "void" | "glacial";

export const themes: { id: ThemeName; name: string; description: string; surface: string; scheme: "dark" | "light" }[] = [
  { id: "evergreen", name: "Dragonfire", description: "Acid lime · deep forest", surface: "#0a1410", scheme: "dark" },
  { id: "void", name: "Emberglass", description: "Hot coral · ink violet", surface: "#160f1e", scheme: "dark" },
  { id: "paper", name: "Citrus paper", description: "Warm ivory · vermilion", surface: "#fff8e9", scheme: "light" },
  { id: "glacial", name: "Tidal blue", description: "Clear sky · deep azure", surface: "#f1faff", scheme: "light" },
];

export const paletteClasses: Record<ThemeName, string> = {
  evergreen: "[--page:#0a1410] [--page-elevated:#0f1d16] [--panel:#12251b] [--panel-solid:#172d21] [--panel-raised:#1d3828] [--ink:#f2f8ed] [--muted:#c1d0bd] [--dim:#93a995] [--line:#304b39] [--line-strong:#496a4b] [--lime:#d4f36b] [--ember:#ff9e64] [--cyan:#65e2c3] [--violet:#c9a2ff] [--focus:#e7ff9a] [--accent:#d4f36b] [--accent-ink:#18220b] [--accent-soft:#d4f36b22] [--accent-line:#d4f36b80] [--dragon:#b7ed5a] [--dragon-soft:#b7ed5a24] [--shadow-glass:#02080470]",
  void: "[--page:#160f1e] [--page-elevated:#21152a] [--panel:#281a31] [--panel-solid:#30203a] [--panel-raised:#3d2947] [--ink:#fff4f7] [--muted:#dbc5d4] [--dim:#b39aaa] [--line:#51374f] [--line-strong:#714c67] [--lime:#d4f36b] [--ember:#ffad6e] [--cyan:#79e6e7] [--violet:#e6a5ff] [--focus:#ffd1e9] [--accent:#ff79b7] [--accent-ink:#321126] [--accent-soft:#ff79b724] [--accent-line:#ff79b780] [--dragon:#ff986c] [--dragon-soft:#ff986c26] [--shadow-glass:#09040c80]",
  paper: "[--page:#fff8e9] [--page-elevated:#fff0d4] [--panel:#fffdf7] [--panel-solid:#fffdf7] [--panel-raised:#f8e7c8] [--ink:#2b2118] [--muted:#594b3e] [--dim:#766758] [--line:#e7d7bd] [--line-strong:#cdb795] [--lime:#557b19] [--ember:#a9381d] [--cyan:#08746e] [--violet:#7047a0] [--focus:#b73e20] [--accent:#b83f20] [--accent-ink:#fffaf0] [--accent-soft:#b83f2018] [--accent-line:#b83f2070] [--dragon:#cd5c2f] [--dragon-soft:#cd5c2f18] [--shadow-glass:#5c381a1f]",
  glacial: "[--page:#f1faff] [--page-elevated:#e3f4ff] [--panel:#fbfeff] [--panel-solid:#fbfeff] [--panel-raised:#dff1fb] [--ink:#152a39] [--muted:#405a6b] [--dim:#60798a] [--line:#c9e1ee] [--line-strong:#9fc4d6] [--lime:#507b1e] [--ember:#b34b2c] [--cyan:#056f91] [--violet:#6248ad] [--focus:#075d9b] [--accent:#086cae] [--accent-ink:#f5fbff] [--accent-soft:#086cae18] [--accent-line:#086cae70] [--dragon:#087d91] [--dragon-soft:#087d9119] [--shadow-glass:#163d561d]",
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
