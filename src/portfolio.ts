export const profile = {
  name: "Chandrakant Dubey",
  role: "Full-Stack Software Engineer",
  tagline: "Architecting high-scale distributed systems, resilient backend microservices, and reactive web applications.",
  location: "Mumbai, Maharashtra, India 🇮🇳",
  coordinates: "19.0760° N, 72.8777° E",
  timezone: "Asia/Kolkata (IST · UTC+05:30)",
  email: "919chandrakant@gmail.com",
  linkedin: "https://www.linkedin.com/in/chandra-kant-dubey/",
  github: "https://github.com/chandrakantdubey",
  portfolio: "https://chandrakantdubey.vercel.app/",
  resume: "/Chandrakant_Dubey.pdf",
  stats: {
    enterpriseUsers: "10,000+",
    inferenceLatency: "< 45ms",
    nodesScaled: "500k+",
    yearsExp: "3+",
    prodDeployments: "25+",
    repositories: "15+",
  },
  bio: "Full-stack software engineer with 3+ years of enterprise experience designing fault-tolerant backend architectures, low-latency microservices, and interactive modern web applications. Proven track record in banking and financial systems (IDBI Bank), real-time kinship graphs (Kintree), applied ML inference pipelines, and e-commerce platforms.",
  about:
    "I specialize in bridging complex distributed backend engineering with high-performance, polished user interfaces. My core technical strengths include Python, FastAPI, Node.js, React, Next.js, and enterprise databases like Oracle and PostgreSQL. I thrive on untangling complex system bottlenecks, reducing query latency, and building deterministic, scalable applications.",
};

export type ProjectCategory = "all" | "enterprise" | "ai" | "fullstack" | "mobile" | "opensource";

export interface SystemFlowStep {
  title: string;
  role: string;
  tech: string;
  latency?: string;
  detail: string;
}

export interface Project {
  id: string;
  name: string;
  category: "enterprise" | "ai" | "fullstack" | "mobile" | "opensource";
  categoryLabel: string;
  role: string;
  summary: string;
  metric: string;
  metricLabel: string;
  accentColor: string;
  highlights: string[];
  stack: string[];
  systemFlow?: SystemFlowStep[];
  codeSnippet?: {
    language: string;
    filename: string;
    code: string;
  };
  links: { label: string; url: string; type: "live" | "github" }[];
}

