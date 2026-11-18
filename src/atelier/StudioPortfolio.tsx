import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Check,
  CirclePause, CirclePlay, Copy, Download, Fingerprint, Grid3X3,
  Menu, RefreshCw, ScanEye, X,
} from "lucide-react";
import FieldCanvas from "../field/FieldCanvas";
import TypeCanvas from "../field/TypeCanvas";
import { EMPTY_TELEMETRY, type FieldTelemetry } from "../field/telemetry";
import { normalizeSeed } from "../field/engine";
import { featuredProjects, links, technologyGroups, workExperience, type FeaturedProject } from "./content";
import ContactSection from "./ContactSection";
import "./studio.css";

type VisualMode = "type" | "mesh";

const publicTeamWork = [
  { title: "Uvation Marketplace", category: "E-commerce", url: "https://marketplace.uvation.com" },
  { title: "Uvation Rewards", category: "Loyalty platform", url: "https://rewards.uvation.com" },
  { title: "Kintree", category: "Family platform", url: "https://kintree.com" },
  { title: "Bombay Dyeing Retail", category: "Retail experience", url: "https://retail.bombaydyeing.com/" },
  { title: "Brush of Hope", category: "Public-interest platform", url: "https://brushofhope.life" },
  { title: "Nutriiya", category: "Website & mobile-app backend", url: "https://nutriiya.com" },
] as const;

const internalTeamWork = [
  { title:"i-Compass", kind:"Banking performance review management" },
  { title:"VAMS", kind:"Vendor timesheet management" },
  { title:"L&D Portal", kind:"Departmental learning & development" },
  { title:"CSR Portal", kind:"Banking corporate social responsibility" },
] as const;

function initialSeed():number {
  if(typeof window==="undefined")return 2049;
  const value=new URLSearchParams(window.location.search).get("field");
  return value && /^\d{1,6}$/.test(value)?normalizeSeed(Number(value)):2049;
}

function Inspector({ stats, mode, seed, close }:{
  stats:FieldTelemetry;mode:VisualMode;seed:number;close:()=>void
}) {
  return <aside id="field-inspector" className="field-inspector" aria-label="Real-time renderer inspector">
    <div className="inspector-header"><span><ScanEye size={14}/> LIVE INSPECTOR <i className={stats.status==="RUNNING"?"on":""}/></span><button type="button" onClick={close} aria-label="Close inspector"><X size={17}/></button></div>
    <div className="inspector-metrics">
      <div><span>FRAME RATE</span><strong>{stats.fps?stats.fps.toFixed(0):"—"}<small>fps</small></strong></div>
      <div><span>PAINT</span><strong>{stats.paintMs.toFixed(1)}<small>ms</small></strong></div>
      <div><span>{mode==="type"?"PARTICLES":"NODES"}</span><strong>{stats.nodes}</strong></div>
      <div><span>INPUT EVENTS</span><strong>{stats.interactions}</strong></div>
    </div>
    <dl className="inspector-list">
      <div><dt>Renderer</dt><dd>Canvas 2D</dd></div>
      <div><dt>Engine</dt><dd>{mode==="type"?"Glyph springs":"Mesh springs"}</dd></div>
      <div><dt>Frame status</dt><dd>{stats.status}</dd></div>
      <div><dt>Viewport</dt><dd>{stats.width} × {stats.height}</dd></div>
      <div><dt>Device pixels</dt><dd>{stats.dpr.toFixed(1)}×</dd></div>
      <div><dt>Pointer</dt><dd>{stats.pointer}</dd></div>
      <div><dt>Active shockwaves</dt><dd>{stats.pulses}</dd></div>
      <div><dt>Displacement</dt><dd>{stats.displacement.toFixed(2)} px</dd></div>
      <div><dt>Topology seed</dt><dd>{seed}</dd></div>
    </dl>
    <div className="inspector-equation"><span>MOTION MODEL / ACTUAL CODE</span><code>velocity += springForce · dt</code><code>position += velocity · dt</code><code>damping = exp(−k · dt)</code></div>
    <div className="inspector-source-links"><a href="https://github.com/chandrakantdubey/chandrakantdubey/blob/main/src/field/typeEngine.ts" target="_blank" rel="noopener noreferrer">Typographic physics <ArrowUpRight size={15}/></a><a href={links.implementation} target="_blank" rel="noopener noreferrer">Mesh engine <ArrowUpRight size={15}/></a></div>
  </aside>;
}

