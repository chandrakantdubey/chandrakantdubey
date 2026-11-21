import { useEffect, useState } from "react";
import { revealDiscovery } from "./discoveries";
import IncidentWorkbench from "./IncidentWorkbench";
import "../exhibition/type-motion.css";
import Sculpture from "./Sculpture";
import KineticChamber from "./KineticChamber";
import EntropyGarden from "./EntropyGarden";
import RootArchive from "./RootArchive";
import Negotiator from "./Negotiator";
import SystemsGallery from "./SystemsGallery";
import "./universe-ambition.css";
import "./experience.css";

const links=[["/","PORTFOLIO"],["/lab","THE LAB"],["/lab/disaster","DISASTER"],["/lab/take-five","TAKE FIVE"],["/play/packet","PACKET PANIC"],["/engineering","ENGINEERING"]];
function Shell({children}:{children:React.ReactNode}) {return <main className="universe">
  <nav className="uni-nav" aria-label="Experience navigation"><a href="/" style={{fontWeight:900,fontSize:18}}>CD<span style={{color:"#dcf8a1"}}>®</span></a>
    <div className="uni-nav-links">{links.map(([url,label])=><a key={url} href={url}>{label}</a>)}</div>
  </nav>{children}<footer>CD / EXPERIMENTAL ENGINEERING · SIMULATIONS ARE FICTIONAL · <a style={{color:"inherit"}} href="/">BACK TO THE PORTFOLIO</a></footer>
</main>}
function Hero({eyebrow,title,copy}:{eyebrow:string;title:string;copy:string}) {return <header className="uni-hero"><Sculpture/><div style={{position:"relative",zIndex:1}}><div className="uni-kicker">{eyebrow}</div><h1>{title}</h1><p>{copy}</p></div></header>}
const exhibits=[
  {title:"DEBUG THE DISASTER",eyebrow:"01 / INCIDENT RESPONSE",copy:"Real causal rules. Bad interventions. Consequences you can observe.",url:"/lab/disaster"},
  {title:"TAKE FIVE",eyebrow:"02 / GENERATIVE PLAYGROUND",copy:"Kinetic experiments, procedural artwork, and a machine that refuses to cooperate.",url:"/lab/take-five"},
  {title:"PACKET PANIC",eyebrow:"03 / NETWORK STRATEGY",copy:"Route four packet classes under thermal pressure. Choose a defense policy or bring a co-pilot for classic co-op.",url:"/play/packet"},
  {title:"SYSTEMS GALLERY",eyebrow:"04 / ENGINEERING EXHIBITS",copy:"Explore why systems fail, how capacity behaves, and what trade-offs really cost.",url:"/engineering"},
];
export function Laboratory() {useEffect(()=>revealDiscovery("anomaly"),[]);return <Shell><Hero eyebrow="EXHIBITION / AFTER HOURS" title="ENTER THE LAB." copy="A portfolio should be more than a list of things built. These are systems you can actually disturb."/><section className="uni-container"><div className="uni-grid">{exhibits.map(e=><article className="uni-card" key={e.url}><div className="uni-kicker">{e.eyebrow}</div><h2>{e.title}</h2><p>{e.copy}</p><a href={e.url}>ENTER EXPERIENCE ↗</a></article>)}</div></section></Shell>}
export function Disaster() {
  return <Shell><Hero eyebrow="01 / CAUSAL RELIABILITY SIMULATION" title="DEBUG THE DISASTER." copy="A real investigation workbench: trace pressure through dependencies, intervene, and verify recovery."/><IncidentWorkbench/></Shell>;
}
export function TakeFive() {
  const [chamber,setChamber]=useState<"machine"|"garden"|"negotiator">("machine");
  return <Shell><Hero eyebrow="02 / THE EXPERIMENTAL TRIPTYCH" title="TAKE FIVE."
    copy="A kinetic mechanism. A living ecosystem. A negotiation with consequences. Three different kinds of interaction."/>
    <section className="uni-container" style={{paddingTop:22}}>
      <div className="uni-controls" style={{marginBottom:25}} role="group" aria-label="Choose creative chamber">
        <button className="uni-button" aria-pressed={chamber==="machine"} type="button" onClick={()=>setChamber("machine")}>01 / IMPOSSIBLE MACHINE</button>
        <button className="uni-button" aria-pressed={chamber==="garden"} type="button" onClick={()=>setChamber("garden")}>02 / ENTROPY GARDEN</button>
        <button className="uni-button" aria-pressed={chamber==="negotiator"} type="button" onClick={()=>setChamber("negotiator")}>03 / THE NEGOTIATOR</button>
      </div>
      {chamber==="machine"?<KineticChamber/>:chamber==="garden"?<EntropyGarden/>:<Negotiator/>}
    </section>
  </Shell>;
}

export function Engineering() {
  return <Shell><Hero eyebrow="04 / CODE, COST & CONSEQUENCES" title="SYSTEMS GALLERY."
    copy="Real trade-offs and transparent modeling: scale a system, stress a dependency, race a write, inspect public source."/>
    <section className="uni-container" style={{paddingTop:22}}><SystemsGallery/></section>
  </Shell>;
}

export function Access() {
  return <Shell><Hero eyebrow="05 / A FICTIONAL INVESTIGATION" title="ROOT ACCESS."
    copy="Eight artifacts, six causal links, one final decision. No real shell, no permission beyond the story."/>
    <section className="uni-container" style={{paddingTop:22}}><RootArchive/></section>
  </Shell>;
}
