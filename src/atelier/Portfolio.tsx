import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowDownRight, ArrowUpRight, Check, ChevronUp,
  CirclePause, CirclePlay, Copy, ExternalLink, Mail,
  Menu, RotateCw, ScanEye, X,
} from "lucide-react";
import FieldCanvas from "../field/FieldCanvas";
import { EMPTY_TELEMETRY, type FieldTelemetry } from "../field/telemetry";
import { normalizeSeed } from "../field/engine";
import {
  featuredProjects, links, technologyGroups, workExperience,
  type FeaturedProject, type ProjectCategory,
} from "./content";
import "./portfolio.css";

function initialSeed(): number {
  if (typeof window === "undefined") return 2049;
  const value = window.location.search ? new URLSearchParams(window.location.search).get("field") : null;
  return value !== null && /^\d{1,6}$/.test(value) ? normalizeSeed(Number(value)) : 2049;
}

function ProjectArtwork({ category }: { category: ProjectCategory }) {
  if (category === "realtime") {
    const activated = new Set([2, 7, 12, 13, 14, 19, 24]);
    return <div className="project-artwork art-blackout" aria-hidden="true">
      <div className="art-top-label">BLACKOUT / GRID 5×5</div>
      <div className="relay-grid">{Array.from({ length: 25 }, (_, i) =>
        <span key={i} className={activated.has(i) ? "relay-on" : ""}>
          <i className={"relay-shape relay-" + (i % 4)}/>
        </span>
      )}</div>
      <div className="art-bottom-label"><span>↳ ROOM STATE</span><span>COLYSEUS / WS</span></div>
    </div>;
  }
  if (category === "operations") {
    return <div className="project-artwork art-timesheet" aria-hidden="true">
      <div className="art-top-label">TIMESHEET / FOUR BOUNDARIES</div>
      <svg viewBox="0 0 430 242" preserveAspectRatio="xMidYMid meet">
        <g fill="none" stroke="#9fbfb0" strokeWidth="1.5">
          <path d="M115 95 H190 M263 95 H335 M225 123 V170 M180 95 H215"/>
          <path d="M115 150 H174" strokeDasharray="3 6"/>
        </g>
        <g fontSize="10" fontFamily="monospace" textAnchor="middle">
          <rect x="23" y="68" width="114" height="54" rx="2" fill="#243b38" stroke="#83a99a"/>
          <text x="80" y="90" fill="#e7e7db">REACT UI</text><text x="80" y="108" fill="#b1d3c0">AG GRID</text>
          <rect x="172" y="68" width="114" height="54" rx="2" fill="#395d54" stroke="#b0dfc6"/>
          <text x="229" y="90" fill="#f4f3e7">EXPRESS</text><text x="229" y="108" fill="#cae7d5">API / RBAC</text>
          <rect x="313" y="68" width="95" height="54" rx="2" fill="#243b38" stroke="#83a99a"/>
          <text x="361" y="90" fill="#e7e7db">HRMS</text><text x="361" y="108" fill="#b1d3c0">SERVICE</text>
          <rect x="169" y="171" width="120" height="40" rx="2" fill="#4c423a" stroke="#f0aa84"/>
          <text x="229" y="195" fill="#f8e1d0">ORACLE DB</text>
        </g>
      </svg>
      <div className="art-bottom-label"><span>API → HRMS / STORAGE</span><span>NODE + ORACLE</span></div>
    </div>;
  }
  if (category === "creative") {
    return <div className="project-artwork art-stylescape" aria-hidden="true">
      <div className="art-top-label">STYLESCAPE / SCENE</div>
      <svg viewBox="0 0 430 242" preserveAspectRatio="xMidYMid meet">
        <defs><linearGradient id="pattern-one" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e6ae90"/><stop offset=".5" stopColor="#b0a2d8"/><stop offset="1" stopColor="#94d3c5"/></linearGradient></defs>
        {Array.from({length:10},(_,i)=><path key={i} d={"M -20 "+(i*27-20)+" Q 120 "+(170-i*16)+" 224 "+(i*25-16)+" T 460 "+(120-i*10)} fill="none" stroke="url(#pattern-one)" strokeWidth={i%3===0?3:1.5} opacity={.4+i*.055}/>)}
        <rect x="145" y="50" width="140" height="140" rx="70" fill="#e2ae9444" stroke="#ead3c0" strokeWidth="1.2"/>
        <circle cx="215" cy="120" r="47" fill="#c7a4de55" stroke="#e9c9d9" strokeWidth="1.2"/>
      </svg>
      <div className="art-bottom-label"><span>DETERMINISTIC SVG</span><span>SEED / LAYERS</span></div>
    </div>;
  }
  if (category === "mobile") {
    return <div className="project-artwork art-pokedex" aria-hidden="true">
      <div className="art-top-label">POKÉDEX / API SURFACE</div>
      <div className="api-card"><div><span className="http-method">POST</span><span>/battle/turn</span><i>200</i></div><div><span className="http-method get">GET</span><span>/trainer/{'{id}'}</span><i>200</i></div><div><span className="http-method">POST</span><span>/inventory/use</span><i>200</i></div></div>
      <div className="art-bottom-label"><span>CLIENT → SERVICE → DB</span><span>FASTAPI</span></div>
    </div>;
  }
  if (category === "fullstack") {
    return <div className="project-artwork art-fitstream" aria-hidden="true">
      <div className="art-top-label">FITSTREAM / ROUTES</div>
      <svg viewBox="0 0 430 242" preserveAspectRatio="xMidYMid meet">
        <g stroke="#8faaa233" strokeWidth="1" fill="none"><path d="M0 68H430 M0 165H430 M90 0V242 M240 0V242 M355 0V242"/><path d="M0 120H430 M190 0V242"/></g>
        <path d="M56 200L110 158L130 184L200 105L272 132L335 50L381 69" fill="none" stroke="#a5c9b6" opacity=".48" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M56 200L110 158L130 184L200 105L272 132L335 50L381 69" fill="none" stroke="#f0af8c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="56" cy="200" r="9" fill="#132e29" stroke="#f0af8c" strokeWidth="3"/><circle cx="381" cy="69" r="9" fill="#f0af8c"/>
        <circle cx="200" cy="105" r="5" fill="#e7d9c7"/>
      </svg>
      <div className="art-bottom-label"><span>GPS → POLYLINE</span><span>LEAFLET</span></div>
    </div>;
  }
  return <div className="project-artwork art-farmpulse" aria-hidden="true">
    <div className="art-top-label">FARMPULSE / SENSOR SERIES</div>
    <svg viewBox="0 0 430 242" preserveAspectRatio="xMidYMid meet">
      {Array.from({length:6},(_,i)=><line key={i} x1="23" y1={30+i*35} x2="407" y2={30+i*35} stroke="#8cad9d33"/>)}
      <path d="M23 163 L55 143 L87 153 L119 91 L151 107 L183 90 L215 113 L247 71 L279 86 L311 52 L343 82 L375 49 L407 57" fill="none" stroke="#e4ac8d" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M23 185 L55 178 L87 170 L119 184 L151 161 L183 165 L215 141 L247 151 L279 134 L311 143 L343 120 L375 122 L407 102" fill="none" stroke="#95cbb0" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="311" cy="52" r="5" fill="#e4ac8d"/><circle cx="407" cy="102" r="5" fill="#95cbb0"/>
    </svg>
    <div className="art-bottom-label"><span>DEMO / SYNTHETIC READINGS</span><span>TIME SERIES</span></div>
  </div>;
}

