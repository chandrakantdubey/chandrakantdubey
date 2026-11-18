export type ProjectCategory = "realtime" | "operations" | "creative" | "mobile" | "fullstack" | "platform";

export interface FeaturedProject {
  id: string;
  number: string;
  name: string;
  category: ProjectCategory;
  label: string;
  description: string;
  implementation: string;
  stack: readonly string[];
  repository: string;
  secondary?: { label: string; url: string };
  status?: string;
}

export const featuredProjects: readonly FeaturedProject[] = [
  {
    id: "blackout",
    number: "01",
    name: "Blackout Protocol",
    category: "realtime",
    label: "REAL-TIME MULTIPLAYER",
    description: "A cooperative city-grid routing game. Six operator roles, shared live relay maps and three escalating repair waves.",
    implementation: "Authoritative Colyseus rooms; validated tile actions; room reconnect grace periods.",
    stack: ["Next.js", "TypeScript", "Colyseus", "WebSockets"],
    repository: "https://github.com/chandrakantdubey/blackout-protocol",
  },
  {
    id: "timesheet",
    number: "02",
    name: "Timesheet",
    category: "operations",
    label: "ENTERPRISE APPLICATION",
    description: "A workforce management application with timesheets, leave workflows, attendance tracking and a companion browser extension.",
    implementation: "Independent Express and HRMS services; Oracle persistence; role-based access and a Manifest V3 companion.",
    stack: ["React", "Node.js", "Oracle DB", "Chrome MV3"],
    repository: "https://github.com/chandrakantdubey/timesheet",
    status: "PROTOTYPE",
  },
  {
    id: "stylescape",
    number: "03",
    name: "StyleScape",
    category: "creative",
    label: "RENDERING & CREATIVE TOOLS",
    description: "A procedural background generator with editable layers, seeded patterns and SVG, CSS and PNG export.",
    implementation: "Pure SVG renderer; serializable scene primitives; persisted-state migrations.",
    stack: ["React", "TypeScript", "SVG", "Zustand"],
    repository: "https://github.com/chandrakantdubey/style-scape",
  },
  {
    id: "pokedex",
    number: "04",
    name: "Pokédex RPG",
    category: "mobile",
    label: "MOBILE & GAME BACKENDS",
    description: "A mobile role-playing client paired with an API for trainer accounts, encounters, battles and persistent inventory.",
    implementation: "Expo client; layered FastAPI routes, game logic and PostgreSQL models.",
    stack: ["React Native", "FastAPI", "PostgreSQL", "SQLAlchemy"],
    repository: "https://github.com/chandrakantdubey/pokedex-backend",
    secondary: { label: "Mobile client", url: "https://github.com/chandrakantdubey/pokedex" },
  },
  {
    id: "fitstream",
    number: "05",
    name: "FitStream",
    category: "fullstack",
    label: "PRODUCT ENGINEERING",
    description: "A fitness PWA combining workout plans, activity tracking, location-based routes and progress analytics.",
    implementation: "React PWA; Leaflet route mapping; FastAPI and SQLite data layer.",
    stack: ["React", "FastAPI", "Leaflet", "SQLite"],
    repository: "https://github.com/chandrakantdubey/fitstream",
  },
  {
    id: "farmpulse",
    number: "06",
    name: "FarmPulse",
    category: "platform",
    label: "TIME-SERIES PLATFORM",
    description: "A sensor analytics prototype using synthetic farm readings and a modular API. Database deployment remains in progress.",
    implementation: "Next.js + FastAPI; request IDs and health checks; TimescaleDB schema and migrations.",
    stack: ["Next.js", "FastAPI", "TimescaleDB", "Docker"],
    repository: "https://github.com/chandrakantdubey/farmpulse",
    status: "IN DEVELOPMENT",
  },
];

export const workExperience = [
  {
    company: "Adeptken", title: "Full Stack Engineer", period: "Jan 2026 — Present",
    detail: "Enterprise workflow platforms, backend services and cloud infrastructure.",
  },
  {
    company: "Nutriiya", title: "Full Stack Engineer · Contract", period: "Sep 2025 — Jan 2026",
    detail: "Product interfaces, caching and application features for nutritional health software.",
  },
  {
    company: "Kintree", title: "Full Stack Developer", period: "Nov 2024 — Jan 2026",
    detail: "Collaborative family-graph interfaces, real-time experiences and API development.",
  },
  {
    company: "Uvation", title: "Software Engineer · Frontend", period: "Aug 2023 — Oct 2024",
    detail: "Commerce experiences, frontend systems and customer-facing web applications.",
  },
] as const;

export const technologyGroups = [
  { title: "Frontend", tools: ["React", "TypeScript", "Next.js", "JavaScript", "React Native", "Tailwind CSS", "Zustand"] },
  { title: "Backend & data", tools: ["Python", "FastAPI", "Node.js", "PostgreSQL", "Redis", "SQLAlchemy", "REST APIs"] },
  { title: "Cloud & delivery", tools: ["AWS", "Docker", "Kubernetes", "GitHub Actions", "Terraform", "Linux", "CI/CD"] },
  { title: "Systems & AI", tools: ["Distributed Systems", "Caching", "Observability", "LLM Applications", "ML Pipelines", "System Design"] },
] as const;

export const links = {
  email: "919chandrakant@gmail.com",
  github: "https://github.com/chandrakantdubey",
  linkedin: "https://www.linkedin.com/in/chandra-kant-dubey/",
  resume: "/Chandrakant_Dubey.pdf",
  implementation: "https://github.com/chandrakantdubey/chandrakantdubey/blob/main/src/field/engine.ts",
} as const;