function TypeExperience() {
  const [seed,setSeed]=useState(initialSeed);
  const [mode,setMode]=useState<VisualMode>("type");
  const [paused,setPaused]=useState(false);
  const [inspecting,setInspecting]=useState(false);
  const [stats,setStats]=useState<FieldTelemetry>(EMPTY_TELEMETRY);
  const [copied,setCopied]=useState(false);
  const [saved,setSaved]=useState(false);
  const onTelemetry=useCallback((data:FieldTelemetry)=>setStats(data),[]);

  const reseed=useCallback(()=>{
    setSeed(current=>{
      const next=normalizeSeed((Math.imul(current,1664525)+1013904223)>>>0)%999999||1;
      const url=new URL(window.location.href);
      url.searchParams.set("field",String(next));
      window.history.replaceState(null,"",url);
      return next;
    });
    setCopied(false);setSaved(false);
  },[]);
  const share=async()=>{
    try{await navigator.clipboard.writeText(window.location.href);setCopied(true);}
    catch{setCopied(false);}
  };
  const save=()=>{
    const canvas=document.querySelector<HTMLCanvasElement>(".type-stage canvas");
    if(!canvas)return;
    canvas.toBlob(blob=>{
      if(!blob)return;
      const uri=URL.createObjectURL(blob);
      const link=document.createElement("a");
      link.href=uri;
      link.download="chandrakant-"+mode+"-"+seed+".png";
      link.click();
      window.setTimeout(()=>URL.revokeObjectURL(uri),1500);
      setSaved(true);
    },"image/png");
  };

  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(event.repeat||event.altKey||event.ctrlKey||event.metaKey)return;
      const target=event.target;
      if(target instanceof HTMLElement&&(["INPUT","TEXTAREA","SELECT"].includes(target.tagName)||target.isContentEditable))return;
      switch(event.key.toLowerCase()){
        case "i":setInspecting(value=>!value);break;
        case "p":setPaused(value=>!value);break;
        case "r":reseed();break;
        case "t":setMode("type");break;
        case "g":setMode("mesh");break;
        case "escape":setInspecting(false);break;
        default:break;
      }
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[reseed]);

  return <section className="intro shell" id="top" aria-labelledby="hero-title">
    <div className="intro-eyebrow"><span>CHANDRAKANT DUBEY <i>©</i> 2026</span><span>ENGINEER / MUMBAI, INDIA</span></div>
    <h1 className="sr-only" id="hero-title">Chandrakant Dubey — Full-stack Software Engineer</h1>
    <div className="type-stage">
      {mode==="type"?<TypeCanvas seed={seed} paused={paused} onTelemetry={onTelemetry}/>:<FieldCanvas seed={seed} paused={paused} onTelemetry={onTelemetry}/>}
      <div className="type-stage-top" aria-hidden="true"><span>CD / {mode==="type"?"GLYPH PHYSICS":"MESH TOPOLOGY"}</span><span>SEED {String(seed).padStart(6,"0")}</span></div>
      <div className="type-stage-bottom" aria-hidden="true"><span>{mode==="type"?"NOT AN IMAGE. ACTUAL PARTICLES.":"DETERMINISTIC SPRING GRID."}</span><span>MOVE / TOUCH / DISTURB ↗</span></div>
      {inspecting&&<Inspector stats={stats} mode={mode} seed={seed} close={()=>setInspecting(false)}/>}
    </div>
    <div className="type-toolbar">
      <div className="mode-switch" role="group" aria-label="Rendering mode">
        <button type="button" aria-pressed={mode==="type"} onClick={()=>setMode("type")}><Fingerprint size={16}/> TYPE <kbd>T</kbd></button>
        <button type="button" aria-pressed={mode==="mesh"} onClick={()=>setMode("mesh")}><Grid3X3 size={15}/> MESH <kbd>G</kbd></button>
      </div>
      <div className="type-actions">
        <button type="button" onClick={reseed} title="New generative pattern (R)"><RefreshCw size={15}/> <span>Remix</span></button>
        <button type="button" onClick={()=>setPaused(v=>!v)} title="Toggle animation (P)">{paused?<CirclePlay size={16}/>:<CirclePause size={16}/>} <span>{paused?"Resume":"Pause"}</span></button>
        <button type="button" onClick={share}>{copied?<Check size={16}/>:<Copy size={16}/>} <span>{copied?"Copied":"Share"}</span></button>
        <button type="button" onClick={save}>{saved?<Check size={16}/>:<Download size={16}/>} <span>{saved?"Saved":"Save PNG"}</span></button>
        <button type="button" className="inspect-toggle" aria-expanded={inspecting} aria-controls="field-inspector" onClick={()=>setInspecting(v=>!v)}><ScanEye size={17}/> Inspect <kbd>I</kbd></button>
      </div>
    </div>
    <div className="intro-caption">
      <div className="intro-caption-title"><span className="intro-caption-marker">↗</span><h2>Full-stack<br/><em>Software Engineer</em></h2></div>
      <div className="intro-caption-side"><p>Interfaces, backend systems, cloud infrastructure and the space between them.</p><a href="#work">Explore my work <ArrowDownRight size={18}/></a></div>
    </div>
  </section>;
}

