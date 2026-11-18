export type ProjectId = "stylescape" | "pokedex" | "fitstream" | "mh15";

export interface Project {
  id: ProjectId;
  number: string;
  name: string;
  kind: string;
  stack: string[];
  description: string;
  source: string;
  secondSource?: { label: string; url: string };
  interaction: string;
}

export const projects: Project[] = [
  {
    id: "stylescape",
    number: "01",
    name: "StyleScape",
    kind: "CREATIVE TOOLS",
    description: "Procedural backgrounds, seeded SVG rendering and exportable design assets.",
    stack: ["REACT", "TYPESCRIPT", "SVG", "ZUSTAND"],
    source: "https://github.com/chandrakantdubey/style-scape",
    interaction: "GENERATE A PATTERN",
  },
  {
    id: "pokedex",
    number: "02",
    name: "Pokédex RPG",
    kind: "GAME SYSTEMS",
    description: "Turn-based gameplay, trainer state and a layered FastAPI / PostgreSQL backend.",
    stack: ["REACT NATIVE", "FASTAPI", "POSTGRESQL"],
    source: "https://github.com/chandrakantdubey/pokedex-backend",
    secondSource: { label: "APP SOURCE", url: "https://github.com/chandrakantdubey/pokedex" },
    interaction: "PLAY A MICRO ENCOUNTER",
  },
  {
    id: "fitstream",
    number: "03",
    name: "FitStream",
    kind: "FITNESS PLATFORM",
    description: "Workout tracking, GPS routes, analytics and a fitness progressive web app.",
    stack: ["REACT", "FASTAPI", "LEAFLET", "PWA"],
    source: "https://github.com/chandrakantdubey/fitstream",
    interaction: "RUN A ROUTE PREVIEW",
  },
  {
    id: "mh15",
    number: "04",
    name: "MH15",
    kind: "LOCAL-FIRST NOTEBOOK",
    description: "A stylus-first notebook designed around a renderer-independent document engine.",
    stack: ["TYPESCRIPT", "REACT NATIVE", "SKIA", "SQLITE"],
    source: "https://github.com/chandrakantdubey/mh15",
    interaction: "DRAW ON THE CANVAS",
  },
];

export const experience = [
  { number: "01", company: "Adeptken", role: "Full Stack Engineer", period: "JAN 2026 — PRESENT", detail: "Enterprise workflows, backend APIs and cloud infrastructure." },
  { number: "02", company: "Nutriiya", role: "Full Stack Engineer · Contract", period: "SEP 2025 — DEC 2025", detail: "Full-stack product engineering and nutritional health interfaces." },
  { number: "03", company: "Kintree", role: "Full Stack Developer", period: "NOV 2024 — JAN 2026", detail: "Collaborative family graphs, responsive interfaces and API services." },
  { number: "04", company: "Uvation", role: "Software Engineer · Frontend", period: "AUG 2023 — OCT 2024", detail: "Commerce platforms, customer experiences and frontend systems." },
] as const;

export const skillGroups = [
  { id: "frontend", name: "FRONTEND", color: "#d7fa71", items: ["React", "TypeScript", "Next.js", "JavaScript", "Tailwind CSS", "HTML / CSS", "React Native", "Zustand"] },
  { id: "backend", name: "BACKEND", color: "#a4a3ff", items: ["Python", "FastAPI", "Node.js", "Express", "REST APIs", "PostgreSQL", "Redis", "SQLAlchemy"] },
  { id: "cloud", name: "CLOUD & INFRA", color: "#83d9e5", items: ["AWS", "Docker", "Kubernetes", "GitHub Actions", "CI / CD", "Linux", "Terraform", "Vercel"] },
  { id: "systems", name: "SYSTEMS & AI", color: "#ff9c7e", items: ["Distributed Systems", "System Design", "Caching", "Observability", "ML Pipelines", "LLM Applications", "API Design", "Performance"] },
] as const;

export const contact = {
  email: "919chandrakant@gmail.com",
  github: "https://github.com/chandrakantdubey",
  linkedin: "https://www.linkedin.com/in/chandra-kant-dubey/",
  resume: "/Chandrakant_Dubey.pdf",
} as const;