function ProjectCard({ project }: { project: FeaturedProject }) {
  return <article className="work-card">
    <div className="work-card-art"><ProjectArtwork category={project.category}/></div>
    <div className="work-card-body">
      <div className="work-card-line"><span>{project.number} / {project.label}</span>{project.status&&<span className="development-flag">{project.status}</span>}</div>
      <h3>{project.name}</h3>
      <p className="work-description">{project.description}</p>
      <div className="work-engineering"><span>ENGINEERING DETAIL</span><p>{project.implementation}</p></div>
      <div className="work-chips">{project.stack.map(s=><span key={s}>{s}</span>)}</div>
      <div className="work-links">
        <a href={project.repository} target="_blank" rel="noopener noreferrer">Explore repository <ArrowUpRight size={17}/></a>
        {project.secondary&&<a href={project.secondary.url} target="_blank" rel="noopener noreferrer">{project.secondary.label} <ExternalLink size={15}/></a>}
      </div>
    </div>
  </article>;
}

function Inspector({ stats, seed, onClose }: {stats:FieldTelemetry;seed:number;onClose:()=>void}) {
  return <div className="field-inspector" id="field-inspector" aria-label="Live renderer inspector">
    <div className="inspector-top"><span><ScanEye size={15}/> RENDER INSPECTOR <i className={stats.status==="RUNNING"?"inspector-led active":"inspector-led"}/></span><button type="button" onClick={onClose} aria-label="Close inspector"><X size={17}/></button></div>
    <div className="inspector-readouts">
      <div><span>FRAME RATE</span><strong>{stats.fps?stats.fps.toFixed(0):"—"} <small>FPS</small></strong></div>
      <div><span>PAINT TIME</span><strong>{stats.paintMs.toFixed(2)} <small>MS</small></strong></div>
      <div><span>NODES</span><strong>{stats.nodes}</strong></div>
      <div><span>EDGES</span><strong>{stats.edges}</strong></div>
    </div>
    <dl className="inspector-details">
      <div><dt>Engine</dt><dd>Canvas 2D / spring mesh</dd></div>
      <div><dt>State</dt><dd>{stats.status}</dd></div>
      <div><dt>Viewport</dt><dd>{stats.width} × {stats.height}</dd></div>
      <div><dt>Pixel ratio</dt><dd>{stats.dpr.toFixed(2)}× (capped at 2×)</dd></div>
      <div><dt>Pointer</dt><dd>{stats.pointer}</dd></div>
      <div><dt>Active ripples</dt><dd>{stats.pulses}</dd></div>
      <div><dt>Input events</dt><dd>{stats.interactions}</dd></div>
      <div><dt>Mean displacement</dt><dd>{stats.displacement.toFixed(2)} px</dd></div>
      <div><dt>Topology seed</dt><dd>{seed}</dd></div>
    </dl>
    <div className="inspector-code"><span>INTEGRATOR / SEMI-IMPLICIT EULER</span><code>v = (v + force · dt) · exp(−8.8 · dt)</code><code>p = p + v · dt</code></div>
    <a className="inspector-source" href={links.implementation} target="_blank" rel="noopener noreferrer">Inspect the actual source <ArrowUpRight size={15}/></a>
  </div>;
}

