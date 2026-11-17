import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronRight,
  Code2, ExternalLink, GitBranch, Layers3, Briefcase, Menu, RotateCcw,
  ShieldCheck, TerminalSquare, X,
} from "lucide-react";
import { DEFAULT_SCENARIO, explainTrace, simulateScenario, type Scenario } from "./simulate";
import CaseStudyExplorer from "./CaseStudyExplorer";
import "./systems-lab.css";

type FeaturedProject = {
  number: string;
  title: string;
  slug: string;
  type: string;
  summary: string;
  stack: string[];
  href: string;
  accent: "coral" | "blue" | "lime" | "lavender";
  highlight: string;
  external?: string;
};

const projects: FeaturedProject[] = [
  {
    number: "01", title: "StyleScape", slug: "style-scape", type: "GENERATIVE INTERFACES",
    summary: "A deterministic procedural design studio. Compose gradients, SVG shapes, and layered patterns — then export actual production-ready assets.",
    stack: ["React", "TypeScript", "SVG", "Zustand"],
    href: "https://github.com/chandrakantdubey/style-scape",
    accent: "coral", highlight: "DETERMINISTIC RENDERING",
    external: "https://style-scape-flax.vercel.app/",
  },
  {
    number: "02", title: "Pokédex RPG", slug: "pokedex", type: "API & GAME SYSTEMS",
    summary: "An RPG client backed by a layered FastAPI service. Authentication, persistent state, inventory, encounters, and domain-driven game rules.",
    stack: ["React Native", "FastAPI", "PostgreSQL", "SQLAlchemy"],
    href: "https://github.com/chandrakantdubey/pokedex-backend",
    accent: "blue", highlight: "MODULAR BACKEND",
    external: "https://github.com/chandrakantdubey/pokedex",
  },
  {
    number: "03", title: "MH15", slug: "mh15", type: "LOCAL-FIRST SOFTWARE",
    summary: "An experimental stylus-first notebook architecture built around a renderer-independent document model and offline-first design.",
    stack: ["TypeScript", "React Native", "Skia", "SQLite"],
    href: "https://github.com/chandrakantdubey/mh15",
    accent: "lime", highlight: "ENGINE-FIRST ARCHITECTURE",
  },
  {
    number: "04", title: "FitStream", slug: "fitstream", type: "FULL-STACK PRODUCT",
    summary: "A fitness PWA integrating activity tracking, GPS maps, guided challenges, exercise data, and a FastAPI backend.",
    stack: ["React", "FastAPI", "PWA", "Leaflet"],
    href: "https://github.com/chandrakantdubey/fitstream",
    accent: "lavender", highlight: "OFFLINE-CAPABLE PWA",
  },
];

const navItems = [
  { label: "Work", id: "work" },
  { label: "The lab", id: "lab" },
  { label: "Approach", id: "approach" },
  { label: "Contact", id: "contact" },
];

const nf = (value: number) => Math.round(value).toLocaleString("en-US");

