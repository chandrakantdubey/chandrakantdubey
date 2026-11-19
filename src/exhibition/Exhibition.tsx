import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Menu, X } from "lucide-react";
import { featuredProjects, links, technologyGroups, workExperience } from "../atelier/content";
import { internalTeamWork, publicTeamWork } from "../atelier/clientWork";
import ContactSection from "../atelier/ContactSection";
import ChromaticSculpture from "./ChromaticSculpture";
import ProjectPoster from "./ProjectPoster";
import "./exhibition.css";

function useScrollExperience(ref:React.RefObject<HTMLDivElement|null>) {
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
      <span className="nav-annotation">CHANDRAKANT DUBEY <span> / </span> SOFTWARE ENGINEER</span>
      <nav className={menu?"nav-items nav-items-open":"nav-items"} aria-label="Primary navigation">
        {[["Work","work"],["Experience","experience"],["Stack","skills"],["Contact","contact"]].map(([name,id],i)=><a href={"#"+id} key={id} onClick={()=>setMenu(false)}><small>0{i+1}</small>{name}</a>)}
      </nav>
      <a className="nav-availability" href="#contact">LET'S TALK <ArrowUpRight size={17}/></a>
      <button type="button" className="mobile-nav-toggle" onClick={()=>setMenu(value=>!value)} aria-expanded={menu} aria-label={menu?"Close navigation":"Open navigation"}>{menu?<X size={24}/>:<Menu size={24}/>}</button>
      <div className="scroll-progress" ref={progress} aria-hidden="true"/>
    </header>
  </>;
}

function Hero() {
  return <section className="exhibition-hero" id="top" aria-labelledby="hero-heading">
    <div className="hero-grain" aria-hidden="true"/>
    <div className="hero-top-bar"><span>PORTFOLIO — EDITION 2026</span><span>BASED IN MUMBAI, INDIA</span></div>
    <h1 id="hero-heading" className="hero-title" aria-label="Chandrakant Dubey">
      <span className="hero-name-top" aria-hidden="true">{"CHANDRAKANT".split("").map((char,i)=><span key={i} className="hero-letter" style={{animationDelay:(.06+i*.045)+"s"}}>{char}</span>)}</span>
      <span className="hero-name-bottom" aria-hidden="true">DUBEY<span className="hero-dot">.</span></span>
    </h1>
    <div className="hero-sculpture"><ChromaticSculpture/></div>
    <span className="hero-rotator-caption">AN INTERACTIVE OBJECT <span> / </span> DRAG TO ROTATE</span>
    <div className="hero-meta">
      <p>Full-stack software engineer.</p>
      <div className="hero-meta-side"><span>REACT / BACKEND / CLOUD</span><a href="#work">ENTER THE PORTFOLIO <ArrowDown size={18}/></a></div>
    </div>
    <div className="hero-index" aria-hidden="true">CD—001 <span>CREATIVE CODE / 01</span></div>
  </section>;
}

function Projects() {
  const [active,setActive]=useState(0);
  const selected=featuredProjects[active];
  const activate=(index:number)=>setActive((index+featuredProjects.length)%featuredProjects.length);
  return <section className="projects-section" id="work" aria-labelledby="projects-heading">
    <div className="section-topline" data-reveal><span>01 / SELECTED WORK</span><span>2023 — 2026</span></div>
    <div className="work-heading" data-reveal>
      <h2 id="projects-heading">THE <em>WORK.</em></h2>
      <p>Six independent projects. A few different disciplines. One place to explore them.</p>
    </div>
    <div className="gallery-layout">
      <div className="gallery-stage" role="tabpanel" aria-labelledby={"project-button-"+selected.id} id="project-stage" tabIndex={0}>
        <div className="gallery-scene" key={selected.id}><ProjectPoster category={selected.category}/></div>
        <div className="gallery-stage-footer">
          <div><span>PROJECT {selected.number} / 06</span><strong>{selected.name}</strong></div>
          <a href={selected.repository} target="_blank" rel="noopener noreferrer" aria-label={"Explore "+selected.name+" source code"}>VIEW SOURCE <ArrowUpRight size={18}/></a>
        </div>
      </div>
      <div className="gallery-list">
        <div className="gallery-list-top"><span>SELECT A PROJECT</span><span>06 / 06</span></div>
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
            <span className="gallery-row-number">{project.number}</span>
            <span className="gallery-row-content"><strong>{project.name}</strong><small>{project.label}</small></span>
            <ArrowUpRight size={22} className="gallery-row-icon"/>
          </button>)}
        </div>
        <div className="gallery-summary" key={"summary-"+selected.id}>
          <p>{selected.description}</p>
          <div className="gallery-tags">{selected.stack.slice(0,4).map(s=><span key={s}>{s}</span>)}</div>
          {selected.status&&<span className="gallery-status">{selected.status}</span>}
          {selected.secondary&&<a href={selected.secondary.url} target="_blank" rel="noopener noreferrer">ALSO: {selected.secondary.label} <ArrowUpRight size={15}/></a>}
        </div>
        <div className="gallery-prev-next"><button type="button" onClick={()=>activate(active-1)} aria-label="Previous project"><ArrowLeft size={18}/></button><span>{String(active+1).padStart(2,"0")} / 06</span><button type="button" onClick={()=>activate(active+1)} aria-label="Next project"><ArrowRight size={18}/></button></div>
      </div>
    </div>
    <a className="projects-footer-link" href={links.github+"?tab=repositories"} target="_blank" rel="noopener noreferrer">ALL GITHUB REPOSITORIES <ArrowUpRight size={18}/></a>
  </section>;
}

