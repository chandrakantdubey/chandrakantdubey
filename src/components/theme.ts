export type ThemeName = "evergreen" | "paper" | "void" | "glacial";
type ColorScheme = "dark" | "light";

export const themes: { id: ThemeName; name: string; swatchClass: string; surface: string; scheme: ColorScheme }[] = [
  { id: "evergreen", name: "Evergreen", swatchClass: "bg-[#C5FF4A]", surface: "#07110D", scheme: "dark" },
  { id: "paper", name: "Paper Terminal", swatchClass: "bg-[#507808]", surface: "#F6F3EA", scheme: "light" },
  { id: "void", name: "Void Dragon", swatchClass: "bg-[#BEA4FF]", surface: "#100B1D", scheme: "dark" },
  { id: "glacial", name: "Glacial Cyan", swatchClass: "bg-[#5FEAF0]", surface: "#071820", scheme: "dark" },
];

export const paletteClasses: Record<ThemeName, string> = {
  evergreen: [
    "[--page:#07110D] [--page-elevated:#0A1711] [--panel:rgba(15,31,23,.88)] [--panel-solid:#0E1D15] [--panel-raised:#13271C]",
    "[--ink:#EEF7F0] [--muted:#A2B6A8] [--dim:#8A9E90] [--line:rgba(195,235,207,.15)] [--line-strong:rgba(195,235,207,.28)]",
    "[--lime:#C5FF4A] [--ember:#FF684A] [--cyan:#4DE1E9] [--violet:#B6A0FF] [--focus:#E9FF9A]",
    "[--accent:#C5FF4A] [--accent-ink:#172407] [--accent-soft:rgba(197,255,74,.14)] [--accent-line:rgba(197,255,74,.48)]",
    "[--tone-enterprise:#C5FF4A] [--tone-wellness:#4DE1E9] [--tone-community:#B6A0FF] [--tone-commerce:#FF684A]",
    "[--art-panel:#0E1D15] [--art-ink:#EEF7F0] [--art-muted:#A2B6A8] [--art-highlight:#FF684A] [--shadow-glass:0_18px_60px_rgba(0,0,0,.24)]",
  ].join(" "),
  paper: [
    "[--page:#F6F3EA] [--page-elevated:#FBFAF6] [--panel:rgba(255,255,255,.86)] [--panel-solid:#FFFFFF] [--panel-raised:#F0EEE6]",
    "[--ink:#172A32] [--muted:#52676C] [--dim:#63777A] [--line:rgba(23,42,50,.13)] [--line-strong:rgba(23,42,50,.23)]",
    "[--lime:#507808] [--ember:#B9442D] [--cyan:#087F91] [--violet:#7650C8] [--focus:#496C09]",
    "[--accent:#507808] [--accent-ink:#FFFFFF] [--accent-soft:rgba(80,120,8,.10)] [--accent-line:rgba(80,120,8,.40)]",
    "[--tone-enterprise:#507808] [--tone-wellness:#087F91] [--tone-community:#7650C8] [--tone-commerce:#B9442D]",
    "[--art-panel:#FFFFFF] [--art-ink:#172A32] [--art-muted:#52676C] [--art-highlight:#7650C8] [--shadow-glass:0_18px_50px_rgba(32,29,20,.12)]",
  ].join(" "),
  void: [
    "[--page:#100B1D] [--page-elevated:#151027] [--panel:rgba(29,22,49,.88)] [--panel-solid:#1D1631] [--panel-raised:#29203F]",
    "[--ink:#F4F0FF] [--muted:#B7ACD0] [--dim:#A095B8] [--line:rgba(212,196,255,.15)] [--line-strong:rgba(212,196,255,.27)]",
    "[--lime:#D3FF63] [--ember:#FF795E] [--cyan:#5FEAF0] [--violet:#BEA4FF] [--focus:#E3D6FF]",
    "[--accent:#BEA4FF] [--accent-ink:#211339] [--accent-soft:rgba(190,164,255,.16)] [--accent-line:rgba(190,164,255,.48)]",
    "[--tone-enterprise:#D3FF63] [--tone-wellness:#5FEAF0] [--tone-community:#BEA4FF] [--tone-commerce:#FF795E]",
    "[--art-panel:#1D1631] [--art-ink:#F4F0FF] [--art-muted:#B7ACD0] [--art-highlight:#5FEAF0] [--shadow-glass:0_18px_60px_rgba(0,0,0,.32)]",
  ].join(" "),
  glacial: [
    "[--page:#071820] [--page-elevated:#0B2029] [--panel:rgba(13,35,44,.90)] [--panel-solid:#102630] [--panel-raised:#173640]",
    "[--ink:#F1FCFF] [--muted:#B8D6DC] [--dim:#91B3BB] [--line:rgba(172,225,235,.15)] [--line-strong:rgba(172,225,235,.28)]",
    "[--lime:#D0FF79] [--ember:#FF9278] [--cyan:#5FEAF0] [--violet:#C2A2FF] [--focus:#B6FBFF]",
    "[--accent:#5FEAF0] [--accent-ink:#04262B] [--accent-soft:rgba(95,234,240,.14)] [--accent-line:rgba(95,234,240,.48)]",
    "[--tone-enterprise:#D0FF79] [--tone-wellness:#5FEAF0] [--tone-community:#C2A2FF] [--tone-commerce:#FF9278]",
    "[--art-panel:#102630] [--art-ink:#F1FCFF] [--art-muted:#B8D6DC] [--art-highlight:#FF9278] [--shadow-glass:0_18px_60px_rgba(0,0,0,.30)]",
  ].join(" "),
};

const savedThemeKey = "chandrakant-portfolio-theme-terminal-v1";
const olderThemeIds: Record<string, ThemeName> = {
  nocturne: "evergreen",
  clay: "paper",
  cobalt: "void",
  grove: "glacial",
};

export function getSavedTheme(): ThemeName {
  if (typeof window === "undefined") return "evergreen";
  try {
    const saved = window.localStorage.getItem(savedThemeKey);
    if (themes.some((theme) => theme.id === saved)) return saved as ThemeName;
    if (saved && olderThemeIds[saved]) return olderThemeIds[saved];
  } catch {
    // The palette selector stays usable when storage is unavailable.
  }
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "paper" : "evergreen";
}
