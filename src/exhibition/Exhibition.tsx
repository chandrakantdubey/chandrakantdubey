import { lazy, useEffect, useRef, useState, type RefObject } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Menu, X } from "lucide-react";
import { featuredProjects, links, workExperience } from "../atelier/content";
import { internalTeamWork, publicTeamWork } from "../atelier/clientWork";
import ContactSection from "../atelier/ContactSection";
import CodeMonument from "./CodeMonument";
import ProjectPoster from "./ProjectPoster";
import SkillOrbit from "./SkillOrbit";
import RootAccess, { type RootVisualMode } from "./RootAccess";
import VisitorResponse from "./VisitorResponse";
import DeferredExperience from "./DeferredExperience";
import SpecimenExperience from "./SpecimenExperience";
import { PROJECT_QUESTIONS, type SignalId } from "./signalTrail";
import { useSpecimenSession } from "./specimenSession";
import "./signal-trail.css";
const FluxGame=lazy(()=>import("../play/FluxGame"));
const PacketPanic=lazy(()=>import("../play/PacketPanic"));
const IncidentReplay=lazy(()=>import("./IncidentReplay"));
const ConsistencyExperiment=lazy(()=>import("./ConsistencyExperiment"));
import "../play/play.css";
import "../play/packet.css";
import "./spatial.css";
import "./exhibition.css";
import "./reactor.css";

function useScrollExperience(ref:RefObject<HTMLDivElement|null>) {
  useEffect(()=>{
    const progress=ref.current;
    let scheduled=false;
    const update=()=>{
      scheduled=false;
      if(!progress)return;
      const range=document.documentElement.scrollHeight-window.innerHeight;
      const amount=range>0?Math.max(0,Math.min(1,window.scrollY/range)):0;
      progress.style.transform="scaleX("+amount+")";
    };
    const onScroll=()=>{
      if(!scheduled){scheduled=true;requestAnimationFrame(update);}
    };
    update();
    window.addEventListener("scroll",onScroll,{passive:true});
    window.addEventListener("resize",onScroll);
    return()=>{
      window.removeEventListener("scroll",onScroll);
      window.removeEventListener("resize",onScroll);
    };
  },[ref]);
}

function useReveal() {
  useEffect(()=>{
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    if(media.matches)return;
    const elements=document.querySelectorAll<HTMLElement>("[data-reveal]");
    if(!("IntersectionObserver" in window))return;
    const visible=new Set<Element>();
    const observer=new IntersectionObserver(entries=>{
      for(const e of entries){
        if(!e.isIntersecting)continue;
        visible.add(e.target);
        e.target.classList.add("is-visible");
        observer.unobserve(e.target);
      }
    },{rootMargin:"0px 0px -24px 0px",threshold:.08});
    elements.forEach(element=>{
      if(element.getBoundingClientRect().top<window.innerHeight-28){
        element.classList.add("is-visible");
      }else{
        observer.observe(element);
      }
    });
    document.documentElement.classList.add("reveal-enabled");
    return()=>{
      observer.disconnect();
      document.documentElement.classList.remove("reveal-enabled");
      visible.clear();
    };
  },[]);
}

function Navigation() {
  const [menu,setMenu]=useState(false);
  const progress=useRef<HTMLDivElement>(null);
  useScrollExperience(progress);
  return <>
    <a className="skip-to-content" href="#main">Skip to content</a>
    <header className="exhibition-nav">
      <a href="#top" className="brand-mark" onClick={()=>setMenu(false)} aria-label="Chandrakant Dubey — top of page">c<span>d</span><i>®</i></a>
      <span className="nav-annotation">I WRITE CODE. IT SOMETIMES AGREES.</span>
      <nav className={menu?"nav-items nav-items-open":"nav-items"} aria-label="Primary navigation">
        {[["Work","work"],["Experience","experience"],["Stack","skills"],["Play","play"],["Contact","contact"]].map(([name,id])=><a href={"#"+id} key={id} onClick={()=>setMenu(false)}>{name}</a>)}
      </nav>
      <a className="nav-availability" href="#contact">SAY HELLO <ArrowUpRight size={17}/></a>
      <button type="button" className="mobile-nav-toggle" onClick={()=>setMenu(value=>!value)} aria-expanded={menu} aria-label={menu?"Close navigation":"Open navigation"}>{menu?<X size={24}/>:<Menu size={24}/>}</button>
      <div className="scroll-progress" ref={progress} aria-hidden="true"/>
    </header>
  </>;
}