function LabDiagram({ scenario, refresh }: { scenario: Scenario; refresh: number }) {
  return (
    <div className="lab-diagram" aria-label="Illustrative request architecture from client through edge cache and application replicas to a data layer">
      <div className="diagram-topline">
        <span><span className="led led-live" /> TOPOLOGY / SERVICE MESH</span>
        <span className="mono muted">MODEL V1.0 / {String(refresh).padStart(3, "0")}</span>
      </div>
      <svg className="diagram-svg" key={refresh} viewBox="0 0 680 280" role="img" aria-label="Client connects to edge cache, then API service replicas and a database">
        <defs>
          <linearGradient id="flow-warm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ff8c66"/><stop offset="1" stopColor="#e8b1a0"/></linearGradient>
          <linearGradient id="flow-cool" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#80d7f5"/><stop offset="1" stopColor="#8998eb"/></linearGradient>
          <filter id="node-glow"><feGaussianBlur stdDeviation="5"/></filter>
        </defs>
        <g className="diagram-grid">
          {Array.from({length: 15}, (_, i) => <line key={"v"+i} x1={20+i*46} y1="10" x2={20+i*46} y2="270" />)}
          {Array.from({length: 6}, (_, i) => <line key={"h"+i} x1="10" y1={20+i*46} x2="670" y2={20+i*46} />)}
        </g>
        <path d="M150 145 H204 M325 145 H368 M503 145 H550" className="flow-line flow-warm"/>
        <path d="M432 145 V65 M432 145 V225" className="flow-line flow-cool"/>
        <path d="M150 145 H204 M325 145 H368 M503 145 H550" className="flow-pulse flow-warm" />
        <path d="M432 145 V65 M432 145 V225" className="flow-pulse flow-cool"/>
        <g className="diagram-node">
          <rect x="23" y="105" width="127" height="80" rx="8" />
          <circle cx="42" cy="125" r="4" fill="#f99f7c"/>
          <text x="38" y="152" className="svg-node-title">CLIENT</text>
          <text x="38" y="169" className="svg-node-sub">HTTP / REQUEST</text>
        </g>
        <g className="diagram-node node-highlight">
          <rect x="204" y="105" width="121" height="80" rx="8" />
          <circle cx="223" cy="125" r="4" fill="#70ddbd"/>
          <text x="219" y="152" className="svg-node-title">EDGE CACHE</text>
          <text x="219" y="169" className="svg-node-sub">{scenario.cacheHitRate}% HIT RATIO</text>
        </g>
        <g className="diagram-node">
          <rect x="368" y="105" width="135" height="80" rx="8" />
          <circle cx="387" cy="125" r="4" fill={scenario.failure ? "#ff8268" : "#70ddbd"}/>
          <text x="382" y="152" className="svg-node-title">API CLUSTER</text>
          <text x="382" y="169" className="svg-node-sub">{scenario.replicas} REPLICAS</text>
        </g>
        <g className="diagram-node">
          <rect x="550" y="105" width="106" height="80" rx="8" />
          <circle cx="569" cy="125" r="4" fill="#9dacf5"/>
          <text x="564" y="152" className="svg-node-title">DATA</text>
          <text x="564" y="169" className="svg-node-sub">PERSISTENCE</text>
        </g>
        <g className={"diagram-node small-node "+(scenario.failure?"node-down":"")}>
          <rect x="378" y="20" width="108" height="45" rx="6"/>
          <text x="388" y="39" className="svg-node-title">{scenario.failure ? "NODE DOWN" : "HEALTHY"}</text>
          <text x="388" y="54" className="svg-node-sub">HEALTH CHECK</text>
        </g>
        <g className="diagram-node small-node">
          <rect x="378" y="225" width="108" height="43" rx="6"/>
          <text x="388" y="243" className="svg-node-title">RETRY</text>
          <text x="388" y="257" className="svg-node-sub">{scenario.retries?"ENABLED":"DISABLED"}</text>
        </g>
      </svg>
      <div className="diagram-legend"><span><i className="legend-line warm"/> Request flow</span><span><i className="legend-line cool"/> Service control</span><span>Illustrative only</span></div>
    </div>
  );
}

function RangeControl({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void;
}) {
  const percent = ((value-min)/(max-min))*100;
  return (
    <label className="lab-range">
      <span className="range-title"><span>{label}</span><strong>{nf(value)}{unit}</strong></span>
      <input aria-label={label} type="range" min={min} max={max} step={step} value={value}
        style={{ "--range-progress": percent+"%" } as CSSProperties}
        onChange={e=>onChange(Number(e.target.value))}/>
      <span className="range-ends"><small>{nf(min)}{unit}</small><small>{nf(max)}{unit}</small></span>
    </label>
  );
}

