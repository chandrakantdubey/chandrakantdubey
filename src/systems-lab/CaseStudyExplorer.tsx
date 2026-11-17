import { useState } from "react";
import { ArrowUpRight, CheckCircle2, GitFork, Layers3, MoveRight } from "lucide-react";

type ArchitectureNode = { id: string; label: string; description: string };
type CaseStudy = {
  id: string;
  title: string;
  label: string;
  type: string;
  problem: string;
  approach: string;
  tradeoff: string;
  nodes: ArchitectureNode[];
  repository: string;
  reading: string;
};

const cases: CaseStudy[] = [
  {
    id: "patterns",
    title: "StyleScape",
    label: "01 / DETERMINISTIC GRAPHICS",
    type: "Rendering pipeline",
    problem: "Make layered procedural visuals editable and exportable without having a separate implementation for every output format.",
    approach: "Express presets as a typed, serializable scene model. The SVG renderer walks a small set of layer primitives so the same inputs produce reproducible results. UI state stays separate from rendering.",
    tradeoff: "Determinism is easier to test and export than an unconstrained generative canvas, but requires explicit layer contracts and migration rules when the format evolves.",
    nodes: [
      { id: "model", label: "Preset model", description: "Typed canvas state, layers and a seeded configuration" },
      { id: "render", label: "SVG renderer", description: "Deterministic transformations into vector geometry" },
      { id: "output", label: "Export layer", description: "Reusable CSS, SVG and PNG outputs" },
    ],
    repository: "https://github.com/chandrakantdubey/style-scape",
    reading: "Renderer details in the repository README",
  },
  {
    id: "game",
    title: "Pokédex RPG",
    label: "02 / DOMAIN-DRIVEN API",
    type: "Application architecture",
    problem: "Coordinate gameplay state, authentication, inventory and evolving character attributes across a mobile client and persistent backend.",
    approach: "Separate FastAPI routes, calculation rules, CRUD operations and SQLAlchemy models. Keep mechanics in domain functions and persist user state in PostgreSQL.",
    tradeoff: "A layered API makes domain rules testable and reduces coupling, but adds deliberate translation between client requests, business logic and persistence.",
    nodes: [
      { id: "mobile", label: "Expo client", description: "Mobile navigation, game state and authentication" },
      { id: "api", label: "FastAPI services", description: "Routers, validation and gameplay calculations" },
      { id: "db", label: "PostgreSQL", description: "Relational persistence for trainers and inventory" },
    ],
    repository: "https://github.com/chandrakantdubey/pokedex-backend",
    reading: "API architecture and schema in the backend README",
  },
  {
    id: "notebook",
    title: "MH15",
    label: "03 / OFFLINE-FIRST DESIGN",
    type: "Architecture in progress",
    problem: "Design a handwriting-first notebook that survives framework or renderer changes and can work without an account or network connection.",
    approach: "Define a pure TypeScript canvas and document model, with separate renderer and storage interfaces. React Native, Skia and SQLite are adapters around the core.",
    tradeoff: "Separating the core from UI frameworks increases initial design work, but keeps long-term portability possible. This is a project vision and evolving implementation, not a production benchmark.",
    nodes: [
      { id: "core", label: "Canvas core", description: "Documents, drawing commands and geometry" },
      { id: "bridge", label: "Ports / interfaces", description: "Renderer-independent contracts for persistence and display" },
      { id: "adapters", label: "Platform adapters", description: "React Native, Skia and local storage" },
    ],
    repository: "https://github.com/chandrakantdubey/mh15",
    reading: "Design principles and monorepo layout in readme.md",
  },
  {
    id: "fitness",
    title: "FitStream",
    label: "04 / USER-CENTRED SYSTEMS",
    type: "Web application",
    problem: "Unify workouts, progressive challenges, geolocation and fitness metrics in a usable application across different device sizes.",
    approach: "Use React for the workout and analytics interface, Leaflet for GPS activity maps and FastAPI with SQLite for local application data and exports.",
    tradeoff: "A progressive web application offers broad accessibility, but background behavior and sensor permissions vary by browser. Offline guarantees need to be tested by feature.",
    nodes: [
      { id: "client", label: "React PWA", description: "Activity tracking, challenges and analytics" },
      { id: "location", label: "Leaflet / GPS", description: "Location input and interactive route display" },
      { id: "backend", label: "FastAPI + SQLite", description: "Workout data and CSV exports" },
    ],
    repository: "https://github.com/chandrakantdubey/fitstream",
    reading: "Feature and architecture overview in README",
  },
];

