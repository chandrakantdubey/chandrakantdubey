export const profile = {
  name: "Chandrakant Dubey",
  location: "Mumbai, India",
  email: "919chandrakant@gmail.com",
  linkedin: "https://www.linkedin.com/in/chandra-kant-dubey/",
  github: "https://github.com/chandrakantdubey",
  portfolio: "https://chandrakantdubey.vercel.app/",
  resume: "/Chandrakant_Dubey.pdf",
};

export const workProjects = [
  {
    number: "01",
    visual: "enterprise",
    category: "Workflow automation · Adeptken",
    title: "Performance review management",
    role: "Enterprise application · Internal project",
    description:
      "Built an employee performance-review platform for IDBI Bank with React, Node.js, and Oracle Database, replacing spreadsheet-based workflows.",
    tags: ["React", "Node.js", "Oracle Database"],
    links: [],
    accessLabel: "Private enterprise project",
  },
  {
    number: "02",
    visual: "inference",
    category: "Applied ML · Adeptken",
    title: "Customer risk assessment",
    role: "ML inference platform · Internal project",
    description:
      "Built an enterprise model-inference platform for customer risk assessment with Python, FastAPI, React, and Oracle Database.",
    tags: ["Python", "FastAPI", "React", "Oracle Database", "Docker", "RHEL"],
    links: [],
    accessLabel: "Private enterprise project",
  },
  {
    number: "03",
    visual: "community",
    category: "Real-time product · Kintree",
    title: "Family tree and collaboration",
    role: "Full Stack Developer · Kintree",
    description:
      "Developed family-tree visualizations with React, Redux, and BalkanJS, plus real-time communication features using Node.js, Express, and Socket.IO.",
    tags: ["React", "Redux", "BalkanJS", "Node.js", "Socket.IO", "Google Maps API"],
    links: [{ label: "Visit Kintree", url: "https://kintree.com" }],
  },
  {
    number: "04",
    visual: "backend",
    category: "Backend engineering · Independent",
    title: "Pokédex RPG API",
    role: "Personal project · Public source",
    description:
      "A layered REST API for an RPG, built with FastAPI, PostgreSQL, and SQLAlchemy. It includes JWT authentication, role-based access control, and game rules for stats, breeding, evolution, and experience.",
    tags: ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "JWT", "Docker"],
    links: [
      { label: "Backend source", url: "https://github.com/chandrakantdubey/pokedex-backend" },
      { label: "Mobile app source", url: "https://github.com/chandrakantdubey/pokedex" },
    ],
  },
];

export const otherWork = [
  {
    name: "Nutriiya",
    type: "Product engineering · Full Stack Engineer",
    description:
      "Built full-stack features across a nutrition and wellness app, working with React, Next.js, Node.js, and FastAPI services.",
    links: [{ label: "Visit Nutriiya", url: "https://nutriiya.com" }],
  },
  {
    name: "Uvation commerce",
    type: "Commerce and loyalty · Software Engineer",
    description:
      "Developed e-commerce and loyalty experiences across a B2B marketplace, rewards portal, and Bombay Dyeing storefront.",
    links: [
      { label: "Marketplace", url: "https://marketplace.uvation.com" },
      { label: "Rewards", url: "https://rewards.uvation.com" },
      { label: "Bombay Dyeing", url: "https://retail.bombaydyeing.com" },
    ],
  },
  {
    name: "Brush of Hope",
    type: "Digital safety resource",
    description:
      "A digital-safety resource for people facing cyberbullying and online abuse.",
    links: [{ label: "Visit Brush of Hope", url: "https://brushofhope.life" }],
  },
  {
    name: "HRMS",
    type: "Internal product",
    description: "An internal human resource management system.",
    links: [],
  },
];

export const independentProjects = [
  {
    number: "01",
    name: "StyleScape",
    category: "Creative tool",
    visual: "stylescape",
    description:
      "A pattern editor for making custom palettes and exporting designs as CSS, SVG, or PNG.",
    tags: ["React", "TypeScript", "Zustand", "SVG"],
    links: [{ label: "Source code", url: "https://github.com/chandrakantdubey/style-scape" }],
  },
  {
    number: "02",
    name: "FitStream",
    category: "Fitness PWA",
    visual: "fitstream",
    description:
      "A fitness app with workout plans, activity tracking, nutrition tools, and progress exports.",
    tags: ["React", "FastAPI", "SQLite", "Leaflet"],
    links: [{ label: "Source code", url: "https://github.com/chandrakantdubey/fitstream" }],
  },
  {
    number: "03",
    name: "MH15",
    category: "Android tablet app",
    visual: "mh15",
    description:
      "A local-first tablet notebook for handwriting, sketching, and mixed-media notes.",
    tags: ["React Native", "TypeScript", "Skia", "SQLite"],
    links: [{ label: "Source code", url: "https://github.com/chandrakantdubey/mh15" }],
  },
];

export const experiments = [
  {
    name: "Blackout Protocol",
    type: "In development",
    visual: "game",
    note: "A cooperative grid-routing game concept about finding a path off the board.",
  },
  {
    name: "FarmPulse",
    type: "In development",
    visual: "farm",
    note: "A time-series dashboard concept for farm sensor readings and crop conditions.",
  },
];

export const experience = [
  {
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

export const skills = [
  {
    category: "Languages",
    summary: "Languages used across product and service work.",
    items: ["Python", "TypeScript", "JavaScript", "SQL"],
  },
  {
    category: "Backend & APIs",
    summary: "Service development, API design, and real-time features.",
    items: ["FastAPI", "Node.js", "Express.js", "Django APIs", "REST APIs", "WebSockets", "Socket.IO", "SQLAlchemy"],
  },
  {
    category: "Databases & caching",
    summary: "Relational databases and caching used in application backends.",
    items: ["PostgreSQL", "Oracle Database", "Redis", "MongoDB", "SQLite"],
  },
  {
    category: "Product UI",
    summary: "Web, mobile, and data-fetching tools for product interfaces.",
    items: ["React", "Next.js", "Redux", "React Native", "React Query", "SWR", "Tailwind CSS"],
  },
  {
    category: "Cloud & delivery",
    summary: "Containers, cloud infrastructure, and automated delivery.",
    items: ["Docker", "AWS EC2", "AWS S3", "GitHub Actions", "CI/CD", "Linux / RHEL"],
  },
  {
    category: "Applied AI & practices",
    summary: "ML inference integration, with LLM and retrieval patterns as a growing focus.",
    items: ["ML inference", "Model execution", "LLM patterns", "RAG fundamentals", "Authentication / RBAC", "Caching", "Testing"],
  },
];