function KineticHero() {
  const [seed,setSeed]=useState(initialSeed);
  const [paused,setPaused]=useState(false);
  const [inspecting,setInspecting]=useState(false);
  const [telemetry,setTelemetry]=useState<FieldTelemetry>(EMPTY_TELEMETRY);
  const [copied,setCopied]=useState(false);
  const updateTelemetry = useCallback((next:FieldTelemetry)=>setTelemetry(next),[]);

  const reseed=useCallback(()=>{
    setSeed(current=>{
      const next=normalizeSeed((Math.imul(current,1664525)+1013904223)>>>0)%999999||1;
      const url=new URL(window.location.href);
      url.searchParams.set("field", String(next));
      window.history.replaceState(null,"",url);
      return next;
    });
    setCopied(false);
  },[]);
  const share=async()=>{
    try {await navigator.clipboard.writeText(window.location.href);setCopied(true);}
    catch {setCopied(false);}
  };
  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if(event.altKey||event.ctrlKey||event.metaKey||event.repeat)return;
      const el=event.target;
      if(el instanceof HTMLElement && (["INPUT","TEXTAREA","SELECT"].includes(el.tagName)||el.isContentEditable))return;
      if(event.key.toLowerCase()==="i"){setInspecting(v=>!v);}
      if(event.key.toLowerCase()==="p"){setPaused(v=>!v);}
      if(event.key.toLowerCase()==="r"){reseed();}
      if(event.key==="Escape"){setInspecting(false);}
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[reseed]);

  return <section className="hero-layout" id="top" aria-labelledby="hero-name">
    <div className="hero-copy">
      <div className="hero-kicker"><span className="signal-dot"/> CHANDRAKANT DUBEY <span className="kicker-divider">/</span> PORTFOLIO 2026</div>
      <h1 id="hero-name">Chandrakant<br/><em>Dubey.</em></h1>
      <div className="hero-role"><span className="role-index">01 —</span><span>Full-stack engineer<br/>Mumbai, India</span></div>
      <p className="hero-summary">Product interfaces. Backend systems. Cloud infrastructure.</p>
      <div className="hero-actions"><a href="#work" className="action-dark">Explore work <ArrowDownRight size={19}/></a><a className="action-outline" href={"mailto:"+links.email}>Get in touch <ArrowUpRight size={18}/></a></div>
      <div className="hero-lower"><span>THIS SITE IS AN EXPERIMENT YOU CAN INSPECT.</span><span>PRESS <kbd>I</kbd> TO LOOK UNDER THE HOOD</span></div>
    </div>
    <div className="field-shell">
      <div className="field-top"><span>FIELD_001 / INTERACTIVE GEOMETRY</span><span className="field-state"><i/> {telemetry.status}</span></div>
      <div className="field-stage">
        <FieldCanvas seed={seed} paused={paused} onTelemetry={updateTelemetry}/>
        <div className="field-coordinate" aria-hidden="true">SEED {String(seed).padStart(6,"0")}<span>·</span> SPRING / WAVE</div>
        <div className="field-hint" aria-hidden="true">MOVE CURSOR / TAP TO DISTURB</div>
        {inspecting&&<Inspector stats={telemetry} seed={seed} onClose={()=>setInspecting(false)}/>}
      </div>
      <div className="field-controls">
        <div className="field-controls-left">
          <button type="button" onClick={reseed} title="Regenerate mesh (R)"><RotateCw size={15}/> Regenerate <kbd>R</kbd></button>
          <button type="button" onClick={()=>setPaused(v=>!v)} title="Toggle motion (P)">{paused?<CirclePlay size={15}/>:<CirclePause size={15}/>} {paused?"Resume":"Pause"} <kbd>P</kbd></button>
        </div>
        <div className="field-controls-right">
          <button type="button" onClick={share} title="Copy deterministic field URL">{copied?<Check size={15}/>:<Copy size={15}/>} {copied?"Copied":"Share"}</button>
          <button type="button" aria-expanded={inspecting} aria-controls="field-inspector" onClick={()=>setInspecting(v=>!v)} className="inspect-toggle"><ScanEye size={17}/> {inspecting?"Close":"Inspect"} <kbd>I</kbd></button>
        </div>
      </div>
    </div>
  </section>;
}