function ProjectTile({project}: {project:FeaturedProject}) {
  return <article className="work-card" data-category={project.category}>
    <div className="card-top"><span className="card-number">{project.number} / 06</span><span className="card-type">{project.label}</span></div>
    <div className="card-main">
      <h3>{project.name}</h3>
      <p>{project.description}</p>
    </div>
    <div className="card-deep"><span>UNDER THE HOOD</span><p>{project.implementation}</p></div>
    <div className="card-footer">
      <div className="card-stack">{project.stack.slice(0,3).map(x=><span key={x}>{x}</span>)}</div>
      <a href={project.repository} target="_blank" rel="noopener noreferrer" aria-label={"Open "+project.name+" source code"} title="Explore source"><ArrowUpRight size={21}/></a>
    </div>
    {project.status&&<span className="card-status">{project.status}</span>}
  </article>;
}

function SelectedWork() {
  return <section className="section-block personal-work" id="work" aria-labelledby="work-title">
    <div className="shell">
      <div className="section-heading"><div><span className="section-index">01 / SELECTED REPOSITORIES</span><h2 id="work-title">Personal <em>projects.</em></h2></div><span className="section-aside">SIX SYSTEMS / REAL SOURCE CODE</span></div>
      <div className="compact-project-grid">{featuredProjects.map(p=><ProjectTile key={p.id} project={p}/>)}</div>
      <div className="section-end"><span>01 → 06 / SELECTED</span><a href={links.github+"?tab=repositories"} target="_blank" rel="noopener noreferrer">More on GitHub <ArrowUpRight size={16}/></a></div>
    </div>
  </section>;
}