function Hero({awakened,onChange,signalCount}:{awakened:boolean;onChange:(value:boolean)=>void;signalCount:number}) {
  return <section className="exhibition-hero" id="top" aria-labelledby="hero-heading">
    <div className="hero-grain" aria-hidden="true"/>
    <div className="hero-top-bar"><span>NO TEMPLATE IN SIGHT.</span><span>MUMBAI · ONLINE</span></div>
    <h1 id="hero-heading" className="hero-title" aria-label="Chandrakant Dubey">
      <span className="hero-name-top" aria-hidden="true">{"CHANDRAKANT".split("").map((char,i)=><span key={i} className="hero-letter" style={{animationDelay:(.06+i*.045)+"s"}}>{char}</span>)}</span>
      <span className="hero-name-bottom" aria-hidden="true">DUBEY<span className="hero-dot">.</span></span>
    </h1>
    <div className="hero-sculpture"><CodeMonument/></div>
    <SpecimenExperience awakened={awakened} onChange={onChange} signalCount={signalCount}/>
    <span className="hero-rotator-caption">GO ON, POKE IT <span> / </span> IT WON'T BITE</span>
    <div className="hero-meta">
      <p>It worked locally. Promise.</p>
      <div className="hero-meta-side"><span>ZERO STOCK TEMPLATES</span><a href="#work">SHOW ME THE CODE <ArrowDown size={18}/></a></div>
    </div>
  </section>;
}

function Projects({awakened,onDiscover,signals}:{awakened:boolean;onDiscover:(id:SignalId)=>void;signals:readonly SignalId[]}) {
  const [active,setActive]=useState(0);
  const [dossierOpen,setDossierOpen]=useState(false);
  const selected=featuredProjects[active];
  const activate=(index:number)=>{
    const next=(index+featuredProjects.length)%featuredProjects.length;
    if(next===active)return;
    setActive(next);
    setDossierOpen(false);
  };
  return <section className="projects-section" id="work" aria-labelledby="projects-heading">
    <div className="work-heading" data-reveal>
      <h2 id="projects-heading">IT <em>SHIPS.</em></h2>
      <p>Because “works on my machine” is not actually a launch strategy.</p>
    </div>
    <div className="gallery-layout">
      <div className="gallery-stage" role="tabpanel" aria-labelledby={"project-button-"+selected.id} id="project-stage" tabIndex={0}>
        <div className="gallery-world" onPointerMove={event=>{
          if(event.pointerType==="touch")return;
          const rect=event.currentTarget.getBoundingClientRect();
          const x=(event.clientX-rect.left)/rect.width-.5;
          const y=(event.clientY-rect.top)/rect.height-.5;
          event.currentTarget.style.setProperty("--gallery-ry",(x*13)+"deg");
          event.currentTarget.style.setProperty("--gallery-rx",(-y*9)+"deg");
        }} onPointerLeave={event=>{
          event.currentTarget.style.setProperty("--gallery-ry","-7deg");
          event.currentTarget.style.setProperty("--gallery-rx","5deg");
        }}>
          <div className="gallery-world-grid" aria-hidden="true"/>
          <div className="gallery-depth-sheet gallery-depth-prev" aria-hidden="true"><ProjectPoster category={featuredProjects[(active+5)%featuredProjects.length].category}/></div>
          <div className="gallery-depth-sheet gallery-depth-next" aria-hidden="true"><ProjectPoster category={featuredProjects[(active+1)%featuredProjects.length].category}/></div>
          <div className="gallery-scene gallery-scene-3d" key={selected.id}><ProjectPoster category={selected.category}/></div>
        </div>
        <div className="gallery-stage-footer">
          <div><strong>{selected.name}</strong></div>
          <a href={selected.repository} target="_blank" rel="noopener noreferrer" aria-label={"Explore "+selected.name+" source code"}>VIEW SOURCE <ArrowUpRight size={18}/></a>
        </div>
      </div>
      <div className="gallery-list">
        <div className="gallery-buttons" role="tablist" aria-label="Selected engineering projects">
          {featuredProjects.map((project,i)=><button key={project.id} id={"project-button-"+project.id} type="button" role="tab" aria-controls="project-stage" aria-selected={active===i} tabIndex={active===i?0:-1} onClick={()=>activate(i)}
            onMouseEnter={()=>activate(i)}
            onKeyDown={event=>{
              if(!["ArrowDown","ArrowUp","Home","End","ArrowLeft","ArrowRight"].includes(event.key))return;
              event.preventDefault();
              const next=event.key==="Home"?0:event.key==="End"?featuredProjects.length-1:(i+(["ArrowDown","ArrowRight"].includes(event.key)?1:-1)+featuredProjects.length)%featuredProjects.length;
              activate(next);
              document.getElementById("project-button-"+featuredProjects[next].id)?.focus();
            }}
            className={active===i?"gallery-row active":"gallery-row"}>
            <span className="gallery-row-content"><strong>{project.name}</strong><small>{project.label}</small></span>
            <ArrowUpRight size={22} className="gallery-row-icon"/>
          </button>)}
        </div>
        <div className="gallery-summary" key={"summary-"+selected.id}>
          <p>{selected.description}</p>
          <div className="gallery-tags">{selected.stack.slice(0,4).map(s=><span key={s}>{s}</span>)}</div>
          {selected.status&&<span className="gallery-status">{selected.status}</span>}
          {awakened&&<div className="signal-dossier">
            <button type="button" className="signal-dossier-trigger" aria-expanded={dossierOpen}
              aria-controls="signal-dossier-panel" onClick={()=>{
                setDossierOpen(v=>!v);
                if(!dossierOpen)onDiscover("archive");
              }}>
              <span>ARCHIVE / ENGINEERING NOTE</span>
              <span>{signals.includes("archive")?"RECOVERED":"UNREAD"} {dossierOpen?"−":"+"}</span>
            </button>
            {dossierOpen&&<div id="signal-dossier-panel" className="signal-dossier-body">
              <span>IMPLEMENTATION / FROM PROJECT RECORD</span>
              <p>{selected.implementation}</p>
              <span>DESIGN QUESTION</span>
              <p>{PROJECT_QUESTIONS[selected.id]}</p>
              <a href={selected.repository} target="_blank" rel="noopener noreferrer">
                INSPECT SOURCE <ArrowUpRight size={15}/>
              </a>
            </div>}
          </div>}
          {selected.secondary&&<a href={selected.secondary.url} target="_blank" rel="noopener noreferrer">ALSO: {selected.secondary.label} <ArrowUpRight size={15}/></a>}
        </div>
        <div className="gallery-prev-next"><button type="button" onClick={()=>activate(active-1)} aria-label="Previous project"><ArrowLeft size={18}/></button><span>{String(active+1).padStart(2,"0")} / 06</span><button type="button" onClick={()=>activate(active+1)} aria-label="Next project"><ArrowRight size={18}/></button></div>
      </div>
    </div>
    <a className="projects-footer-link" href={links.github+"?tab=repositories"} target="_blank" rel="noopener noreferrer">YES, THE SOURCE IS PUBLIC <ArrowUpRight size={18}/></a>
    <a className="projects-incident-link" href="#incident">ONE MORE THING: INVESTIGATE A PROD FAILURE <ArrowDown size={17}/></a>
  </section>;
}

