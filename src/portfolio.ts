export const profile = {
  name: "Chandrakant Dubey",
  role: "Full-stack engineer",
  location: "Mumbai, India",
  email: "919chandrakant@gmail.com",
  linkedin: "https://www.linkedin.com/in/chandra-kant-dubey/",
  github: "https://github.com/chandrakantdubey",
  portfolio: "https://chandrakantdubey.vercel.app/",
  resume: "/Chandrakant_Dubey.pdf",
  introduction:
    "I build reliable products from the interface to the data layer. My work spans enterprise workflows, backend services, and ML-powered systems.",
};

export type ProjectGroup = "enterprise" | "product" | "independent" | "labs";

export type WorkspaceProject = {
  id: string;
  name: string;
  group: ProjectGroup;
  role: string;
  summary: string;
  stack: string[];
  capabilities?: string[];
  links: { label: string; url: string }[];
  access?: string;
  stage?: string;
  diagram?: { caption: string; nodes: string[]; kind?: "flow" | "layers" | "branch"; note?: string };
};

export const projectGroups: { id: ProjectGroup; label: string; hint: string }[] = [
  { id: "enterprise", label: "Enterprise systems", hint: "Private · selected engineering work" },
  { id: "product", label: "Product delivery", hint: "Production products and client work" },
  { id: "independent", label: "Independent", hint: "Public projects and source" },
  { id: "labs", label: "In the lab", hint: "Early work · still developing" },
];