function Contact() {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [message,setMessage]=useState("");
  const [notice,setNotice]=useState("");
  const [copied,setCopied]=useState(false);
  const [directEnabled,setDirectEnabled]=useState(false);
  const [sending,setSending]=useState(false);
  const [website,setWebsite]=useState("");
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

  useEffect(()=>{
    if (!siteKey) return;
    const controller=new AbortController();
    const check=async()=>{
      try {
        const result=await fetch("/api/contact",{signal:controller.signal,headers:{"Accept":"application/json"}});
        if (!result.ok || !result.headers.get("content-type")?.includes("application/json")) return;
        const data=await result.json() as {enabled?:boolean};
        if(!controller.signal.aborted)setDirectEnabled(data.enabled===true);
      } catch { /* Vite dev builds without a serverless function retain mailto. */ }
    };
    void check();
    return ()=>controller.abort();
  },[siteKey]);

  useEffect(()=>{
    if (!directEnabled || !siteKey) return;
    const script=document.createElement("script");
    script.src="https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async=true;
    script.defer=true;
    script.dataset.contactTurnstile="true";
    document.head.appendChild(script);
    return ()=>{
      script.remove();
    };
  },[directEnabled,siteKey]);

  const composeMail=()=>{
    const subject=encodeURIComponent("Portfolio enquiry from "+name.trim());
    const body=encodeURIComponent(message.trim()+"\n\nFrom: "+name.trim()+"\nReply to: "+email.trim());
    setNotice("Your email app should open. Send the message there to complete contact.");
    window.location.assign("mailto:"+links.email+"?subject="+subject+"&body="+body);
  };

  const onSubmit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(!directEnabled){composeMail();return;}
    const token=document.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value??"";
    if(!token){setNotice("Complete the security check to send directly.");return;}
    setSending(true);
    setNotice("");
    try{
      const response=await fetch("/api/contact",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          name:name.trim(),email:email.trim(),message:message.trim(),website,
          token,requestId:crypto.randomUUID(),
        }),
        signal:AbortSignal.timeout(12000),
      });
      const result=await response.json() as {sent?:boolean;error?:string};
      if(response.ok&&result.sent){
        setNotice("Message submitted successfully. Thanks for getting in touch.");
        setName("");setEmail("");setMessage("");setWebsite("");
        const turnstile=(window as Window&{turnstile?:{reset:()=>void}}).turnstile;
        turnstile?.reset();
      }else{
        setNotice(result.error??"Unable to send directly. Use the email link or compose-email fallback.");
      }
    }catch{
      setNotice("Unable to send directly. Use the email link or compose-email fallback.");
    }finally{setSending(false);}
  };

  const copyEmail=async()=>{
    try {await navigator.clipboard.writeText(links.email);setCopied(true);setNotice("Email address copied.");}
    catch {setNotice("Select and copy the email address shown here.");}
  };
  return <section id="contact" className="contact-section" aria-labelledby="contact-title">
    <div className="section-heading contact-heading"><div><span className="eyebrow">04 / CONTACT</span><h2 id="contact-title">Get in touch<span className="period-accent">.</span></h2></div><span className="heading-aside">DIRECT LINE / OPEN</span></div>
    <div className="contact-layout">
      <div className="contact-left">
        <p>For engineering work, projects and collaborations.</p>
        <div className="contact-address"><span>EMAIL</span><div><a href={"mailto:"+links.email}>{links.email}</a><button type="button" onClick={copyEmail} aria-label="Copy email">{copied?<Check size={18}/>:<Copy size={18}/>}</button></div></div>
        <div className="social-links"><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={17}/></a><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={17}/></a><a href={links.resume} download>Résumé <ArrowUpRight size={17}/></a></div>
      </div>
      <form className="contact-form" onSubmit={onSubmit}>
        <div className="form-top"><span>{directEnabled?"SEND MESSAGE":"COMPOSE MESSAGE"}</span><Mail size={18}/></div>
        <div className="form-row"><label htmlFor="contact-name">Name</label><input id="contact-name" type="text" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div>
        <div className="form-row"><label htmlFor="contact-email">Email</label><input id="contact-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/></div>
        <div className="form-row"><label htmlFor="contact-message">Message</label><textarea id="contact-message" rows={4} minLength={10} maxLength={3000} required value={message} onChange={e=>setMessage(e.target.value)} placeholder="What are you building?"/></div>
        <div className="contact-honeypot" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" type="text" autoComplete="off" tabIndex={-1} value={website} onChange={e=>setWebsite(e.target.value)}/></div>
        {directEnabled&&siteKey&&<div className="contact-verification"><div className="cf-turnstile" data-sitekey={siteKey}/></div>}
        <button type="submit" disabled={sending} className="submit-mail">{sending?"Sending…":directEnabled?"Send message":"Compose email"} <ArrowUpRight size={18}/></button>
        {directEnabled&&<button type="button" className="compose-fallback" onClick={composeMail}>Or open a draft in your email app <ArrowUpRight size={15}/></button>}
        <p className="form-disclaimer">{directEnabled?"Messages are sent securely after verification.":"Opens your email application; nothing is uploaded from this form."}</p>
        {notice&&<p role="status" className="contact-status">{notice}</p>}
      </form>
    </div>
  </section>;
}