function Experience() {
  return <section className="experience-section" id="experience" aria-labelledby="experience-heading">
    <div className="experience-heading-wrap" data-reveal><h2 id="experience-heading">YES,<br/><span>I'VE</span> <em>WORKED.</em></h2><p>Real teams, real users, and deadlines that had absolutely no chill.</p></div>
    <div className="career-list">
      {workExperience.map(job=><article className="career-row" key={job.company} data-reveal>
        <div className="career-name"><h3>{job.company}</h3><p>{job.detail}</p></div>
        <div className="career-role"><strong>{job.title}</strong><span>{job.period}</span></div>
        <span className="career-arrow" aria-hidden="true">↗</span>
      </article>)}
    </div>
    <div className="team-section">
      <div className="team-heading" data-reveal><h3>NOT <em>SOLO.</em></h3><p>Built with actual humans. Somehow, the standups were worth it.</p></div>
      <div className="team-public">
        {publicTeamWork.map(item=><a href={item.url} target="_blank" rel="noopener noreferrer" className="team-public-row" key={item.title}><strong>{item.title}</strong><small>{item.category}</small><ArrowUpRight size={17}/></a>)}
      </div>
      <div className="team-private">
        <div><span>THESE LIVE BEHIND BANK FIREWALLS. NICE TRY, INTERNET.</span></div>
        <div className="team-private-items">{internalTeamWork.map(item=><article key={item.title}><strong>{item.title}</strong><small>{item.kind}</small></article>)}</div>
      </div>
    </div>
  </section>;
}

function Skills() {
  return <section className="skills-section" id="skills" aria-labelledby="skills-heading">
    <h2 id="skills-heading" data-reveal><span>NO</span><span>MAGIC<span className="skills-star">✳</span></span></h2>
    <SkillOrbit/>
    <div className="skills-giant" aria-hidden="true"><span>REACT</span><span>PYTHON</span><span>CLOUD</span><span>BUILD</span></div>
  </section>;
}

function PlaySection() {
  return <section className="exhibition-play" id="play" aria-labelledby="play-heading">
    <div className="play-header" data-reveal>
      <h2 id="play-heading">TAKE <em>FIVE.</em></h2>
      <p>You came for the code. I brought a spaceship. This seems reasonable.</p>
    </div>
    <DeferredExperience kind="arcade" label="Signal Shift"><FluxGame/></DeferredExperience>
  </section>;
}

