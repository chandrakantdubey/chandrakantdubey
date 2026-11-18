import { useRef, useState, type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronRight,
  Code2, Copy, Download, ExternalLink, Mail, Menu, MousePointer2, X,
} from "lucide-react";
import { DemoStage } from "./Demos";
import { contact, experience, projects, skillGroups } from "./data";
import "./arcade.css";

function Logo() {
  return <a className="am-logo" href="#top" aria-label="Chandrakant Dubey, top of page"><span>CD<span className="logo-dot">.</span></span><small>PORTFOLIO<br/>2026</small></a>;
}

function Halo() {
  const el=useRef<HTMLDivElement>(null);
  const onMove=(e:ReactPointerEvent<HTMLDivElement>)=>{
    const node=el.current;
    if(!node||e.pointerType==="touch")return;
    const rect=node.getBoundingClientRect();
    const x=(e.clientX-rect.left)/rect.width-.5;
    const y=(e.clientY-rect.top)/rect.height-.5;
    node.style.setProperty("--tilt-x",(-y*11).toFixed(1)+"deg");
    node.style.setProperty("--tilt-y",(x*11).toFixed(1)+"deg");
    node.style.setProperty("--glow-x",((x+.5)*100).toFixed(1)+"%");
    node.style.setProperty("--glow-y",((y+.5)*100).toFixed(1)+"%");
  };
  const onLeave=()=>{
    const node=el.current;
    if(!node)return;
    node.style.setProperty("--tilt-x","0deg");
    node.style.setProperty("--tilt-y","0deg");
  };
  return <div className="halo-stage" ref={el} onPointerMove={onMove} onPointerLeave={onLeave} aria-hidden="true">
    <div className="halo-grid"/>
    <div className="halo-scene">
      <div className="halo-ring ring-one"/>
      <div className="halo-ring ring-two"/>
      <div className="halo-ring ring-three"/>
      <div className="halo-orb"><div className="orb-reflection"/><div className="orb-circuit"><span/><span/><span/><span/></div><span>CD</span></div>
      <div className="halo-satellite sat-one"/>
      <div className="halo-satellite sat-two"/>
      <div className="halo-satellite sat-three"/>
    </div>
    <div className="halo-side-label halo-left">INTERACTIVE / 01</div>
    <div className="halo-side-label halo-right">X 19.0760 / Y 72.8777</div>
    <div className="halo-bottom-label"><span>DESIGNED & BUILT</span><span>IN MUMBAI, INDIA</span></div>
  </div>;
}