export const projects: Project[] = [
  {
    id: "performance-review",
    name: "IDBI Bank Performance Review System",
    category: "enterprise",
    categoryLabel: "Enterprise Banking",
    role: "Full Stack Engineer · Adeptken",
    metric: "10,000+",
    metricLabel: "Enterprise Users",
    accentColor: "#3b82f6",
    summary:
      "Enterprise appraisal and performance evaluation platform engineered for IDBI Bank, digitizing multi-tier review cycles and replacing spreadsheet-based workflows with ACID-compliant transactions.",
    highlights: [
      "Architected multi-tier approval hierarchies with role-based access control (RBAC).",
      "Engineered high-concurrency Oracle Database schemas with zero data-loss guarantees.",
      "Automated evaluation score calculations, real-time status audits, and HR export reports.",
    ],
    stack: ["React", "TypeScript", "Node.js", "Oracle Database", "REST APIs", "Tailwind CSS"],
    systemFlow: [
      { title: "Review Cycle Trigger", role: "HR Admin Portal", tech: "React + TS", latency: "10ms", detail: "Initiates annual appraisal cycle for 10k+ employee records" },
      { title: "Employee Input", role: "Self-Assessment", tech: "React Form Engine", latency: "35ms", detail: "Validates employee KPIs, deliverables, and score metrics" },
      { title: "Manager Appraisal", role: "Hierarchical Review", tech: "Node.js + Express", latency: "50ms", detail: "Routing appraisals through multi-level managerial chains" },
      { title: "Enterprise Database", role: "Persistent Store", tech: "Oracle DB", latency: "15ms", detail: "ACID-compliant storage, historical auditing, and analytics" },
    ],
    codeSnippet: {
      language: "typescript",
      filename: "reviewWorkflowService.ts",
      code: `export async function processReviewStage(reviewId: string, managerId: string, scores: ReviewScores) {
  const transaction = await db.beginTransaction();
  try {
    const cycle = await reviewRepo.getActiveCycle(transaction);
    if (!cycle.isOpen) throw new Error("Evaluation cycle closed");
    
    const evaluation = await reviewRepo.updateManagerScore(reviewId, managerId, scores, transaction);
    await auditLogger.logEvent("MANAGER_APPRAISAL_COMPLETED", { reviewId, managerId });
    
    await transaction.commit();
    return { status: "APPROVED", nextStage: evaluation.nextApproverId };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}`,
    },
    links: [],
  },
  {
    id: "customer-risk",
    name: "Real-Time Customer Risk Scoring Engine",
    category: "ai",
    categoryLabel: "Fintech & Applied ML",
    role: "Full Stack Engineer · Adeptken",
    metric: "< 45ms",
    metricLabel: "P99 Inference Latency",
    accentColor: "#8b5cf6",
    summary:
      "High-throughput enterprise risk-scoring microservice connecting banking frontends to asynchronous ML inference pipelines for instant creditworthiness and fraud risk assessment.",
    highlights: [
      "Constructed asynchronous FastAPI model inference gateway with strict Pydantic payload validation.",
      "Implemented Redis caching for recurring risk profiles, reducing database queries by 35%.",
      "Containerized microservices via Docker and deployed on Red Hat Enterprise Linux (RHEL) with AWS EC2.",
    ],
    stack: ["Python", "FastAPI", "React", "Oracle Database", "Redis", "Docker", "RHEL", "AWS EC2"],
    systemFlow: [
      { title: "API Gateway", role: "Ingestion Endpoint", tech: "FastAPI + Pydantic", latency: "8ms", detail: "Validates applicant financial features and credit history" },
      { title: "Cache Lookup", role: "Fast Caching", tech: "Redis In-Memory", latency: "2ms", detail: "Checks cache for recent scoring results and rate limits" },
      { title: "ML Inference Engine", role: "Scoring Microservice", tech: "Python Async Worker", latency: "28ms", detail: "Runs ensemble model inference calculating risk scores" },
      { title: "Risk Decision", role: "Compliance Record", tech: "Oracle DB + Audit", latency: "12ms", detail: "Persists audit trail and returns decision tier to client" },
    ],
    codeSnippet: {
      language: "python",
      filename: "risk_inference_gateway.py",
      code: `@router.post("/v1/risk/evaluate", response_model=RiskScoreResponse)
async def evaluate_risk_profile(payload: RiskFeaturePayload, cache: Redis = Depends(get_redis)):
    cache_key = f"risk:{payload.tax_id}:{payload.assessment_hash}"
    if cached := await cache.get(cache_key):
        return RiskScoreResponse.model_validate_json(cached)
        
    features = await feature_extractor.transform_async(payload)
    prediction = await ml_inference_service.predict(features)
    
    response = RiskScoreResponse(
        score=prediction.risk_tier,
        confidence=prediction.confidence,
        timestamp=datetime.utcnow()
    )
    await cache.setex(cache_key, timedelta(hours=6), response.model_dump_json())
    return response`,
    },
    links: [],
  },
  {
    id: "kintree",
    name: "Kintree Real-Time Family Graph Engine",
    category: "fullstack",
    categoryLabel: "Social & Graph Network",
    role: "Full Stack Developer · Kintree",
    metric: "500k+",
    metricLabel: "Graph Kinship Nodes",
    accentColor: "#10b981",
    summary:
      "Large-scale genealogical social network and real-time collaboration platform featuring dynamic interactive tree rendering, WebSocket live channels, and geospatial member clustering.",
    highlights: [
      "Engineered deeply nested genealogical visualizations using BalkanJS, React, and Redux Toolkit.",
      "Built sub-second collaborative event broadcasting and chat channels using Node.js, Express, and Socket.IO.",
      "Optimized Django REST API queries with selective prefetching, slashing endpoint response times by 40%.",
    ],
    stack: ["React", "Redux Toolkit", "BalkanJS", "Node.js", "Express.js", "Socket.IO", "Django", "PostgreSQL"],
    systemFlow: [
      { title: "Kinship Graph", role: "Interactive Canvas", tech: "BalkanJS + React", latency: "16ms", detail: "Renders 500k+ node hierarchical family trees smoothly" },
      { title: "Real-time Sync", role: "Live Broadcasting", tech: "Socket.IO + Node.js", latency: "12ms", detail: "Broadcasts kinship updates and chat events instantly" },
      { title: "Django API Layer", role: "Business Logic", tech: "Django REST Framework", latency: "45ms", detail: "Optimized relational kinship queries with indexing" },
      { title: "Geospatial Clustering", role: "Maps Integration", tech: "Google Maps API", latency: "25ms", detail: "Clusters family members across regional coordinates" },
    ],
    codeSnippet: {
      language: "typescript",
      filename: "familyTreeSocketManager.ts",
      code: `export class KinshipSocketManager {
  private socket: Socket;

  constructor(serverUrl: string, authToken: string) {
    this.socket = io(serverUrl, { auth: { token: authToken }, transports: ["websocket"] });
    this.bindEvents();
  }

  public subscribeToFamilyBranch(branchId: string, onUpdate: (node: KinshipNode) => void) {
    this.socket.emit("join_branch", { branchId });
    this.socket.on(\`branch_updated:\${branchId}\`, (payload) => {
      onUpdate(payload.node);
    });
  }
}`,
    },
    links: [{ label: "Visit Kintree", url: "https://kintree.com", type: "live" }],
  },
  {
    id: "pokedex",
    name: "Pokédex RPG Architecture & Game Engine",
    category: "opensource",
    categoryLabel: "Open Source Backend",
    role: "Creator · Lead Architect",
    metric: "100%",
    metricLabel: "Layered REST Architecture",
    accentColor: "#f59e0b",
    summary:
      "Production-grade layered REST API engine featuring cryptographic JWT authentication, role-based authorization, relational game persistence, battle math, and breeding algorithms.",
    highlights: [
      "Engineered domain-driven battle calculations and progression algorithms.",
      "Normalized PostgreSQL schema with optimized SQLAlchemy ORM migrations.",
      "Full automated testing suite and Docker containerization.",
    ],
    stack: ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "JWT Auth", "Docker", "Pydantic"],
    systemFlow: [
      { title: "Auth & Security", role: "Security Gateway", tech: "FastAPI + Cryptographic JWT", latency: "5ms", detail: "Role-based verification for players and admins" },
      { title: "Game Engine", role: "Domain Rules", tech: "Python RPG Logic", latency: "10ms", detail: "Executes deterministic battle math, IV/EV stats, and breeding" },
      { title: "Data Persistence", role: "ORM & Storage", tech: "SQLAlchemy + PostgreSQL", latency: "18ms", detail: "ACID-compliant storage of player stats, inventories, and rosters" },
    ],
    codeSnippet: {
      language: "python",
      filename: "battle_calculation_engine.py",
      code: `def calculate_damage(attacker: Creature, defender: Creature, move: Move) -> int:
    type_mod = get_type_effectiveness(move.element, defender.elements)
    stab = 1.5 if move.element in attacker.elements else 1.0
    level_factor = (2 * attacker.level) / 5 + 2
    base_dmg = ((level_factor * move.power * (attacker.attack / defender.defense)) / 50) + 2
    random_variance = uniform(0.85, 1.0)
    
    total_damage = int(base_dmg * stab * type_mod * random_variance)
    return max(1, total_damage)`,
    },
    links: [
      { label: "Backend API", url: "https://github.com/chandrakantdubey/pokedex-backend", type: "github" },
      { label: "Mobile App", url: "https://github.com/chandrakantdubey/pokedex", type: "github" },
    ],
  },
  {
    id: "nutriiya",
    name: "Nutriiya Health & Nutritional Telemetry",
    category: "fullstack",
    categoryLabel: "Health & Telemetry",
    role: "Full Stack Engineer · Nutriiya",
    metric: "Next.js 15",
    metricLabel: "Microservices Stack",
    accentColor: "#06b6d4",
    summary:
      "Responsive nutrition platform delivering personalized macro diet programs, health habit analytics, and high-frequency meal telemetry across devices.",
    highlights: [
      "Constructed responsive client experiences with Next.js and Tailwind CSS.",
      "Integrated microservices in FastAPI with strict Pydantic validation.",
      "Optimized client state caching with React Query and SWR.",
    ],
    stack: ["React", "Next.js", "Node.js", "FastAPI", "React Query", "SWR", "Tailwind CSS"],
    links: [{ label: "Visit Nutriiya", url: "https://nutriiya.com", type: "live" }],
  },
  {
    id: "uvation-commerce",
    name: "Uvation Commerce & Loyalty Suites",
    category: "fullstack",
    categoryLabel: "E-Commerce & Retail",
    role: "Software Engineer · Uvation",
    metric: "60%",
    metricLabel: "Load Time Reduction",
    accentColor: "#ec4899",
    summary:
      "Enterprise B2B wholesale marketplace, customer loyalty reward portal, and Bombay Dyeing retail storefront with high conversion checkout funnels.",
    highlights: [
      "Migrated large legacy JavaScript codebases to strict TypeScript, eliminating type crashes.",
      "Implemented intelligent asset caching and dynamic route chunk-splitting, boosting load velocity by 60%.",
      "Engineered loyalty point redemption calculations and wholesale procurement checkouts.",
    ],
    stack: ["React", "TypeScript", "Node.js", "Express.js", "REST APIs", "Tailwind CSS"],
    links: [
      { label: "Marketplace", url: "https://marketplace.uvation.com", type: "live" },
      { label: "Rewards Portal", url: "https://rewards.uvation.com", type: "live" },
    ],
  },
  {
    id: "stylescape",
    name: "StyleScape Algorithmic Pattern Synthesizer",
    category: "opensource",
    categoryLabel: "Creative Studio",
    role: "Creator · Open Source",
    metric: "SVG/CSS",
    metricLabel: "Multi-Format Export",
    accentColor: "#f43f5e",
    summary:
      "Interactive visual pattern synthesizer for generating, tuning, and exporting algorithmic SVG matrices, CSS background rules, and high-resolution PNG tiles.",
    highlights: [
      "Real-time vector transformation and canvas rendering pipeline.",
      "Custom palette harmonizer with WCAG contrast verification.",
      "Instant copy-to-clipboard CSS and SVG code generator.",
    ],
    stack: ["React", "TypeScript", "Zustand", "SVG", "Canvas API", "Vite"],
    links: [{ label: "Source Code", url: "https://github.com/chandrakantdubey/style-scape", type: "github" }],
  },
  {
    id: "fitstream",
    name: "FitStream Offline Athletic Telemetry PWA",
    category: "mobile",
    categoryLabel: "Progressive Web App",
    role: "Creator · Open Source",
    metric: "Local-First",
    metricLabel: "GPS & SQLite Sync",
    accentColor: "#14b8a6",
    summary:
      "Offline-first athletic telemetry progressive web app with GPS route recording, workout analytics, and local SQLite data synchronization.",
    highlights: [
      "Client-side geospatial route mapping with Leaflet.",
      "Local-first workout logging with background sync capabilities.",
      "Custom cardiovascular analytics and export tools.",
    ],
    stack: ["React", "FastAPI", "SQLite", "Leaflet", "PWA", "Service Workers"],
    links: [{ label: "Source Code", url: "https://github.com/chandrakantdubey/fitstream", type: "github" }],
  },
  {
    id: "mh15",
    name: "MH15 Hardware-Accelerated Tablet Notebook",
    category: "mobile",
    categoryLabel: "Mobile & Skia Canvas",
    role: "Creator · Open Source",
    metric: "120 FPS",
    metricLabel: "Skia GPU Canvas",
    accentColor: "#6366f1",
    summary:
      "High-refresh handwriting, sketching, and mixed-media notebook engineered for Android tablets utilizing Shopify Skia canvas hardware acceleration.",
    highlights: [
      "Ultra-low latency pressure-sensitive stroke rasterization.",
      "Local-first document persistence with zero cloud dependency.",
      "Multi-layer vector canvas with zoom and pan gesture support.",
    ],
    stack: ["React Native", "TypeScript", "Shopify Skia", "SQLite", "Gesture Handler"],
    links: [{ label: "Source Code", url: "https://github.com/chandrakantdubey/mh15", type: "github" }],
  },
];