export const workspaceProjects: WorkspaceProject[] = [
  {
    id: "performance-review",
    name: "Performance review management",
    group: "enterprise",
    role: "Full Stack Engineer · Adeptken",
    summary: "Built an employee performance-review platform for IDBI Bank, replacing spreadsheet-based review workflows with a web application.",
    stack: ["React", "Node.js", "Oracle Database"],
    access: "Enterprise project · details limited",
    capabilities: ["Review-cycle setup", "Employee and manager workflows", "Status tracking"],
    diagram: { caption: "Review workflow · simplified", nodes: ["Review cycle", "Employee input", "Manager review", "Status & records"], kind: "flow", note: "A simplified view of the spreadsheet-replacement workflow." },
    links: [],
  },
  {
    id: "customer-risk",
    name: "Customer risk assessment",
    group: "enterprise",
    role: "Full Stack Engineer · Adeptken",
    summary: "Built a customer risk-assessment platform that connects application workflows to an internal machine-learning inference service.",
    stack: ["Python", "FastAPI", "React", "Oracle Database", "Docker", "RHEL"],
    access: "Enterprise project · details limited",
    capabilities: ["Application workflow", "Internal inference service", "Risk assessment result"],
    diagram: { caption: "Inference path · simplified", nodes: ["Application", "FastAPI", "Model inference", "Risk result"], kind: "flow", note: "Illustrative request path; internal implementation details are not shown." },
    links: [],
  },
  {
    id: "kintree",
    name: "Kintree",
    group: "product",
    role: "Full Stack Developer · Kintree",
    summary: "Developed family-tree visualizations and real-time collaboration features for a family connection product.",
    stack: ["React", "Redux", "BalkanJS", "Node.js", "Express", "Socket.IO", "Google Maps API"],
    capabilities: ["Family-tree visualization", "Real-time collaboration", "Location features"],
    diagram: { caption: "Connected product areas · simplified", nodes: ["Family connection product", "Tree views", "Live collaboration", "Places"], kind: "branch", note: "Grouped product areas based on the public-facing feature scope." },
    links: [{ label: "Open product", url: "https://kintree.com" }],
  },
  {
    id: "pokedex",
    name: "Pokédex RPG API",
    group: "independent",
    role: "Independent project · Public source",
    summary: "A layered REST API for an RPG, with authentication, role-based access, and game rules for stats, breeding, evolution, and experience.",
    stack: ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "JWT", "Docker"],
    capabilities: ["Authentication and access control", "RPG rules and progression", "Persistent game data"],
    diagram: { caption: "API structure · simplified", nodes: ["REST routes", "Game rules", "SQLAlchemy", "PostgreSQL"], kind: "layers", note: "A high-level view of the API and persistence stack." },
    links: [
      { label: "Backend source", url: "https://github.com/chandrakantdubey/pokedex-backend" },
      { label: "Mobile app source", url: "https://github.com/chandrakantdubey/pokedex" },
    ],
  },
  {
    id: "nutriiya",
    name: "Nutriiya",
    group: "product",
    role: "Full Stack Engineer · Nutriiya",
    summary: "Developed features across a nutrition and wellness app, working with web interfaces and supporting service APIs.",
    stack: ["React", "Next.js", "Node.js", "FastAPI"],
    capabilities: ["Nutrition and wellness product", "Web features", "Service APIs"],
    diagram: { caption: "Product areas · selected", nodes: ["Nutrition & wellness", "Web experience", "Product features", "Service APIs"], kind: "branch" },
    links: [{ label: "Visit Nutriiya", url: "https://nutriiya.com" }],
  },
  {
    id: "uvation-commerce",
    name: "Uvation commerce",
    group: "product",
    role: "Software Engineer · Uvation",
    summary: "Developed e-commerce and loyalty experiences across a B2B marketplace, rewards portal, and Bombay Dyeing storefront.",
    stack: ["React", "TypeScript", "Node.js", "Express.js", "REST APIs"],
    capabilities: ["B2B marketplace", "Rewards portal", "Retail storefront"],
    diagram: { caption: "Commerce surfaces · grouped", nodes: ["Uvation commerce work", "B2B marketplace", "Rewards portal", "Retail storefront"], kind: "branch" },
    links: [
      { label: "Marketplace", url: "https://marketplace.uvation.com" },
      { label: "Rewards", url: "https://rewards.uvation.com" },
      { label: "Bombay Dyeing", url: "https://retail.bombaydyeing.com" },
    ],
  },
  {
    id: "brush-of-hope",
    name: "Brush of Hope",
    group: "product",
    role: "Digital safety resource",
    summary: "A digital-safety resource for people facing cyberbullying and online abuse.",
    stack: [],
    capabilities: ["Digital safety resource", "Cyberbullying and online-abuse support"],
    links: [{ label: "Visit Brush of Hope", url: "https://brushofhope.life" }],
  },
  {
    id: "hrms",
    name: "HRMS",
    group: "product",
    role: "Internal product",
    summary: "An internal human resource management system.",
    stack: [],
    capabilities: ["Internal HR workflows"],
    access: "Private internal project",
    links: [],
  },
  {
    id: "stylescape",
    name: "StyleScape",
    group: "independent",
    role: "Creative tool · Public source",
    summary: "A visual pattern editor for building custom palettes and exporting designs as CSS, SVG, or PNG.",
    stack: ["React", "TypeScript", "Zustand", "SVG"],
    capabilities: ["Pattern editing", "Palette customization", "CSS, SVG, and PNG export"],
    diagram: { caption: "Design loop · simplified", nodes: ["Choose a pattern", "Tune palette", "Preview", "Export"], kind: "flow" },
    links: [{ label: "Source code", url: "https://github.com/chandrakantdubey/style-scape" }],
  },
  {
    id: "fitstream",
    name: "FitStream",
    group: "independent",
    role: "Fitness PWA · Public source",
    summary: "A fitness app with workout plans, activity tracking, nutrition tools, and progress exports.",
    stack: ["React", "FastAPI", "SQLite", "Leaflet"],
    capabilities: ["Workout plans", "Activity tracking", "Nutrition tools", "Progress exports"],
    diagram: { caption: "Training loop · selected features", nodes: ["Plan", "Track activity", "Review progress", "Export"], kind: "flow" },
    links: [{ label: "Source code", url: "https://github.com/chandrakantdubey/fitstream" }],
  },
  {
    id: "mh15",
    name: "MH15",
    group: "independent",
    role: "Android tablet app · Public source",
    summary: "A local-first tablet notebook for handwriting, sketching, and mixed-media notes.",
    stack: ["React Native", "TypeScript", "Skia", "SQLite"],
    capabilities: ["Handwriting", "Sketching", "Mixed-media notes", "Local-first storage"],
    diagram: { caption: "Notebook stack · simplified", nodes: ["Pen & canvas input", "React Native UI", "Skia rendering", "SQLite storage"], kind: "layers" },
    links: [{ label: "Source code", url: "https://github.com/chandrakantdubey/mh15" }],
  },
  {
    id: "farmpulse",
    name: "FarmPulse",
    group: "labs",
    role: "In development",
    summary: "A time-series dashboard concept for farm sensor readings and crop conditions.",
    stack: [],
    capabilities: ["Sensor readings", "Time-series views", "Crop conditions"],
    diagram: { caption: "Dashboard concept · simplified", nodes: ["Farm sensors", "Readings", "Time-series view", "Crop conditions"], kind: "flow" },
    stage: "Early build",
    links: [],
  },
  {
    id: "blackout-protocol",
    name: "Blackout Protocol",
    group: "labs",
    role: "In development",
    summary: "A cooperative grid-routing game concept about finding a path off the board.",
    stack: [],
    capabilities: ["Grid routing", "Cooperative play", "Path-finding objective"],
    diagram: { caption: "Game loop · concept", nodes: ["Shared grid", "Choose a route", "Coordinate moves", "Find the exit"], kind: "flow" },
    stage: "Early build",
    links: [],
  },
];