function TeamWork() {
  return <div className="team-work" aria-labelledby="team-work-title">
    <div className="team-head"><div><span className="micro-label">BUILT WITH TEAMS</span><h3 id="team-work-title">Products shipped <em>together.</em></h3></div><p>Selected contributions across company teams and enterprise deployments. Internal applications are listed without private links.</p></div>
    <div className="public-work-grid">
      {publicTeamWork.map((item,i)=><a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer" className="team-link">
        <span className="team-index">{String(i+1).padStart(2,"0")}</span>
        <span className="team-name">{item.title}<small>{item.category}</small></span>
        <ArrowUpRight size={17}/>
      </a>)}
    </div>
    <div className="internal-work">
      <div className="internal-label"><span className="micro-label">INTRANET / BANKING SYSTEMS</span><span>PRIVATE DEPLOYMENTS — NO PUBLIC LINKS</span></div>
      <div className="internal-grid">{internalTeamWork.map((item,i)=><div key={item.title} className="internal-cell"><span>0{i+1}</span><strong>{item.title}</strong><small>{item.kind}</small></div>)}</div>
    </div>
  </div>;
}

function Experience() {
  return <section className="section-block experience-section" id="experience" aria-labelledby="experience-title">
    <div className="shell">
      <div className="section-heading"><div><span className="section-index">02 / PROFESSIONAL EXPERIENCE</span><h2 id="experience-title">Work <em>history.</em></h2></div><span className="section-aside">2023 — PRESENT</span></div>
      <div className="experience-table">{workExperience.map((job,i)=><div className="experience-row" key={job.company}>
        <span className="experience-counter">0{i+1}</span>
        <div className="experience-company"><h3>{job.company}</h3><p>{job.detail}</p></div>
        <div className="experience-role"><strong>{job.title}</strong><span>{job.period}</span></div>
      </div>)}</div>
      <TeamWork/>
    </div>
  </section>;
}

function Skills() {
  return <section className="section-block skills-section" id="skills" aria-labelledby="skills-title">
    <div className="shell">
      <div className="section-heading"><div><span className="section-index">03 / TECHNOLOGY</span><h2 id="skills-title">The <em>toolkit.</em></h2></div><span className="section-aside">BUILD / SHIP / OPERATE</span></div>
      <div className="skills-layout">{technologyGroups.map((group,i)=><div className="skill-column" key={group.title}>
        <div className="skill-column-head"><span>0{i+1}</span><h3>{group.title}</h3></div>
        <div className="skill-list">{group.tools.map((tool,j)=><div key={tool}><span>{String(j+1).padStart(2,"0")}</span>{tool}</div>)}</div>
      </div>)}</div>
    </div>
  </section>;
}

export default function StudioPortfolio() {
  const [menuOpen,setMenuOpen]=useState(false);
  const year=new Date().getFullYear();
  return <div className="studio-site">
    <a className="skip-nav" href="#main">Skip to content</a>
    <header className="studio-nav">
      <div className="shell studio-nav-inner">
        <a className="studio-logo" href="#top" aria-label="Chandrakant Dubey, home">cd<span>↗</span></a>
        <nav className={menuOpen?"nav-links open":"nav-links"} aria-label="Main">
          {[["Work","work"],["Experience","experience"],["Skills","skills"],["Contact","contact"]].map(([name,id])=><a key={id} href={"#"+id} onClick={()=>setMenuOpen(false)}>{name}</a>)}
        </nav>
        <a className="nav-contact" href={links.resume} download>Résumé <ArrowUpRight size={15}/></a>
        <button type="button" className="mobile-menu" onClick={()=>setMenuOpen(v=>!v)} aria-expanded={menuOpen} aria-label={menuOpen?"Close navigation":"Open navigation"}>{menuOpen?<X size={21}/>:<Menu size={21}/>}</button>
      </div>
    </header>
    <main id="main">
      <TypeExperience/>
      <SelectedWork/>
      <Experience/>
      <Skills/>
      <ContactSection/>
    </main>
    <footer className="studio-footer"><div className="shell footer-inner"><div><span className="footer-brand">cd<span>↗</span></span><span>© {year} Chandrakant Dubey</span></div><a href="https://github.com/chandrakantdubey/chandrakantdubey/tree/main/src/field" target="_blank" rel="noopener noreferrer">View rendering engine <ArrowUpRight size={15}/></a><a href="#top">Back to top <ArrowRight size={14}/></a></div></footer>
  </div>;
}