export const experience = [
  {
    id: "adeptken",
    role: "Full Stack Engineer",
    company: "Adeptken",
    location: "Mumbai, India",
    period: "Jan 2026 – Present",
    type: "Full-Time",
    accent: "#3b82f6",
    summary:
      "Engineering enterprise workflow platforms for national financial institutions, architecting low-latency ML inference services, and managing cloud pipelines.",
    achievements: [
      "Architected IDBI Bank’s enterprise performance review platform with React, Node.js, and Oracle Database, automating complex appraisal workflows for over 10,000 employees.",
      "Engineered a high-throughput customer risk-assessment microservice in Python and FastAPI, integrating ML inference pipelines with sub-50ms response times.",
      "Optimized enterprise REST APIs and implemented Redis caching strategies, reducing database read loads by 35%.",
      "Managed CI/CD deployment pipelines utilizing Docker, AWS EC2, and GitHub Actions across Red Hat Enterprise Linux (RHEL) environments.",
    ],
    technologies: ["Python", "FastAPI", "React", "Node.js", "Oracle Database", "Redis", "Docker", "AWS EC2", "GitHub Actions", "RHEL"],
  },
  {
    id: "nutriiya",
    role: "Full Stack Engineer",
    company: "Nutriiya",
    location: "Mumbai, India",
    period: "Sep 2025 – Dec 2025",
    type: "Contract",
    accent: "#06b6d4",
    summary:
      "Built full-stack product features, caching strategies, and responsive user interfaces for modern nutritional health platforms.",
    achievements: [
      "Developed high-traffic responsive web applications using React, Next.js, and FastAPI microservices.",
      "Engineered validation layers with Pydantic and state synchronization with React Query and SWR.",
      "Containerized backend services with Docker and streamlined automated GitHub Actions CI/CD deployment workflows.",
    ],
    technologies: ["React", "Next.js", "Node.js", "FastAPI", "React Query", "SWR", "Docker", "AWS EC2", "GitHub Actions"],
  },
  {
    id: "kintree",
    role: "Full Stack Developer",
    company: "Kintree Pvt. Ltd.",
    location: "Mumbai, India",
    period: "Nov 2024 – Jan 2026",
    type: "Full-Time",
    accent: "#10b981",
    summary:
      "Spearheaded real-time family network features, genealogical tree visualizations, and Django backend performance optimizations.",
    achievements: [
      "Engineered dynamic, deeply nested family-tree visualizations using BalkanJS, React, and Redux Toolkit, supporting trees with 500k+ connections.",
      "Built low-latency real-time collaboration and chat channels with Node.js, Express, and Socket.IO.",
      "Integrated Google Maps Platform APIs for familial geolocation clustering and member discovery.",
      "Contributed to Django API refactoring, reducing database query overhead and boosting endpoint responsiveness by 40%.",
    ],
    technologies: ["React", "Redux Toolkit", "BalkanJS", "Node.js", "Express.js", "Socket.IO", "Google Maps API", "Django", "PostgreSQL"],
  },
  {
    id: "uvation",
    role: "Software Engineer (Frontend)",
    company: "Uvation India Pvt. Ltd.",
    location: "Mumbai, India",
    period: "Aug 2023 – Oct 2024",
    type: "Full-Time",
    accent: "#ec4899",
    summary:
      "Delivered scalable e-commerce portals, loyalty reward engines, and Bombay Dyeing retail storefronts.",
    achievements: [
      "Built multi-tenant enterprise e-commerce portals with React, TypeScript, Node.js, and RESTful architectures.",
      "Executed codebase migration from legacy JavaScript to strict TypeScript, eliminating recurring runtime exceptions.",
      "Implemented intelligent asset caching, dynamic chunk splitting, and memoization, slashing initial page load times by 60%.",
    ],
    technologies: ["React", "TypeScript", "JavaScript", "Node.js", "Express.js", "REST APIs", "Tailwind CSS"],
  },
];

