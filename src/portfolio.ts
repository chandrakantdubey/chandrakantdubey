export const profile = {
  name: "Chandrakant Dubey",
  location: "Mumbai, India",
  email: "919chandrakant@gmail.com",
  linkedin: "https://www.linkedin.com/in/chandra-kant-dubey/",
  github: "https://github.com/chandrakantdubey",
  resume: "/Chandrakant_Dubey.pdf",
};

export const workProjects = [
  {
    number: "01",
    visual: "enterprise",
    category: "Enterprise platforms · Adeptken",
    title: "Bank performance reviews and internal tools",
    role: "Full Stack Engineer · Jan 2026 – Present",
    description:
      "Built an employee performance review platform for IDBI Bank and contributed to products for customer-risk inference, lead management, and internal communications.",
    tags: ["React", "Node.js", "FastAPI", "Oracle", "Docker"],
    products: [
      "Performance reviews",
      "Risk inference",
      "Lead management",
      "Internal communications",
    ],
    links: [],
    accessLabel: "Internal products",
  },
  {
    number: "02",
    visual: "wellness",
    category: "Health & wellness · Nutriiya",
    title: "Nutrition and wellness features",
    role: "Full Stack Engineer · Sep 2025 – Dec 2025",
    description:
      "Worked across meal logging, nutrition insights, activity tracking, and personalized guidance for a nutrition and wellness app.",
    tags: ["React", "Next.js", "Node.js", "FastAPI", "PostgreSQL"],
    links: [{ label: "Visit Nutriiya", url: "https://nutriiya.com" }],
  },
  {
    number: "03",
    visual: "community",
    category: "Family & community · Kintree",
    title: "Family tree and community features",
    role: "Full Stack Developer · Nov 2024 – Jan 2026",
    description:
      "Developed interactive family-tree visualizations and social features, including real-time chat, notifications, and location-aware experiences.",
    tags: ["React", "BalkanJS", "Node.js", "Socket.IO", "Google Maps"],
    links: [{ label: "Visit Kintree", url: "https://kintree.com" }],
  },
  {
    number: "04",
    visual: "commerce",
    category: "Commerce & loyalty · Uvation",
    title: "Marketplace, loyalty, and retail platforms",
    role: "Software Engineer, Frontend · Aug 2023 – Oct 2024",
    description:
      "Built and maintained responsive interfaces for a product marketplace, a customer rewards portal, and a retail storefront.",
    tags: ["React", "TypeScript", "Node.js", "Express", "E-commerce"],
    products: ["Marketplace", "Rewards", "Bombay Dyeing retail"],
    links: [
      { label: "Marketplace", url: "https://marketplace.uvation.com" },
      { label: "Rewards", url: "https://rewards.uvation.com" },
      { label: "Retail storefront", url: "https://retail.bombaydyeing.com" },
    ],
  },
];

export const otherWork = [
  {
    name: "Brush of Hope",
    type: "Digital safety resource",
    description: "Practical guidance and support for people facing cyberbullying and online abuse.",
    url: "https://brushofhope.life",
  },
  {
    name: "HRMS",
    type: "Internal product",
    description: "A human resource management system delivered as part of professional project work.",
  },
];

export const independentProjects = [
  {
    number: "01",
    name: "StyleScape",
    category: "Creative tool",
    description:
      "A procedural pattern studio with eight pattern families, curated presets, custom palettes, and CSS, SVG, and PNG exports.",
    tags: ["React", "TypeScript", "Zustand", "SVG"],
    links: [{ label: "View source", url: "https://github.com/chandrakantdubey/style-scape" }],
  },
  {
    number: "02",
    name: "FitStream",
    category: "Fitness PWA",
    description:
      "A fitness companion for progressive workout plans, exercise guidance, GPS activity tracking, nutrition calculations, and progress exports.",
    tags: ["React", "FastAPI", "SQLite", "Leaflet"],
    links: [{ label: "View source", url: "https://github.com/chandrakantdubey/fitstream" }],
  },
  {
    number: "03",
    name: "MH15",
    category: "Android tablet app",
    description:
      "A local-first, stylus-oriented notebook for handwriting, sketching, and mixed-media notes, with a canvas engine separated from the app UI.",
    tags: ["React Native", "TypeScript", "Skia", "SQLite"],
    links: [{ label: "View source", url: "https://github.com/chandrakantdubey/mh15" }],
  },
  {
    number: "04",
    name: "Pokédex RPG",
    category: "Mobile game · full stack",
    description:
      "A mobile Pokémon RPG with trainer accounts, collection and team management, battles, gyms, and progression, backed by a REST API.",
    tags: ["Expo", "React Native", "FastAPI", "PostgreSQL"],
    links: [
      { label: "Mobile app", url: "https://github.com/chandrakantdubey/pokedex" },
      { label: "Backend API", url: "https://github.com/chandrakantdubey/pokedex-backend" },
    ],
  },
];

export const experiments = [
  {
    name: "Blackout Protocol",
    type: "GAME DESIGN",
    note: "A cooperative grid-routing game where players work together to find a path off the board.",
  },
  {
    name: "FarmPulse",
    type: "FARM DATA",
    note: "A field-monitoring dashboard that presents sensor readings and highlights conditions that need attention.",
  },
];

export const experience = [
  {
    role: "Full Stack Engineer",
    company: "Adeptken",
    period: "Jan 2026 – Present",
    summary: "Building enterprise workflow tools, from bank performance reviews to risk and lead-management systems.",
  },
  {
    role: "Full Stack Engineer",
    company: "Nutriiya",
    period: "Sep 2025 – Dec 2025",
    summary: "Worked on nutrition and wellness features, APIs, containers, and delivery pipelines across the app and its services.",
  },
  {
    role: "Full Stack Developer",
    company: "Kintree Pvt. Ltd.",
    period: "Nov 2024 – Jan 2026",
    summary: "Built family-tree visualizations and worked on chat, notifications, location features, and backend APIs.",
  },
  {
    role: "Software Engineer, Frontend",
    company: "Uvation India Pvt. Ltd.",
    period: "Aug 2023 – Oct 2024",
    summary: "Shipped storefront and loyalty experiences, modernized TypeScript code, and improved how the frontend connects to services.",
  },
];

export const skills = [
  {
    category: "Web & mobile",
    summary: "Interfaces and applications for web, mobile, and responsive product workflows.",
    items: ["React", "Next.js", "TypeScript", "React Native", "Vue", "Tailwind CSS", "Redux"],
  },
  {
    category: "Backend & data",
    summary: "APIs, real-time services, and databases for connected product features.",
    items: ["Node.js", "Python", "FastAPI", "Express", "REST APIs", "WebSockets", "PostgreSQL", "Oracle", "SQLite"],
  },
  {
    category: "Cloud & delivery",
    summary: "Containers, cloud infrastructure, and CI/CD for deployment and maintenance.",
    items: ["AWS EC2 / S3", "Docker", "GitHub Actions", "CI/CD", "Linux / RHEL"],
  },
];