function TraceSimulator() {
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO);
  const [refresh, setRefresh] = useState(1);
  const model = useMemo(() => simulateScenario(scenario), [scenario]);
  const trace = useMemo(() => explainTrace(scenario, model), [scenario, model]);
  const update = (patch: Partial<Scenario>) => setScenario(current => ({...current, ...patch}));
  return (
    <section className="section-block lab-section" id="lab" aria-labelledby="lab-heading">
      <div className="section-head">
        <div><div className="section-label"><span className="section-index">02 /</span> INTERACTIVE ENGINEERING LAB</div>
          <h2 id="lab-heading">Don't just read it.<br/><em>Change the system.</em></h2></div>
        <p>Explore how caching, replication, and fault handling shape throughput. Every result comes from an inspectable, deterministic model — not a fabricated live dashboard.</p>
      </div>
      <div className="lab-shell">
        <div className="lab-main">
          <div className="lab-toolbar"><span className="mono"><span className="led led-live"/> REQUEST FLOW SIMULATOR</span><span className="lab-version">01 / 01 <span className="lab-divider">·</span> SANDBOX</span></div>
          <LabDiagram scenario={scenario} refresh={refresh}/>
          <div className="lab-results" aria-live="polite" aria-atomic="true">
            <div className="lab-result"><span>SUCCESS RATE</span><strong className={model.rejected?"result-warning":""}>{model.successRate.toFixed(1)}<small>%</small></strong><div className="meter"><i style={{width:model.successRate+"%"}}/></div></div>
            <div className="lab-result"><span>CACHE OFFLOAD</span><strong>{nf(model.cacheHits)}<small> req/s</small></strong><div className="meter"><i style={{width:scenario.cacheHitRate+"%"}}/></div></div>
            <div className="lab-result"><span>ORIGIN UTILIZATION</span><strong>{model.utilization.toFixed(1)}<small>%</small></strong><div className="meter"><i style={{width:model.utilization+"%"}}/></div></div>
          </div>
          <div className="trace-log">
            <div className="trace-log-title"><span><TerminalSquare size={15} aria-hidden="true"/> EXECUTION TRACE</span><button type="button" className="subtle-button" onClick={()=>setRefresh(x=>x+1)}><RotateCcw size={14}/> Replay flow</button></div>
            <ol>{trace.map((step,i)=><li key={step.label}><span className={"trace-index trace-"+step.tone}>{String(i+1).padStart(2,"0")}</span><div><strong>{step.label}</strong><p>{step.detail}</p></div></li>)}</ol>
          </div>
        </div>
        <aside className="lab-controls" aria-label="Simulator controls">
          <div className="controls-top"><span className="mono">CONFIGURATION</span><button type="button" onClick={()=>{setScenario(DEFAULT_SCENARIO);setRefresh(x=>x+1)}} className="reset-button">Reset ↗</button></div>
          <p className="controls-intro">Tune the workload. Observe how the system responds under stress.</p>
          <RangeControl label="Incoming traffic" value={scenario.requestsPerSecond} min={100} max={6000} step={100} unit=" req/s" onChange={v=>update({requestsPerSecond:v})}/>
          <RangeControl label="Cache hit ratio" value={scenario.cacheHitRate} min={0} max={90} step={5} unit="%" onChange={v=>update({cacheHitRate:v})}/>
          <RangeControl label="API replicas" value={scenario.replicas} min={1} max={8} step={1} unit="" onChange={v=>update({replicas:v})}/>
          <div className="control-divider"/>
          <label className="toggle-row"><span><strong>Inject node failure</strong><small>Take one replica out of service</small></span><input type="checkbox" checked={scenario.failure} onChange={e=>update({failure:e.target.checked})}/><span className="toggle-visual" aria-hidden="true"/></label>
          <label className="toggle-row"><span><strong>Retry failed requests</strong><small>Retry once if capacity permits</small></span><input type="checkbox" checked={scenario.retries} onChange={e=>update({retries:e.target.checked})}/><span className="toggle-visual" aria-hidden="true"/></label>
          <div className="control-divider"/>
          <div className="scenario-result"><span>REQUESTS UNAVAILABLE</span><strong className={model.rejected?"result-warning":""}>{nf(model.rejected)}</strong><small>{model.healthyReplicas} healthy of {scenario.replicas} configured replicas</small></div>
          <p className="sim-disclaimer"><ShieldCheck size={14}/> Synthetic, deterministic teaching model. Each replica has an assumed capacity of 700 requests/s; no production traffic or measured latency is displayed.</p>
        </aside>
      </div>
    </section>
  );
}