function FinalBoss({awakened,onDiscover,signals,unlocked}:{awakened:boolean;onDiscover:(id:SignalId)=>void;signals:readonly SignalId[];unlocked:boolean}) {
  const [manualOpen,setManualOpen]=useState(false);
  return <section className="after-hours" id="final-boss" aria-labelledby="final-boss-heading">
    <div className="after-hours-heading" data-reveal>
      <h2 id="final-boss-heading">SAVE THE<br/><em>INTERNET.</em></h2>
      <p>All those years learning to deploy, just to find out the internet still needs saving. You have 90 seconds.</p>
    </div>
    {awakened&&<div className="signal-arcade">
      <button className="signal-arcade-trigger" type="button" aria-expanded={manualOpen}
        aria-controls="signal-arcade-manual" onClick={()=>{
          setManualOpen(v=>!v);
          if(!manualOpen)onDiscover("arcade");
        }}>
        <span>ARCADE / SYSTEM MANUAL</span>
        <span>{signals.includes("arcade")?"RECOVERED":"UNREAD"} {manualOpen?"−":"+"}</span>
      </button>
      {manualOpen&&<div id="signal-arcade-manual" className="signal-arcade-manual">
        <div><strong>DETERMINISTIC SIMULATION</strong><p>520 ms fixed ticks. Packet direction and router changes use the shared engine, not animation frames.</p></div>
        <div><strong>CO-OP OWNERSHIP</strong><p>Operator 1 controls ingress columns 1–4; operator 2 controls egress columns 5–7. Repairs and the score are shared.</p></div>
        <div><strong>ROOM CONSISTENCY</strong><p>Server-authoritative games synchronize by polling and versioned Blob compare-and-swap. It is not WebSocket transport.</p></div>
        <a href="https://github.com/chandrakantdubey/chandrakantdubey/blob/main/src/play/packetEngine.js"
          target="_blank" rel="noopener noreferrer">READ ENGINE SOURCE <ArrowUpRight size={15}/></a>
      </div>}
    </div>}
    <DeferredExperience kind="packet" label="Packet Panic"><PacketPanic/></DeferredExperience>
    {awakened&&unlocked&&
      <DeferredExperience kind="experiment" id="consistency" label="Consistency Experiment">
        <ConsistencyExperiment/>
      </DeferredExperience>}
  </section>;
}

export default function Exhibition() {
  useReveal();
  const {mode,awakened,setAwakened,signals,discoverSignal,resetSignals,unlocked}=useSpecimenSession();
  const [rootVisualMode,setRootVisualMode]=useState<RootVisualMode>("normal");
  const siteClassName=["exhibition-site",
    awakened?"specimen-awakened":"",
    rootVisualMode==="chaos"?"root-chaos":rootVisualMode==="gravity"?"root-gravity":"",
  ].filter(Boolean).join(" ");
  return <div className={siteClassName}
    data-specimen-state={mode}>
    <Navigation/>
    <main id="main">
      <Hero awakened={awakened} onChange={setAwakened} signalCount={signals.length}/>
      <div className="identity-ribbon" aria-hidden="true"><div className="marquee-track"><span className="marquee-copy">PIXELS WERE HARMED IN THE MAKING OF THIS WEBSITE ✳ IT WORKED LOCALLY ✳ THEN WE DEPLOYED IT ✳ </span><span className="marquee-copy">PIXELS WERE HARMED IN THE MAKING OF THIS WEBSITE ✳ IT WORKED LOCALLY ✳ THEN WE DEPLOYED IT ✳ </span></div></div>
      <Projects awakened={awakened} onDiscover={discoverSignal} signals={signals}/>
      <DeferredExperience id="incident" kind="lab" label="Incident Investigation">
        <IncidentReplay awakened={awakened} onDiscover={discoverSignal} signals={signals}/>
      </DeferredExperience>
      <Experience/>
      <Skills/>
      <PlaySection/>
      <ContactSection/>
      <FinalBoss awakened={awakened} onDiscover={discoverSignal} signals={signals} unlocked={unlocked}/>
    </main>
    <footer className="exhibition-footer" id="site-footer">
      <a href="#top" className="footer-identity">CD<span>®</span></a>
      <span>© {new Date().getFullYear()} CD. DEPLOYED WITH QUESTIONABLE CONFIDENCE.</span>
      <div><a href={links.github} target="_blank" rel="noopener noreferrer">GITHUB ↗</a><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LINKEDIN ↗</a><a href="#top">BACK TO TOP ↑</a><RootAccess awakened={awakened} signals={signals} onResetSignals={resetSignals} onVisualModeChange={setRootVisualMode}/></div>
      <VisitorResponse/>
    </footer>
  </div>;
}