export const experience = [
  {
    id: "adeptken",
    role: "Full Stack Engineer",
    company: "Adeptken",
    period: "Jan 2026 – Present",
    summary: "Enterprise workflow products and ML inference integration.",
    highlights: [
      "Built IDBI Bank’s performance-review platform with React, Node.js, and Oracle Database, replacing spreadsheet workflows.",
      "Built a customer risk-assessment platform with Python and FastAPI; contributed to internal lead-management and communications tools.",
      "Designed REST APIs and Redis caching; worked with Docker, AWS EC2, and GitHub Actions for delivery.",
    ],
    technologies: ["React", "Node.js", "Oracle Database", "Python", "FastAPI", "Redis", "React Query", "Docker", "AWS EC2", "GitHub Actions", "ML inference"],
  },
  {
    id: "nutriiya-role",
    role: "Full Stack Engineer",
    company: "Nutriiya",
    period: "Sep 2025 – Dec 2025",
    summary: "Full-stack product features and service development.",
    highlights: [
      "Developed product features with React, Next.js, Node.js, and FastAPI microservices.",
      "Designed APIs, validation and caching layers; contributed to Docker-based deployment and CI/CD.",
    ],
    technologies: ["React", "Next.js", "Node.js", "FastAPI", "React Query", "SWR", "Docker", "AWS EC2", "GitHub Actions"],
  },
  {
    id: "kintree-role",
    role: "Full Stack Developer",
    company: "Kintree Pvt. Ltd.",
    period: "Nov 2024 – Jan 2026",
    summary: "Family-tree experiences and real-time collaboration features.",
    highlights: [
      "Built hierarchical family-tree views with React, Redux, and BalkanJS.",
      "Developed real-time collaboration with Node.js, Express, and Socket.IO; integrated Google Maps APIs.",
      "Contributed to a Django API redesign focused on response times and scalability.",
    ],
    technologies: ["React", "Redux", "BalkanJS", "Node.js", "Express.js", "Socket.IO", "Google Maps API", "Django API"],
  },
  {
    id: "uvation-role",
    role: "Software Engineer (Frontend)",
    company: "Uvation India Pvt. Ltd.",
    period: "Aug 2023 – Oct 2024",
    summary: "E-commerce and loyalty applications for marketplace and retail products.",
    highlights: [
      "Developed e-commerce and loyalty applications with React, TypeScript, Node.js, and Express.js.",
      "Migrated legacy JavaScript to TypeScript and improved loading with caching, lazy loading, and code splitting.",
    ],
    technologies: ["React", "TypeScript", "JavaScript", "Node.js", "Express.js", "REST APIs"],
  },
];

export const skillGroups = [
  { id: "languages", title: "Languages", note: "Used across product and service work", items: ["Python", "TypeScript", "JavaScript", "SQL"] },
  { id: "services", title: "Services & APIs", note: "Application logic, integration, and real-time features", items: ["FastAPI", "Node.js", "Express.js", "Django APIs", "REST APIs", "WebSockets", "Socket.IO", "SQLAlchemy"] },
  { id: "data", title: "Data systems", note: "Relational stores and caching", items: ["PostgreSQL", "Oracle Database", "Redis", "MongoDB", "SQLite"] },
  { id: "interfaces", title: "Product interfaces", note: "Web, mobile, and client data", items: ["React", "Next.js", "Redux", "React Native", "React Query", "SWR", "Tailwind CSS"] },
  { id: "delivery", title: "Delivery & runtime", note: "Containers, cloud infrastructure, and automation", items: ["Docker", "AWS EC2", "AWS S3", "GitHub Actions", "CI/CD", "Linux / RHEL"] },
  { id: "applied-ai", title: "Applied AI", note: "Experience in inference integration; LLM and retrieval patterns are a learning focus", items: ["ML inference", "Model execution", "LLM patterns", "RAG fundamentals", "Authentication / RBAC", "Caching", "Testing"] },
];