export default function CaseStudyExplorer() {
  const [selected, setSelected] = useState(0);
  const [focused, setFocused] = useState(1);
  const active = cases[selected];

  return (
    <div className="case-study" aria-labelledby="case-study-heading">
      <div className="case-header">
        <div className="case-kicker"><Layers3 size={15}/> SOURCE-BASED ENGINEERING NOTES</div>
        <div className="case-counter">{String(selected + 1).padStart(2,"0")} / {String(cases.length).padStart(2,"0")}</div>
      </div>
      <div className="case-layout">
        <div className="case-rail">
          <h3 id="case-study-heading">Behind the<br/><em>implementation.</em></h3>
          <p>Select a project to examine its architectural boundaries and engineering trade-offs.</p>
          <div className="case-tabs" role="tablist" aria-label="Project case studies">
            {cases.map((item, i) => (
              <button key={item.id} id={"case-tab-"+item.id} role="tab" aria-selected={selected === i}
                aria-controls="case-study-panel" type="button" tabIndex={selected === i ? 0 : -1}
                onKeyDown={event => {
                  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                  event.preventDefault();
                  const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
                  const next = (i + delta + cases.length) % cases.length;
                  setSelected(next); setFocused(1);
                  document.getElementById("case-tab-"+cases[next].id)?.focus();
                }}
                onClick={() => {setSelected(i); setFocused(1);}}>
                <span className="case-num">{item.label.slice(0,2)}</span><span>{item.title}</span><MoveRight size={17}/>
              </button>
            ))}
          </div>
        </div>
        <div className="case-detail" role="tabpanel" id="case-study-panel" aria-labelledby={"case-tab-"+active.id} tabIndex={0}>
          <div className="case-detail-heading"><div><span className="mono">{active.label}</span><h4>{active.title}</h4><span className="case-type">{active.type}</span></div><a href={active.repository} target="_blank" rel="noopener noreferrer" aria-label={"View "+active.title+" source code"}><ArrowUpRight size={23}/></a></div>
          <div className="case-pipeline">
            {active.nodes.map((node, i) => (
              <div className="case-node-wrap" key={node.id}>
                <button type="button" onClick={()=>setFocused(i)} aria-pressed={focused===i} className={"case-node "+(focused===i?"case-node-active":"")}>
                  <span className="case-node-index">0{i+1}</span><strong>{node.label}</strong><span className="case-node-interact">{focused===i?"INSPECTING":"INSPECT"}</span>
                </button>
                {i<active.nodes.length-1&&<MoveRight className="case-connector" size={17} aria-hidden="true"/>}
              </div>
            ))}
          </div>
          <p className="case-node-explanation"><CheckCircle2 size={17}/><span><strong>{active.nodes[focused].label}</strong> — {active.nodes[focused].description}</span></p>
          <div className="case-story">
            <div><span>THE PROBLEM</span><p>{active.problem}</p></div>
            <div><span>THE APPROACH</span><p>{active.approach}</p></div>
            <div><span>THE TRADE-OFF</span><p>{active.tradeoff}</p></div>
          </div>
          <div className="case-footer"><span><GitFork size={15}/> {active.reading}</span><a href={active.repository} target="_blank" rel="noopener noreferrer">Read source <ArrowUpRight size={16}/></a></div>
        </div>
      </div>
    </div>
  );
}
