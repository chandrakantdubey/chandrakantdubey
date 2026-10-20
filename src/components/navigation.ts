export type WorkspaceView = "home" | "work" | "journal" | "packages" | "contact";

export const navigation: { id: WorkspaceView; label: string; short: string; glyph: string }[] = [
  { id: "home", label: "Overview", short: "Home", glyph: "⌂" },
  { id: "work", label: "Workbench", short: "Work", glyph: "▤" },
  { id: "journal", label: "Journal", short: "Journal", glyph: "◷" },
  { id: "packages", label: "Packages", short: "Stack", glyph: "▧" },
  { id: "contact", label: "Contact", short: "Contact", glyph: "↗" },
];

export function readHash() {
  const [route = "home", projectId] = window.location.hash.replace(/^#/, "").split("/");
  if (route === "work") return { view: "work" as const, projectId };
  if (route === "journal" || route === "experience") return { view: "journal" as const };
  if (route === "packages" || route === "stack" || route === "skills") return { view: "packages" as const };
  if (route === "contact") return { view: "contact" as const };
  return { view: "home" as const };
}