function ProjectShowcase() {
  const [active,setActive]=useState(0);
  const [visited,setVisited]=useState<ReadonlySet<number>>(()=>new Set([0]));
  const project=projects[active];
  const navigate=(i:number)=>{
    const next=(i+projects.length)%projects.length;
    setActive(next);
    setVisited(previous=>new Set([...previous,next]));
  };
  return <section id="work" className="arc-section work-section" aria-labelledby="work-title">
    <div className="section-headline"><div><div className="section-kicker"><span className="kicker-index">01</span><span>WORK / PLAYABLE PREVIEWS</span></div><h2 id="work-title">SELECTED <i>WORK</i><span className="headline-spark">✳</span></h2></div><div className="section-count">0{projects.length} PROJECTS / 0{projects.length} MINI DEMOS</div></div>
    <div className="project-console">
      <div className="project-selector">
        <div className="selector-label"><span><span className="live-pip"/> SELECT A PROJECT</span><span>{String(visited.size).padStart(2,"0")} / 04 FOUND</span></div>
        <div role="tablist" aria-label="Interactive project previews" className="project-tabs">
          {projects.map((item,i)=><button
            key={item.id} type="button" id={"project-tab-"+item.id} role="tab"
            aria-controls="project-demo" aria-selected={active===i}
            tabIndex={active===i?0:-1}
            onClick={()=>navigate(i)}
            onKeyDown={e=>{
              if(!["ArrowDown","ArrowUp","ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;
              e.preventDefault();
              const next=e.key==="Home"?0:e.key==="End"?projects.length-1:(i+(e.key==="ArrowDown"||e.key==="ArrowRight"?1:-1)+projects.length)%projects.length;
              navigate(next);
              document.getElementById("project-tab-"+projects[next].id)?.focus();
            }}
            className={"project-tab "+(active===i?"is-active":"")}>
            <span className="project-number">{visited.has(i)?"✓":item.number}</span>
            <span className="project-tab-name"><strong>{item.name}</strong><small>{item.kind}</small></span>
            <ArrowUpRight size={19} className="project-tab-arrow" aria-hidden="true"/>
          </button>)}
        </div>
        <div className="selector-bottom"><div className="discovery-header"><span>DISCOVERED / {visited.size} OF 4</span><span>{visited.size===projects.length?"COMPLETE ✳":"IN PROGRESS"}</span></div><div className="discovery-track" role="meter" aria-label="Projects explored" aria-valuemin={0} aria-valuemax={4} aria-valuenow={visited.size}>{projects.map((p,i)=><i key={p.id} className={visited.has(i)?"collected":""}/>)}</div><span><MousePointer2 size={15}/> EXPLORE ALL FOUR PROJECTS</span></div>
      </div>
      <div className="showcase-view" id="project-demo" role="tabpanel" aria-labelledby={"project-tab-"+project.id} tabIndex={0}>
        <div className="showcase-top"><div><span className="live-pip"/> LIVE MINI DEMO <span className="separator-slash">/</span> {project.interaction}</div><div className="showcase-arrows"><button type="button" aria-label="Previous project" onClick={()=>navigate(active-1)}><ArrowLeft size={17}/></button><button type="button" aria-label="Next project" onClick={()=>navigate(active+1)}><ArrowRight size={17}/></button></div></div>
        <div className="demo-host" key={project.id}><DemoStage id={project.id}/></div>
        <div className="project-detail"><div className="project-detail-copy"><h3>{project.name}</h3><p>{project.description}</p><div className="project-stack">{project.stack.map(s=><span key={s}>{s}</span>)}</div></div><div className="project-source"><a href={project.source} target="_blank" rel="noopener noreferrer">SOURCE CODE <ArrowUpRight size={18}/></a>{project.secondSource&&<a href={project.secondSource.url} target="_blank" rel="noopener noreferrer">{project.secondSource.label} <ExternalLink size={15}/></a>}</div></div>
      </div>
    </div>
    <a className="all-projects-link" target="_blank" rel="noopener noreferrer" href="https://github.com/chandrakantdubey?tab=repositories">VIEW ALL GITHUB REPOSITORIES <ArrowUpRight size={18}/></a>
  </section>;
}

function Experience() {
  const [selected,setSelected]=useState(0);
  return <section className="arc-section experience-section" id="experience" aria-labelledby="experience-title">
    <div className="section-headline"><div><div className="section-kicker"><span className="kicker-index">02</span><span>CAREER / EXPERIENCE</span></div><h2 id="experience-title">WORK <i>HISTORY</i></h2></div><span className="section-count">2023 — NOW</span></div>
    <div className="career-layout">
      <div className="career-rail" role="tablist" aria-label="Employers">
        {experience.map((job,i)=><button key={job.company} role="tab" id={"career-tab-"+i} aria-controls="career-panel" aria-selected={selected===i} tabIndex={selected===i?0:-1} type="button" onClick={()=>setSelected(i)} onKeyDown={e=>{
          if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();const next=(i+(e.key==="ArrowDown"?1:-1)+experience.length)%experience.length;setSelected(next);document.getElementById("career-tab-"+next)?.focus();}
        }} className={"career-entry "+(selected===i?"career-active":"")}>
          <span className="career-num">/{job.number}</span><span className="career-main"><strong>{job.company}</strong><small>{job.period}</small></span><ChevronRight size={18}/>
        </button>)}
      </div>
      <div className="career-panel" id="career-panel" role="tabpanel" aria-labelledby={"career-tab-"+selected} tabIndex={0}>
        <div className="career-panel-top"><span>EMPLOYMENT RECORD / {experience[selected].number}</span><span>CD.2026</span></div>
        <div className="career-panel-main" key={experience[selected].company}><span className="job-sticker">EXPERIENCE</span><div className="career-big-number">0{selected+1}</div><h3>{experience[selected].company}</h3><div className="career-role">{experience[selected].role}</div><p>{experience[selected].detail}</p><div className="career-date">{experience[selected].period}</div></div>
        <div className="career-panel-bottom"><span>WORK EXPERIENCE</span><span>FULL-STACK ENGINEERING</span></div>
      </div>
    </div>
  </section>;
}

function Skills() {
  const [selected,setSelected]=useState(0);
  const group=skillGroups[selected];
  return <section className="arc-section skills-section" id="skills" aria-labelledby="skills-title">
    <div className="section-headline"><div><div className="section-kicker"><span className="kicker-index">03</span><span>SKILLS / TECH STACK</span></div><h2 id="skills-title">THE <i>LOADOUT</i></h2></div><span className="section-count">CHOOSE A CATEGORY</span></div>
    <div className="skill-board"><div className="skill-menu" role="tablist" aria-label="Technology categories">
      {skillGroups.map((g,i)=><button key={g.id} type="button" role="tab" id={"skill-tab-"+g.id} aria-controls="skill-content" aria-selected={selected===i} tabIndex={selected===i?0:-1} onClick={()=>setSelected(i)} onKeyDown={e=>{if(e.key==="ArrowDown"||e.key==="ArrowUp"||e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();const next=(i+(e.key==="ArrowDown"||e.key==="ArrowRight"?1:-1)+skillGroups.length)%skillGroups.length;setSelected(next);document.getElementById("skill-tab-"+skillGroups[next].id)?.focus();}}}><span>0{i+1}</span>{g.name}<ArrowUpRight size={17}/></button>)}
    </div><div className="skill-content" id="skill-content" role="tabpanel" aria-labelledby={"skill-tab-"+group.id} tabIndex={0}>
      <div className="skill-content-top"><span>ACTIVE MODULE / 0{selected+1}</span><span className="skill-module-dot" style={{background:group.color}}/></div>
      <div className="skill-grid" key={group.id}>{group.items.map((skill,i)=><div key={skill} className="skill-chip" style={{"--skill-color":group.color,"--chip-index":i} as CSSProperties}><span className="chip-icon"><Code2 size={18}/></span><strong>{skill}</strong><span className="chip-corner">+</span></div>)}</div>
      <div className="skill-content-foot"><span>08 TECHNOLOGIES / CATEGORY</span><span>SKILLS / TECH STACK</span></div>
    </div></div>
  </section>;
}

function Contact() {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [message,setMessage]=useState("");
  const [status,setStatus]=useState("");
  const [copied,setCopied]=useState(false);
  const send=(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const subject=encodeURIComponent("Portfolio enquiry from "+name.trim());
    const body=encodeURIComponent(message.trim()+"\n\nFrom: "+name.trim()+"\nReply to: "+email.trim());
    setStatus("YOUR EMAIL APP SHOULD OPEN. IF NOT, COPY THE ADDRESS BELOW.");
    window.location.href="mailto:"+contact.email+"?subject="+subject+"&body="+body;
  };
  const copy=async()=>{
    try{await navigator.clipboard.writeText(contact.email);setCopied(true);setStatus("EMAIL ADDRESS COPIED.");}
    catch{setStatus("COPY THE ADDRESS SHOWN BELOW.");}
  };
  return <section className="arc-section contact-section" id="contact" aria-labelledby="contact-title">
    <div className="section-kicker"><span className="kicker-index">04</span><span>CONTACT</span></div>
    <div className="contact-grid">
      <div className="contact-copy"><h2 id="contact-title">LET'S<br/><i>TALK.</i><span className="contact-asterisk">✳</span></h2><div className="contact-email"><span>EMAIL</span><a href={"mailto:"+contact.email}>{contact.email} <ArrowUpRight size={18}/></a><button type="button" onClick={copy} aria-label="Copy email address">{copied?<Check size={17}/>:<Copy size={17}/>}</button></div><div className="contact-social"><a target="_blank" rel="noopener noreferrer" href={contact.github}>GITHUB <ArrowUpRight size={15}/></a><a target="_blank" rel="noopener noreferrer" href={contact.linkedin}>LINKEDIN <ArrowUpRight size={15}/></a><a href={contact.resume} download>RÉSUMÉ <Download size={15}/></a></div></div>
      <form className="contact-form" onSubmit={send}><div className="form-head"><span><Mail size={16}/> NEW MESSAGE</span><span>COMPOSE / 001</span></div>
        <div className="form-line"><label htmlFor="your-name">YOUR NAME</label><input id="your-name" value={name} onChange={e=>setName(e.target.value)} name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Name"/></div>
        <div className="form-line"><label htmlFor="your-email">YOUR EMAIL</label><input id="your-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} name="email" required maxLength={254} autoComplete="email" placeholder="you@example.com"/></div>
        <div className="form-line"><label htmlFor="your-message">YOUR MESSAGE</label><textarea id="your-message" name="message" value={message} onChange={e=>setMessage(e.target.value)} required minLength={10} maxLength={3000} rows={4} placeholder="Tell me about the project..."/></div>
        <button type="submit" className="form-send">COMPOSE EMAIL <ArrowUpRight size={20}/></button><div className="form-caption">OPENS YOUR EMAIL APP. NO DATA IS UPLOADED.</div>{status&&<p className="form-status" role="status">{status}</p>}
      </form>
    </div>
  </section>;
}

export default function PortfolioArcade() {
  const [menuOpen,setMenuOpen]=useState(false);
  const year=new Date().getFullYear();
  return <div className="arcade-site" id="top">
    <a href="#main" className="arcade-skip">Skip to content</a>
    <div className="arcade-noise" aria-hidden="true"/>
    <header className="arcade-nav"><div className="site-container nav-content"><Logo/><nav className={menuOpen?"nav-links nav-open":"nav-links"} aria-label="Main navigation">{[["WORK","work"],["EXPERIENCE","experience"],["SKILLS","skills"],["CONTACT","contact"]].map(([label,id])=><a key={id} href={"#"+id} onClick={()=>setMenuOpen(false)}>{label}</a>)}</nav><a className="nav-status" href="#contact"><span className="live-pip"/> AVAILABLE FOR COLLABORATION <ArrowUpRight size={17}/></a><button className="nav-toggle" type="button" aria-expanded={menuOpen} aria-label={menuOpen?"Close navigation":"Open navigation"} onClick={()=>setMenuOpen(v=>!v)}>{menuOpen?<X size={22}/>:<Menu size={22}/>}</button></div></header>
    <main id="main">
      <section className="arcade-hero" aria-labelledby="hero-title"><div className="site-container hero-content"><div className="hero-text">
        <div className="hero-indicator"><span className="hero-prompt">/ CHANDRAKANT DUBEY</span><span>FULL-STACK ENGINEER</span></div>
        <h1 id="hero-title"><span>CHANDRAKANT</span><span className="hero-last">DUBEY<span className="hero-star" aria-hidden="true">✳</span></span></h1>
        <div className="hero-strip"><span className="hero-location">MUMBAI, INDIA <span>•</span> REACT / PYTHON / CLOUD</span><a href="#work">EXPLORE WORK <ArrowDown size={20}/></a></div>
      </div><Halo/></div><div className="hero-corners" aria-hidden="true"><span>CD — 01</span><span>SCROLL TO EXPLORE ↓</span></div></section>
      <div className="arcade-marquee" aria-hidden="true"><div><span>REACT</span><b>✳</b><span>PYTHON</span><b>✳</b><span>FASTAPI</span><b>✳</b><span>TYPESCRIPT</span><b>✳</b><span>DOCKER</span><b>✳</b><span>POSTGRESQL</span><b>✳</b><span>REACT NATIVE</span><b>✳</b><span>REACT</span><b>✳</b><span>PYTHON</span><b>✳</b><span>FASTAPI</span><b>✳</b></div></div>
      <div className="site-container"><ProjectShowcase/><Experience/><Skills/></div>
      <Contact/>
    </main>
    <footer className="arcade-footer"><div className="site-container footer-grid"><Logo/><div>© {year} CHANDRAKANT DUBEY</div><a href="#top">BACK TO TOP ↑</a></div></footer>
  </div>;
}