function Experience() {
  return <section className="experience-section" id="experience" aria-labelledby="experience-heading">
    <div className="section-topline inverse" data-reveal><span>02 / EXPERIENCE</span><span>THE PLACES I'VE BUILT WITH</span></div>
    <div className="experience-heading-wrap" data-reveal><h2 id="experience-heading">WORK<br/><span>IN</span> <em>PROGRESS.</em></h2><p>Professional work, from product interfaces to enterprise platforms.</p></div>
    <div className="career-list">
      {workExperience.map((job,i)=><article className="career-row" key={job.company} data-reveal>
        <span className="career-number">0{i+1}</span>
        <div className="career-name"><h3>{job.company}</h3><p>{job.detail}</p></div>
        <div className="career-role"><strong>{job.title}</strong><span>{job.period}</span></div>
        <span className="career-arrow" aria-hidden="true">↗</span>
      </article>)}
    </div>
    <div className="team-section">
      <div className="team-heading" data-reveal><span>SELECTED TEAM CONTRIBUTIONS</span><h3>ALSO <em>BUILT.</em></h3><p>Products developed alongside teams. Internal bank systems are listed without private links or customer details.</p></div>
      <div className="team-public">
        {publicTeamWork.map((item,i)=><a href={item.url} target="_blank" rel="noopener noreferrer" className="team-public-row" key={item.title}><span>{String(i+1).padStart(2,"0")}</span><strong>{item.title}</strong><small>{item.category}</small><ArrowUpRight size={17}/></a>)}
      </div>
      <div className="team-private">
        <div><span>PRIVATE DEPLOYMENTS</span><span>BANKING / INTRANET</span></div>
        <div className="team-private-items">{internalTeamWork.map(item=><article key={item.title}><strong>{item.title}</strong><small>{item.kind}</small></article>)}</div>
      </div>
    </div>
  </section>;
}

function Skills() {
  return <section className="skills-section" id="skills" aria-labelledby="skills-heading">
    <div className="section-topline skill-line" data-reveal><span>03 / CAPABILITIES</span><span>TOOLS I BUILD WITH</span></div>
    <h2 id="skills-heading" data-reveal><span>THE</span><span>STACK<span className="skills-star">✳</span></span></h2>
    <div className="skills-four">{technologyGroups.map((g,i)=><article className="skill-block" key={g.title} data-reveal>
      <div className="skill-block-heading"><span>0{i+1}</span><h3>{g.title}</h3></div>
      <div className="skill-words">{g.tools.map((tool,j)=><span key={tool} style={{transitionDelay:(j*25)+"ms"}}>{tool}</span>)}</div>
    </article>)}</div>
    <div className="skills-giant" aria-hidden="true"><span>REACT</span><span>PYTHON</span><span>CLOUD</span><span>BUILD</span></div>
  </section>;
}

export default function Exhibition() {
  useReveal();
  return <div className="exhibition-site">
    <Navigation/>
    <main id="main">
      <Hero/>
      <div className="identity-ribbon" aria-hidden="true"><span>DESIGN × ENGINEERING × INTERACTION × EXPERIENCE × DESIGN × ENGINEERING × INTERACTION × EXPERIENCE ×</span></div>
      <Projects/>
      <Experience/>
      <Skills/>
      <ContactSection/>
    </main>
    <footer className="exhibition-footer">
      <a href="#top" className="footer-identity">CD<span>®</span></a>
      <span>© {new Date().getFullYear()} CHANDRAKANT DUBEY</span>
      <div><a href={links.github} target="_blank" rel="noopener noreferrer">GITHUB ↗</a><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LINKEDIN ↗</a><a href="#top">BACK TO TOP ↑</a></div>
    </footer>
  </div>;
}