export interface SkillItem {
  name: string;
  level: "Expert" | "Advanced" | "Proficient";
  category: "Languages" | "Backend" | "Frontend" | "Databases" | "DevOps" | "Applied AI";
  tag: string;
  accentColor: string;
  experience: string;
  projectsUsed: string[];
  featured?: boolean;
  percentage?: number;
}

export const allSkills: SkillItem[] = [
  // Languages
  {
    name: "Python",
    level: "Expert",
    category: "Languages",
    tag: "Asynchronous & High-Scale Core",
    accentColor: "#387eb8",
    experience: "3+ Yrs Prod",
    featured: true,
    projectsUsed: ["Risk Assessment Engine", "Pokédex RPG", "Nutriiya"],
  },
  {
    name: "TypeScript",
    level: "Expert",
    category: "Languages",
    tag: "Strict Type Safety & Contracts",
    accentColor: "#3178c6",
    experience: "3+ Yrs Prod",
    featured: true,
    projectsUsed: ["IDBI Bank Platform", "Uvation Commerce", "StyleScape", "MH15"],
  },
  {
    name: "JavaScript (ES6+)",
    level: "Expert",
    category: "Languages",
    tag: "Event-Driven Client & Server",
    accentColor: "#f59e0b",
    experience: "3+ Yrs Prod",
    projectsUsed: ["Kintree", "Uvation", "All Frontend"],
  },
  {
    name: "SQL",
    level: "Expert",
    category: "Languages",
    tag: "Relational Queries & Index Tuning",
    accentColor: "#0284c7",
    experience: "3+ Yrs Prod",
    projectsUsed: ["IDBI Bank", "Pokédex", "Kintree"],
  },
  {
    name: "Bash / Shell",
    level: "Advanced",
    category: "Languages",
    tag: "Automation & Production Scripts",
    accentColor: "#4ade80",
    experience: "2+ Yrs Prod",
    projectsUsed: ["RHEL Servers", "CI/CD Automations"],
  },
  {
    name: "HTML5 & Modern CSS",
    level: "Expert",
    category: "Languages",
    tag: "Semantic, Responsive, Accessible",
    accentColor: "#f97316",
    experience: "3+ Yrs Prod",
    projectsUsed: ["All Web Apps"],
  },

  // Backend & Microservices
  {
    name: "FastAPI",
    level: "Expert",
    category: "Backend",
    tag: "Sub-45ms High-Throughput APIs",
    accentColor: "#059669",
    experience: "3+ Yrs Prod",
    featured: true,
    projectsUsed: ["Risk Assessment ML", "Pokédex API", "Nutriiya"],
  },
  {
    name: "Node.js",
    level: "Expert",
    category: "Backend",
    tag: "Non-Blocking Event Loops",
    accentColor: "#22c55e",
    experience: "3+ Yrs Prod",
    featured: true,
    projectsUsed: ["IDBI Bank", "Kintree", "Uvation"],
  },
  {
    name: "Express.js",
    level: "Expert",
    category: "Backend",
    tag: "RESTful Service Orchestration",
    accentColor: "#64748b",
    experience: "2+ Yrs Prod",
    projectsUsed: ["IDBI Bank", "Kintree Collaboration"],
  },
  {
    name: "Django & DRF",
    level: "Advanced",
    category: "Backend",
    tag: "ORM Query Latency Optimization",
    accentColor: "#10b981",
    experience: "2+ Yrs Prod",
    projectsUsed: ["Kintree API Refactoring"],
  },
  {
    name: "SQLAlchemy ORM",
    level: "Expert",
    category: "Backend",
    tag: "Async Connection Pools & Sessions",
    accentColor: "#e11d48",
    experience: "2+ Yrs Prod",
    featured: true,
    projectsUsed: ["Pokédex RPG", "FastAPI Services"],
  },
  {
    name: "WebSockets & Socket.IO",
    level: "Expert",
    category: "Backend",
    tag: "Real-Time Bi-Directional Mesh",
    accentColor: "#06b6d4",
    experience: "2+ Yrs Prod",
    featured: true,
    projectsUsed: ["Kintree Real-Time Sync"],
  },
  {
    name: "Pydantic Validation",
    level: "Expert",
    category: "Backend",
    tag: "Zero-Overhead Schema Enforcement",
    accentColor: "#ec4899",
    experience: "2+ Yrs Prod",
    projectsUsed: ["FastAPI Microservices", "Risk Scoring"],
  },
  {
    name: "RESTful Architecture",
    level: "Expert",
    category: "Backend",
    tag: "Microservice System Contracts",
    accentColor: "#8b5cf6",
    experience: "3+ Yrs Prod",
    projectsUsed: ["All Enterprise Systems"],
  },

  // Frontend Architecture
  {
    name: "React 19",
    level: "Expert",
    category: "Frontend",
    tag: "Server Components & Suspense",
    accentColor: "#00d8ff",
    experience: "3+ Yrs Prod",
    featured: true,
    projectsUsed: ["IDBI Bank", "Kintree", "Nutriiya", "All Web Apps"],
  },
  {
    name: "Next.js 15 (App Router)",
    level: "Advanced",
    category: "Frontend",
    tag: "Hybrid SSR & Route Optimization",
    accentColor: "#6366f1",
    experience: "2+ Yrs Prod",
    featured: true,
    projectsUsed: ["Nutriiya Platform", "SSR Apps"],
  },
  {
    name: "React Native",
    level: "Advanced",
    category: "Frontend",
    tag: "Cross-Platform Mobile Apps",
    accentColor: "#38bdf8",
    experience: "2+ Yrs Prod",
    projectsUsed: ["MH15 Tablet App", "Pokédex Mobile"],
  },
  {
    name: "Redux Toolkit",
    level: "Expert",
    category: "Frontend",
    tag: "Predictable State Management",
    accentColor: "#8b5cf6",
    experience: "3+ Yrs Prod",
    projectsUsed: ["Kintree Kinship Graph", "IDBI Bank"],
  },
  {
    name: "Tailwind CSS",
    level: "Expert",
    category: "Frontend",
    tag: "Design Systems & Responsive UX",
    accentColor: "#38bdf8",
    experience: "3+ Yrs Prod",
    featured: true,
    projectsUsed: ["All Modern Web Projects"],
  },
  {
    name: "React Query & SWR",
    level: "Expert",
    category: "Frontend",
    tag: "Optimistic State & Client Cache",
    accentColor: "#f43f5e",
    experience: "2+ Yrs Prod",
    projectsUsed: ["Nutriiya", "Adeptken Enterprise"],
  },
  {
    name: "Framer Motion",
    level: "Expert",
    category: "Frontend",
    tag: "Physics-Based Reactive Animations",
    accentColor: "#ec4899",
    experience: "2+ Yrs Prod",
    projectsUsed: ["Portfolio", "Interactive Interfaces"],
  },
  {
    name: "BalkanJS (Graph Engine)",
    level: "Advanced",
    category: "Frontend",
    tag: "500k+ Node Kinship Visuals",
    accentColor: "#a855f7",
    experience: "2+ Yrs Prod",
    projectsUsed: ["Kintree 500k+ Tree Nodes"],
  },

  // Databases & Stores
  {
    name: "PostgreSQL",
    level: "Expert",
    category: "Databases",
    tag: "ACID Relational Storage & Indexing",
    accentColor: "#336791",
    experience: "3+ Yrs Prod",
    featured: true,
    projectsUsed: ["Pokédex RPG", "Kintree", "Analytics"],
  },
  {
    name: "Oracle Database",
    level: "Advanced",
    category: "Databases",
    tag: "High-Concurrency Banking Schemas",
    accentColor: "#f80000",
    experience: "2+ Yrs Prod",
    featured: true,
    projectsUsed: ["IDBI Bank Platform", "Risk Scoring"],
  },
  {
    name: "Redis Cache",
    level: "Expert",
    category: "Databases",
    tag: "Sub-Millisecond In-Memory Store",
    accentColor: "#dc2626",
    experience: "2+ Yrs Prod",
    featured: true,
    projectsUsed: ["Risk Assessment Engine", "Kintree Socket Session"],
  },
  {
    name: "MongoDB",
    level: "Advanced",
    category: "Databases",
    tag: "Document Stores & Event Logs",
    accentColor: "#16a34a",
    experience: "2+ Yrs Prod",
    projectsUsed: ["Document Storage", "Event Logs"],
  },
  {
    name: "SQLite",
    level: "Expert",
    category: "Databases",
    tag: "Embedded Local Persistence",
    accentColor: "#0284c7",
    experience: "2+ Yrs Prod",
    projectsUsed: ["FitStream PWA", "MH15 Local Storage"],
  },

  // DevOps & Cloud
  {
    name: "Docker & Compose",
    level: "Expert",
    category: "DevOps",
    tag: "Hermetic Container Environments",
    accentColor: "#2563eb",
    experience: "3+ Yrs Prod",
    featured: true,
    projectsUsed: ["FastAPI Microservices", "RHEL Deployments"],
  },
  {
    name: "AWS (EC2, S3)",
    level: "Advanced",
    category: "DevOps",
    tag: "Cloud Compute & Asset Storage",
    accentColor: "#f59e0b",
    experience: "2+ Yrs Prod",
    featured: true,
    projectsUsed: ["Cloud Hosting", "Asset Storage"],
  },
  {
    name: "GitHub Actions CI/CD",
    level: "Expert",
    category: "DevOps",
    tag: "Automated Build & Deploy Pipelines",
    accentColor: "#22c55e",
    experience: "2+ Yrs Prod",
    featured: true,
    projectsUsed: ["Automated Testing", "Vercel & Docker Deploys"],
  },
  {
    name: "Linux / RHEL",
    level: "Advanced",
    category: "DevOps",
    tag: "Enterprise Red Hat Workloads",
    accentColor: "#dc2626",
    experience: "2+ Yrs Prod",
    projectsUsed: ["Production Server Administration", "Red Hat Workloads"],
  },
  {
    name: "Nginx Reverse Proxy",
    level: "Advanced",
    category: "DevOps",
    tag: "SSL Termination & Gateway Routing",
    accentColor: "#10b981",
    experience: "2+ Yrs Prod",
    projectsUsed: ["SSL Termination", "Load Balancing"],
  },
  {
    name: "Git & GitHub",
    level: "Expert",
    category: "DevOps",
    tag: "Distributed Version Control",
    accentColor: "#f97316",
    experience: "3+ Yrs Prod",
    projectsUsed: ["Version Control", "Open Source Collaboration"],
  },

  // Applied AI & Engineering
  {
    name: "ML Inference Pipelines",
    level: "Advanced",
    category: "Applied AI",
    tag: "P99 Sub-45ms Production Scoring",
    accentColor: "#8b5cf6",
    experience: "2+ Yrs Prod",
    featured: true,
    projectsUsed: ["Customer Risk Scoring", "P99 Sub-45ms Pipeline"],
  },
  {
    name: "Asynchronous Model Serving",
    level: "Advanced",
    category: "Applied AI",
    tag: "High-Throughput Batch Inference",
    accentColor: "#06b6d4",
    experience: "2+ Yrs Prod",
    projectsUsed: ["High-Throughput Risk Inference"],
  },
  {
    name: "LLM Application Patterns",
    level: "Proficient",
    category: "Applied AI",
    tag: "Prompt Chains & Tool Orchestration",
    accentColor: "#ec4899",
    experience: "1+ Yrs Prod",
    featured: true,
    projectsUsed: ["AI Prototyping", "Prompt Chains"],
  },
  {
    name: "RAG Fundamentals",
    level: "Proficient",
    category: "Applied AI",
    tag: "Contextual Retrieval Systems",
    accentColor: "#a855f7",
    experience: "1+ Yrs Prod",
    projectsUsed: ["Contextual Retrieval Prototypes"],
  },
  {
    name: "RBAC & JWT Cryptography",
    level: "Expert",
    category: "Applied AI",
    tag: "Zero-Trust Security & Identity",
    accentColor: "#e11d48",
    experience: "3+ Yrs Prod",
    projectsUsed: ["IDBI Bank Security", "Pokédex API"],
  },
  {
    name: "Pytest & Automated Testing",
    level: "Expert",
    category: "Applied AI",
    tag: "Deterministic Test Coverage",
    accentColor: "#38bdf8",
    experience: "3+ Yrs Prod",
    projectsUsed: ["FastAPI Test Suites", "Production Code"],
  },
];

export const skillCategories = [
  { id: "all", label: "All Skills", count: allSkills.length },
  { id: "Languages", label: "Languages", count: allSkills.filter((s) => s.category === "Languages").length },
  { id: "Backend", label: "Backend & APIs", count: allSkills.filter((s) => s.category === "Backend").length },
  { id: "Frontend", label: "Frontend & Mobile", count: allSkills.filter((s) => s.category === "Frontend").length },
  { id: "Databases", label: "Databases & Cache", count: allSkills.filter((s) => s.category === "Databases").length },
  { id: "DevOps", label: "DevOps & Cloud", count: allSkills.filter((s) => s.category === "DevOps").length },
  { id: "Applied AI", label: "Applied AI & Systems", count: allSkills.filter((s) => s.category === "Applied AI").length },
];