function ProjectGraphic({item}: {item:FeaturedProject}) {
  return <div className={"project-graphic graphic-"+item.accent} aria-hidden="true">
    <span className="graphic-corner">SYS / {item.number}</span>
    {item.slug==="style-scape" ? <div className="graphic-pattern"><i/><i/><i/><i/></div>
      : item.slug==="pokedex" ? <div className="graphic-api"><span>POST /battle</span><span>AUTH → ROUTER → SERVICE</span><span>200 OK</span></div>
      : item.slug==="mh15" ? <svg viewBox="0 0 300 160" className="graphic-stroke"><path d="M25 112 C65 35 90 164 137 83 S220 40 269 119" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M25 112 C65 35 90 164 137 83 S220 40 269 119" stroke="currentColor" strokeWidth="24" opacity=".12" fill="none" strokeLinecap="round"/></svg>
      : <div className="graphic-route"><span>●</span><i/><span>●</span><i/><span>◎</span></div>}
    <span className="graphic-caption">{item.highlight}</span>
  </div>;
}

function ProjectCard({item}: {item:FeaturedProject}) {
  return <article className="project-card">
    <ProjectGraphic item={item}/>
    <div className="project-content">
      <div className="project-top"><span>{item.number} / {item.type}</span><ExternalLink size={15}/></div>
      <h3>{item.title}</h3><p>{item.summary}</p>
      <div className="project-tags">{item.stack.map(s=><span key={s}>{s}</span>)}</div>
      <div className="project-actions"><a href={item.href} target="_blank" rel="noopener noreferrer">Explore source <ArrowUpRight size={17}/></a>{item.external&&<a href={item.external} target="_blank" rel="noopener noreferrer" className="secondary-link">{item.slug==="style-scape"?"Live app":item.slug==="pokedex"?"Mobile client":"Explore"} <ArrowUpRight size={15}/></a>}</div>
    </div>
  </article>;
}

function HeroTopology(){
  return <div className="hero-topology" aria-hidden="true">
    <div className="topology-meta"><span>FIELD NOTE / 001</span><span>ARCHITECTURE AS ARTIFACT</span></div>
    <svg viewBox="0 0 520 370" className="topology-art">
      <defs><linearGradient id="topo-gradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f8a180"/><stop offset="1" stopColor="#88bdd1"/></linearGradient></defs>
      {Array.from({length:13},(_,i)=><line key={i} x1={i*46} y1="0" x2={i*46} y2="370" stroke="#343a3a" strokeWidth=".6"/>)}
      {Array.from({length:10},(_,i)=><line key={i} x1="0" y1={i*43} x2="520" y2={i*43} stroke="#343a3a" strokeWidth=".6"/>)}
      <circle cx="260" cy="180" r="130" stroke="#626463" strokeDasharray="3 7" strokeWidth="1" fill="none"/>
      <circle cx="260" cy="180" r="92" stroke="#4c5554" strokeWidth="1" fill="none"/>
      <circle cx="260" cy="180" r="52" fill="#1b2525" stroke="#ef9979" strokeWidth="1.4"/>
      <path d="M260 50 V128 M260 232 V310 M130 180 H208 M312 180 H390 M167 88 L225 146 M295 214 L353 272 M353 88 L295 146 M225 214 L167 272" stroke="url(#topo-gradient)" strokeWidth="1.5" fill="none" strokeDasharray="6 5"/>
      {[[260,50],[260,310],[130,180],[390,180],[167,88],[353,272],[353,88],[167,272]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="14" fill="#1c2222" stroke={i%2?"#81a9b7":"#f8a180"} strokeWidth="1.2"/><circle cx={x} cy={y} r="3.2" fill={i%2?"#81a9b7":"#f8a180"}/></g>)}
      <text x="260" y="177" fill="#f5eee5" fontSize="18" fontFamily="monospace" fontWeight="700" textAnchor="middle">CD</text>
      <text x="260" y="193" fill="#b9aaa0" fontSize="8" fontFamily="monospace" textAnchor="middle">SYSTEMS</text>
      <path d="M415 180 H480" stroke="#f8a180" strokeWidth=".8"/><text x="480" y="173" textAnchor="end" fill="#d6c3b7" fontSize="9" fontFamily="monospace">EDGE</text>
      <path d="M260 50 V18 H345" stroke="#81a9b7" strokeWidth=".8"/><text x="346" y="21" fill="#ced3cf" fontSize="9" fontFamily="monospace">PROCESS / 01</text>
    </svg>
    <div className="topology-foot"><span>DESIGN × SYSTEMS × EXECUTION</span><span>SCHEMATIC / NOT TO SCALE</span></div>
  </div>;
}