export default function Portfolio() {
  const [menuOpen,setMenuOpen]=useState(false);
  const year=new Date().getFullYear();
  return <div className="atelier-site">
    <a className="skip-nav" href="#main">Skip to content</a>
    <header className="site-nav"><div className="shell nav-content">
      <a href="#top" className="identity" aria-label="Chandrakant Dubey, home"><span className="identity-mark">cd<span>.</span></span><span className="identity-label">CHANDRAKANT<br/>DUBEY</span></a>
      <nav className={menuOpen?"nav-links open":"nav-links"} aria-label="Primary">
        {[["Work","work"],["Experience","experience"],["Skills","skills"],["Contact","contact"]].map(([title,id])=><a key={id} onClick={()=>setMenuOpen(false)} href={"#"+id}>{title}</a>)}
      </nav>
      <a href={links.github} target="_blank" rel="noopener noreferrer" className="nav-github">GitHub <ArrowUpRight size={16}/></a>
      <button className="mobile-menu" type="button" onClick={()=>setMenuOpen(v=>!v)} aria-expanded={menuOpen} aria-label={menuOpen?"Close navigation":"Open navigation"}>{menuOpen?<X size={23}/>:<Menu size={23}/>}</button>
    </div></header>
    <main id="main">
      <div className="shell"><KineticHero/></div>
      <div className="section-rule" aria-hidden="true"><span>01 / 04</span><span>SCROLL TO EXPLORE <ArrowDownRight size={16}/></span></div>
      <section id="work" className="shell page-section work-section" aria-labelledby="work-title">
        <div className="section-heading"><div><span className="eyebrow">01 / SELECTED WORK</span><h2 id="work-title">Built things<span className="period-accent">.</span></h2></div><div className="heading-aside">SIX REPOSITORIES<br/>SOURCE-VERIFIED</div></div>
        <div className="project-grid">{featuredProjects.map(project=><ProjectCard key={project.id} project={project}/>)}</div>
        <a className="section-footer-link" href={links.github+"?tab=repositories"} target="_blank" rel="noopener noreferrer">Browse all GitHub repositories <ArrowUpRight size={18}/></a>
      </section>
      <section id="experience" className="page-section experience-section" aria-labelledby="experience-title"><div className="shell">
        <div className="section-heading"><div><span className="eyebrow">02 / EXPERIENCE</span><h2 id="experience-title">Where I've worked<span className="period-accent">.</span></h2></div><span className="heading-aside">2023 — PRESENT</span></div>
        <div className="experience-list">{workExperience.map((item,i)=><article key={item.company} className="experience-item">
          <span className="experience-index">{String(i+1).padStart(2,"0")}</span>
          <div className="experience-main"><h3>{item.company}</h3><p>{item.detail}</p></div>
          <div className="experience-meta"><strong>{item.title}</strong><span>{item.period}</span></div>
        </article>)}</div>
      </div></section>
      <section id="skills" className="shell page-section skills-section" aria-labelledby="skills-title">
        <div className="section-heading"><div><span className="eyebrow">03 / TECHNOLOGIES</span><h2 id="skills-title">Tools of the trade<span className="period-accent">.</span></h2></div><span className="heading-aside">LANGUAGES / FRAMEWORKS / INFRASTRUCTURE</span></div>
        <div className="technology-grid">{technologyGroups.map((group,i)=><div className="technology-group" key={group.title}><div className="technology-head"><span>{String(i+1).padStart(2,"0")}</span><h3>{group.title}</h3></div><div className="technology-pills">{group.tools.map(tool=><span key={tool}>{tool}</span>)}</div></div>)}</div>
      </section>
      <Contact/>
    </main>
    <footer className="site-footer"><div className="shell footer-content"><div><span className="identity-mark">cd<span>.</span></span><span>© {year} Chandrakant Dubey</span></div><a href={links.implementation} target="_blank" rel="noopener noreferrer">View this site's engine <ArrowUpRight size={16}/></a><a href="#top">Back to top <ChevronUp size={16}/></a></div></footer>
  </div>;
}
