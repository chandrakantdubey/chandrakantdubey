export type ThemeName = "evergreen" | "paper" | "void" | "glacial";

export const themes: { id: ThemeName; name: string; description: string; surface: string; scheme: "dark" | "light" }[] = [
  { id: "evergreen", name: "Evergreen", description: "Jade signal on deep pine", surface: "#07110d", scheme: "dark" },
  { id: "paper", name: "Paper terminal", description: "Warm ivory and ink", surface: "#f3f0e7", scheme: "light" },
  { id: "void", name: "Void dragon", description: "Violet heat on obsidian", surface: "#100d18", scheme: "dark" },
  { id: "glacial", name: "Glacial cyan", description: "Clear ice and midnight", surface: "#08131a", scheme: "dark" },
];

export const paletteClasses: Record<ThemeName, string> = {
  evergreen: "[--page:#07110d] [--page-elevated:#0b1812] [--panel:#0d1d16] [--panel-solid:#10231a] [--panel-raised:#13281e] [--ink:#eef8ef] [--muted:#a6bbaa] [--dim:#7d9682] [--line:#294133] [--line-strong:#3a5744] [--lime:#b7f36b] [--ember:#ffad72] [--cyan:#78e1d2] [--violet:#d0a5ff] [--focus:#d5ff95] [--accent:#b7f36b] [--accent-ink:#13200e] [--accent-soft:#b7f36b24] [--accent-line:#b7f36b70] [--dragon:#b7f36b] [--dragon-soft:#b7f36b1a] [--shadow-glass:#00000055]",
  paper: "[--page:#f3f0e7] [--page-elevated:#eae6da] [--panel:#fffdf6] [--panel-solid:#fffdf6] [--panel-raised:#e7efe1] [--ink:#1e2922] [--muted:#46584a] [--dim:#697a6d] [--line:#d5d7c8] [--line-strong:#b9c0b2] [--lime:#3c742d] [--ember:#9c4b26] [--cyan:#176a69] [--violet:#704997] [--focus:#246a27] [--accent:#3c742d] [--accent-ink:#fbfff7] [--accent-soft:#3c742d18] [--accent-line:#3c742d70] [--dragon:#548c3b] [--dragon-soft:#548c3b16] [--shadow-glass:#28352518]",
  void: "[--page:#100d18] [--page-elevated:#171220] [--panel:#1a1525] [--panel-solid:#211a30] [--panel-raised:#2b203b] [--ink:#f5efff] [--muted:#c1b4d3] [--dim:#9386a6] [--line:#3a2f4a] [--line-strong:#59436d] [--lime:#d1ff75] [--ember:#ff9d78] [--cyan:#78e5f0] [--violet:#d9a6ff] [--focus:#edc8ff] [--accent:#d9a6ff] [--accent-ink:#211326] [--accent-soft:#d9a6ff24] [--accent-line:#d9a6ff70] [--dragon:#ff9d78] [--dragon-soft:#ff9d781b] [--shadow-glass:#00000060]",
  glacial: "[--page:#08131a] [--page-elevated:#0d1b23] [--panel:#10232c] [--panel-solid:#142a35] [--panel-raised:#193743] [--ink:#eaf8fb] [--muted:#abc3ca] [--dim:#809ca5] [--line:#284651] [--line-strong:#3d6571] [--lime:#b5f074] [--ember:#ffbd83] [--cyan:#75e6f4] [--violet:#c0b1ff] [--focus:#aaf3ff] [--accent:#75e6f4] [--accent-ink:#092027] [--accent-soft:#75e6f424] [--accent-line:#75e6f470] [--dragon:#75e6f4] [--dragon-soft:#75e6f41c] [--shadow-glass:#00000055]",
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