export default function SystemsLab() {
  const [menuOpen, setMenuOpen] = useState(false);
  const year = new Date().getFullYear();
  return <div className="systems-site">
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="site-grain" aria-hidden="true"/>
    <header className="site-header">
      <div className="site-width header-inner">
        <a className="brand" href="#home" aria-label="Chandrakant Dubey, home"><span className="brand-symbol">CD<span className="brand-spark">✳</span></span><span className="brand-rule"/><span className="brand-text">SYSTEMS<br/>LAB</span></a>
        <nav className={menuOpen?"site-nav nav-open":"site-nav"} aria-label="Primary navigation">{navItems.map(item=><a key={item.id} href={"#"+item.id} onClick={()=>setMenuOpen(false)}>{item.label}</a>)}</nav>
        <div className="header-right"><span className="availability"><span className="led led-live"/> OPEN TO COLLABORATION</span><a className="header-contact" href="mailto:919chandrakant@gmail.com" aria-label="Email Chandrakant"><ArrowUpRight size={19}/></a></div>
        <button className="mobile-toggle" onClick={()=>setMenuOpen(x=>!x)} aria-label={menuOpen?"Close navigation":"Open navigation"} aria-expanded={menuOpen} type="button">{menuOpen?<X size={23}/>:<Menu size={23}/>}</button>
      </div>
    </header>
    <main id="main">
      <section className="hero site-width" id="home" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dash"/> HELLO, I'M CHANDRAKANT DUBEY <span className="eyebrow-star">✳</span></p>
          <h1 id="hero-title">I make<br/>complexity <span className="hero-serif">work.</span></h1>
          <p className="hero-summary">Full-stack engineer working across distributed backends, intelligent applications, and interaction-rich interfaces. I build the systems behind the experience — and the experience itself.</p>
          <div className="hero-actions"><a className="button-primary" href="#lab">Run a system demo <ArrowUpRight size={19}/></a><a className="button-plain" href="#work">Explore selected work <ArrowRight size={18}/></a></div>
          <div className="hero-baseline"><span>BASED IN MUMBAI, INDIA</span><span>PYTHON / TYPESCRIPT / REACT / CLOUD</span></div>
        </div>
        <HeroTopology/>
      </section>
      <div className="ticker" aria-hidden="true"><div className="ticker-inner"><span>BUILD WITH INTENTION</span><span>✳</span><span>DESIGN FOR FAILURE</span><span>✳</span><span>ENGINEER FOR PEOPLE</span><span>✳</span><span>BUILD WITH INTENTION</span><span>✳</span><span>DESIGN FOR FAILURE</span></div></div>
      <div className="site-width">
        <section className="section-block work-section" id="work" aria-labelledby="work-heading">
          <div className="section-head"><div><div className="section-label"><span className="section-index">01 /</span> SELECTED WORK</div><h2 id="work-heading">Systems with<br/><em>something to say.</em></h2></div><p>Software worth exploring beyond the screenshots. Each project links to its real source code, so you can trace the decisions from idea to implementation.</p></div>
          <div className="projects-grid">{projects.map(item=><ProjectCard key={item.slug} item={item}/>)}</div>
          <CaseStudyExplorer/>
          <a className="all-repos" href="https://github.com/chandrakantdubey?tab=repositories" target="_blank" rel="noopener noreferrer">All public repositories <ArrowUpRight size={18}/></a>
        </section>
        <TraceSimulator/>
        <section className="section-block approach-section" id="approach" aria-labelledby="approach-heading">
          <div className="section-head"><div><div className="section-label"><span className="section-index">03 /</span> HOW I THINK</div><h2 id="approach-heading">Under the surface,<br/><em>the details matter.</em></h2></div><p>Engineering is a series of trade-offs. Reliability, simplicity, maintainability and user experience all belong in the same conversation.</p></div>
          <div className="principles-grid">
            <div className="principle"><div className="principle-icon"><Layers3 size={23}/></div><span>01 / SYSTEM ARCHITECTURE</span><h3>Design for change.</h3><p>Well-defined boundaries, explicit contracts, and the smallest amount of complexity needed for real scale.</p></div>
            <div className="principle"><div className="principle-icon"><Activity size={23}/></div><span>02 / PRODUCTION THINKING</span><h3>Make failure observable.</h3><p>Timeouts, retries, idempotency, capacity, logs, and recovery are first-class product concerns.</p></div>
            <div className="principle"><div className="principle-icon"><Code2 size={23}/></div><span>03 / INTERACTION DESIGN</span><h3>Make complexity legible.</h3><p>Powerful software should still feel intuitive. Performance, accessibility, and visual clarity are engineering requirements.</p></div>
          </div>
          <div className="experience-panel"><div><span className="mono">PROFESSIONAL EXPERIENCE / SELECTED</span><h3>Real work.<br/><em>Real constraints.</em></h3></div><div className="experience-rows">
            <div><span>2026 — PRESENT</span><strong>Adeptken</strong><small>Enterprise applications · backend systems</small></div>
            <div><span>2025 — 2026</span><strong>Nutriiya</strong><small>Full-stack product engineering</small></div>
            <div><span>2024 — 2025</span><strong>Kintree</strong><small>Interactive graphs · APIs · collaboration</small></div>
            <div><span>2023 — 2024</span><strong>Uvation</strong><small>Frontend engineering · commerce systems</small></div>
          </div></div>
          <div className="work-note"><ShieldCheck size={17}/><p>Professional systems are described at a high level to respect client confidentiality. The interactive lab is a synthetic demonstration, not a reproduction of an employer's architecture or metrics.</p></div>
        </section>
      </div>
      <section className="contact-section" id="contact" aria-labelledby="contact-heading"><div className="site-width contact-inner"><div><div className="section-label"><span className="section-index">04 /</span> LET'S BUILD</div><h2 id="contact-heading">Have something<br/><em>worth solving?</em></h2><p>I'm interested in demanding engineering problems, thoughtful teams, and products where quality genuinely matters.</p></div><div className="contact-action"><a href="mailto:919chandrakant@gmail.com">Start a conversation <ArrowUpRight size={31}/></a><div className="contact-links"><a href="https://github.com/chandrakantdubey" target="_blank" rel="noopener noreferrer"><GitBranch size={17}/> GitHub</a><a href="https://www.linkedin.com/in/chandra-kant-dubey/" target="_blank" rel="noopener noreferrer"><Briefcase size={17}/> LinkedIn</a><a href="/Chandrakant_Dubey.pdf" download><ArrowDown size={17}/> Résumé</a></div></div></div></section>
    </main>
    <footer className="site-footer"><div className="site-width footer-inner"><span className="footer-mark">CD<span>✳</span></span><p>© {year} Chandrakant Dubey.<br/>Designed and engineered with intent.</p><a href="#home">Back to top <ChevronRight size={17}/></a><span className="footer-location"><Check size={15}/> MADE IN MUMBAI</span></div></footer>
  </div>;
}
