import { useEffect, useMemo, useState } from "react";
import { DISCOVERIES,interpretCommand,readDiscoveries,resetDiscoveries,revealDiscovery,type Discovery } from "./discoveries";
import { advanceIncident,createIncident,evidenceFor,intervene,SCENARIOS,type IncidentAction,type IncidentKind } from "./incidentEngine";
import "../exhibition/type-motion.css";
import Sculpture from "./Sculpture";
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
  {title:"PACKET PANIC",eyebrow:"03 / NETWORK STRATEGY",copy:"Ninety seconds of deterministic, server-authoritative network defense. Bring a friend.",url:"/play/packet"},
  {title:"SYSTEMS GALLERY",eyebrow:"04 / ENGINEERING EXHIBITS",copy:"Explore why systems fail, how capacity behaves, and what trade-offs really cost.",url:"/engineering"},
];
export function Laboratory() {useEffect(()=>revealDiscovery("anomaly"),[]);return <Shell><Hero eyebrow="EXHIBITION / AFTER HOURS" title="ENTER THE LAB." copy="A portfolio should be more than a list of things built. These are systems you can actually disturb."/><section className="uni-container"><div className="uni-grid">{exhibits.map(e=><article className="uni-card" key={e.url}><div className="uni-kicker">{e.eyebrow}</div><h2>{e.title}</h2><p>{e.copy}</p><a href={e.url}>ENTER EXPERIENCE ↗</a></article>)}</div></section></Shell>}
const actions:{id:IncidentAction;label:string;desc:string}[]=[
  {id:"rollback",label:"ROLL BACK",desc:"Revert the last revision"},
  {id:"limit-retries",label:"CAP RETRIES",desc:"Disable retry amplification"},
  {id:"scale",label:"SCALE REPLICAS",desc:"Add processing capacity"},
  {id:"throttle",label:"SHED LOAD",desc:"Reject some incoming traffic"},
  {id:"circuit",label:"OPEN BREAKER",desc:"Contain cascading requests"},
  {id:"warm-cache",label:"WARM CACHE",desc:"Restore hot key hit rates"},
];
export function Disaster() {
  const [kind,setKind]=useState<IncidentKind>("pool");
  const [seed,setSeed]=useState(42);
  const [state,setState]=useState(()=>createIncident("pool",42));
  const [tab,setTab]=useState<"evidence"|"events">("evidence");
  const reset=(next:IncidentKind=kind,nextSeed=seed)=>{setKind(next);setSeed(nextSeed);setState(createIncident(next,nextSeed));};
  const last=state.history.at(-1)!;
  const recovered=last.queue<70&&last.errors<2;
  useEffect(()=>{if(recovered&&state.actions.length)revealDiscovery("recovery");},[recovered,state.actions.length]);
  const history=state.history.slice(-23);
  const max=Math.max(500,...history.map(p=>p.latency));
  const pts=history.map((p,i)=>((i/Math.max(1,history.length-1))*700).toFixed(1)+","+(200-p.latency/max*180).toFixed(1)).join(" ");
  return <Shell>
    <Hero eyebrow="01 / LIVE CAUSAL SIMULATION · BROWSER-LOCAL" title="DEBUG THE DISASTER." copy="No predetermined correct answer. Operate the system, inspect evidence, and make consequences visible."/>
    <section className="uni-container" style={{paddingTop:22}}>
      <div className="uni-controls" style={{marginBottom:20}}><label htmlFor="scenario">SCENARIO</label><select id="scenario" value={kind} onChange={e=>reset(e.target.value as IncidentKind)}>{Object.entries(SCENARIOS).map(([id,v])=><option key={id} value={id}>{v.title}</option>)}</select><button className="uni-button" onClick={()=>reset(kind,seed+1)}>NEW SEED ↺</button><button className="uni-button" onClick={()=>setState(s=>advanceIncident(s,5))}>ADVANCE +5 TICKS →</button></div>
      <div className="uni-workbench"><div className="uni-panel">
        <div className="uni-status">{recovered?"● RECOVERING":"● SEV-1 / DEGRADED"} · TICK {state.tick} · SEED {seed}</div>
        <h2 style={{fontSize:"clamp(30px,4vw,58px)"}}>{SCENARIOS[kind].title}</h2>
        <p className="uni-muted">{SCENARIOS[kind].description}</p>
        <div className="uni-metrics"><div className="uni-metric"><strong>{last.latency.toLocaleString()}ms</strong><small>SIMULATED LATENCY</small></div><div className="uni-metric"><strong>{last.errors}%</strong><small>SIMULATED ERRORS</small></div><div className="uni-metric"><strong>{last.queue}</strong><small>QUEUE DEPTH</small></div></div>
        <svg viewBox="0 0 700 220" role="img" aria-label="Simulated latency history over time" style={{width:"100%",background:"#090f19",border:"1px solid #334254"}}>
          {[50,100,150,200].map(y=><line key={y} x1="0" y1={y} x2="700" y2={y} stroke="#8b99a7" strokeOpacity=".25" strokeDasharray="5 8"/>)}
          <polyline points={pts} fill="none" stroke={recovered?"#c6ed95":"#f2a086"} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
        <p className="uni-muted">Every action advances three deterministic simulation ticks. Different intervention sequences can produce different recovery paths.</p>
      </div><aside className="uni-panel">
        <div className="uni-kicker">OPERATOR WORKSTATION</div>
        <h2 style={{fontSize:36}}>MAKE THE CALL.</h2>
        <div className="uni-actions">{actions.map(a=><button className="uni-action" key={a.id} onClick={()=>setState(s=>intervene(s,a.id))} title={a.desc}>{a.label}<div style={{color:"#9baec3",fontWeight:400,marginTop:6}}>{a.desc}</div></button>)}</div>
        <div className="uni-controls"><button className="uni-button" onClick={()=>setTab("evidence")}>EVIDENCE</button><button className="uni-button" onClick={()=>setTab("events")}>DECISIONS ({state.actions.length})</button></div>
        <pre className="uni-log" aria-live="polite">{tab==="evidence"?evidenceFor(state):state.actions.map((a,i)=>String(i+1).padStart(2,"0")+". "+a).join("\n")||"No interventions yet."}</pre>
        <div className="uni-note" style={{marginTop:20}}>{recovered?"Latency and queue pressure are under control. Verify over more ticks before declaring victory.":"Evidence matters. Scaling, rolling back, and throttling are not interchangeable."}</div>
      </aside></div>
    </section>
  </Shell>;
}
const RINGS=[{name:"OUTER ROTOR",speed:1},{name:"INNER ROTOR",speed:2},{name:"CORE PHASE",speed:3}];
export function TakeFive() {
  const [angles,setAngles]=useState([0,0,0]);
  const [energy,setEnergy]=useState(45);
  const [order,setOrder]=useState(60);
  const [seed,setSeed]=useState(17);
  const [chamber,setChamber]=useState<"machine"|"garden">("machine");
  const solved=angles[0]===90&&angles[1]===180&&angles[2]===270;
  useEffect(()=>{if(solved)revealDiscovery("mechanism");},[solved]);
  const move=(i:number)=>setAngles(a=>a.map((v,k)=>(k===i||k===(i+1)%3)?(v+90)%360:v));
  const particles=useMemo(()=>Array.from({length:190},(_,i)=>{
    const turn=i*2.399963229728653, r=Math.sqrt(i/190);
    return {x:350+Math.cos(turn)*(35+r*290),y:200+Math.sin(turn)*(18+r*165),r:1+i%4,t:turn};
  }),[]);
  const exportArt=()=>{
    revealDiscovery("entropy");
    const svg=document.querySelector("#entropy-art");
    if(!svg)return;
    const blob=new Blob([new XMLSerializer().serializeToString(svg)],{type:"image/svg+xml"});
    const href=URL.createObjectURL(blob);const a=document.createElement("a");a.href=href;a.download="entropy-garden.svg";a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);
  };
  return <Shell><Hero eyebrow="02 / EXPERIMENTAL PLAYGROUND" title="TAKE FIVE." copy="No timer. No childish quiz. Just systems that behave unexpectedly when you touch them."/>
    <section className="uni-container" style={{paddingTop:22}}>
      <div className="uni-controls" style={{marginBottom:25}}><button className="uni-button" onClick={()=>setChamber("machine")}>THE IMPOSSIBLE MACHINE</button><button className="uni-button" onClick={()=>setChamber("garden")}>ENTROPY GARDEN</button></div>
      {chamber==="machine"?<div className="uni-workbench"><div className="uni-panel">
        <div className="uni-kicker">CHAMBER 001 · KINETIC COUPLING</div><svg viewBox="0 0 700 440" width="100%" role="img" aria-label="Three configurable concentric rotors">
          <defs><radialGradient id="machineG"><stop stopColor="#7b6de3" stopOpacity=".4"/><stop offset="1" stopColor="#080d19" stopOpacity="0"/></radialGradient></defs>
          <circle cx="350" cy="220" r="208" fill="url(#machineG)"/>
          {angles.map((angle,i)=><g key={i} transform={"rotate("+angle+" 350 220)"}><circle cx="350" cy="220" r={175-i*48} fill="none" stroke={i===0?"#e2a17f":i===1?"#aba0f6":"#d3f4a5"} strokeWidth={8-i} strokeDasharray={i===0?"120 35":i===1?"35 17":"16 8"}/><line x1="350" y1={220-(175-i*48)} x2="350" y2={230-(175-i*48)} stroke="#ffffff" strokeWidth="7"/></g>)}
          <circle cx="350" cy="220" r="35" fill={solved?"#d0f1a0":"#29334c"} stroke="#e4e2df" strokeWidth="2"/>
          <text x="350" y="226" fill={solved?"#15210e":"#fff"} fontSize="14" textAnchor="middle">{solved?"ON":"OFF"}</text>
        </svg>
      </div><div className="uni-panel"><div className="uni-kicker">PHASE ALIGNMENT / THREE ROTORS</div><h2 style={{fontSize:38}}>{solved?"CORE STABILIZED.":"ALIGN THE CORE."}</h2><p className="uni-muted">Align the outer, inner, and core rotors to 90°, 180°, and 270°. Each control moves its rotor and the next coupled rotor by a quarter turn. Find a combination that aligns all three. No hidden randomness.</p>
      {RINGS.map((r,i)=><div className="uni-controls" key={r.name}><span style={{width:135,font:"12px monospace"}}>{r.name}</span><strong style={{font:"15px monospace"}}>{angles[i]}°</strong><button className="uni-button" onClick={()=>move(i)}>ROTATE 90° ↻</button></div>)}
      <button className="uni-button" onClick={()=>setAngles([0,0,0])}>RESET CONFIGURATION</button>
      <div className="uni-note" style={{marginTop:25}}>{solved?"Core energy stabilized. The mechanism is online.":"A coupled three-rotor phase puzzle. Every input affects two mechanisms; search for a stable combination."}</div></div></div>:
      <div className="uni-workbench"><div className="uni-panel"><div className="uni-kicker">CHAMBER 002 · GENERATIVE FIELD</div>
      <svg id="entropy-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 400" className="uni-canvas" role="img" aria-label="Generated abstract flower field shaped by energy and order">
      <rect width="700" height="400" fill="#080d1a"/>{particles.map((p,i)=>{const k=(i+seed)%11;const dx=(energy-50)/50*Math.sin(p.t*3+k)*30;const dy=(100-order)/100*Math.cos(p.t*2+k)*50;return <circle key={i} cx={p.x+dx} cy={p.y+dy} r={p.r*(.65+energy/100)} fill={i%3===0?"#c9eea0":i%3===1?"#b0a1f4":"#f2a186"} opacity={.28+(i%6)*.105}/>})}
      <circle cx="350" cy="200" r={15+energy/4} fill="none" stroke="#bcaaf9" strokeWidth="2" strokeDasharray="8 10"/>
      </svg></div><div className="uni-panel"><div className="uni-kicker">FIELD SYNTHESIS</div><h2 style={{fontSize:40}}>GROW SOMETHING STRANGE.</h2><p className="uni-muted">A seeded procedural composition. Change energy, order, or the seed; export the result as a standalone SVG.</p>
      <div className="uni-controls"><label htmlFor="energy">ENERGY {energy}%</label><input id="energy" type="range" min="0" max="100" value={energy} onChange={e=>setEnergy(+e.target.value)}/></div>
      <div className="uni-controls"><label htmlFor="order">ORDER {order}%</label><input id="order" type="range" min="0" max="100" value={order} onChange={e=>setOrder(+e.target.value)}/></div>
      <div className="uni-controls"><button className="uni-button" onClick={()=>setSeed(v=>v+1)}>MUTATE SEED ↺</button><button className="uni-button" onClick={exportArt}>EXPORT SVG ↓</button></div>
      <div className="uni-note" style={{marginTop:20}}>Every composition is computed locally. No account, no backend, no prompt required.</div></div></div>}
    </section></Shell>;
}
export function Engineering() {
  const [traffic,setTraffic]=useState(1200);
  const [replicas,setReplicas]=useState(8);
  const [cache,setCache]=useState(65);
  const [capacity,setCapacity]=useState(150);
  const effective=traffic*(1-cache/100);
  const max=replicas*capacity;
  const utilization=effective/max*100;
  const queued=Math.max(0,Math.round(effective-max));
  useEffect(()=>{if(queued>0)revealDiscovery("architecture");},[queued]);
  return <Shell><Hero eyebrow="04 / ENGINEERING, NOT THEATER" title="SYSTEMS GALLERY." copy="Change an architectural assumption. Watch the consequences. Read the model limits."/>
    <section className="uni-container"><div className="uni-workbench"><div className="uni-panel"><div className="uni-kicker">CAPACITY LAB / DETERMINISTIC ESTIMATE</div><h2 style={{fontSize:40}}>WHAT BREAKS FIRST?</h2>
      {[{id:"traffic",label:"REQUESTS / SEC",value:traffic,min:100,max:10000,set:setTraffic},{id:"replicas",label:"APP REPLICAS",value:replicas,min:1,max:50,set:setReplicas},{id:"cache",label:"CACHE HIT %",value:cache,min:0,max:99,set:setCache},{id:"capacity",label:"CAPACITY / REPLICA",value:capacity,min:50,max:500,set:setCapacity}].map(f=><div className="uni-controls" key={f.id}><label htmlFor={f.id} style={{width:140}}>{f.label}</label><input id={f.id} type="range" min={f.min} max={f.max} value={f.value} onChange={e=>f.set(+e.target.value)}/><strong style={{width:50,textAlign:"right"}}>{f.value}</strong></div>)}
      <div className="uni-note" style={{marginTop:30}}>This is a simplified throughput and cache-offload model, not a cloud cost calculator, latency forecast, or actual production benchmark. It assumes perfectly distributed requests and uniform replicas.</div>
    </div><div className="uni-panel"><div className="uni-kicker">INSTANT ARCHITECTURE REPORT</div><div className="uni-metrics">
    <div className="uni-metric"><strong>{Math.round(utilization)}%</strong><small>UTILIZATION</small></div><div className="uni-metric"><strong>{queued}</strong><small>EXCESS RPS</small></div><div className="uni-metric"><strong>{Math.round(max)}</strong><small>CAPACITY RPS</small></div>
    </div><h2 style={{fontSize:40}}>{queued?"BOTTLENECK DETECTED.":"CAPACITY AVAILABLE."}</h2><p className="uni-muted">Effective application traffic: {Math.round(effective)} req/s. Peak application capacity: {max} req/s.</p>
    <div style={{height:15,background:"#273447",margin:"20px 0"}}><div style={{height:"100%",background:queued?"#f29d83":"#c4e89a",width:Math.min(100,utilization)+"%"}}/></div>
    <p className="uni-muted">Try reducing the cache hit ratio, doubling request volume, or adding replicas. The downstream database may still bottleneck: that dependency is intentionally outside this simplified model.</p>
    <a className="uni-button" href="/lab/disaster">TEST A FAILURE →</a>
    </div></div></section></Shell>;
}

export function Access() {
 const [found,setFound]=useState<Discovery[]>(()=>readDiscoveries());
 const [command,setCommand]=useState("");
 const [history,setHistory]=useState<string[]>(["CD://ROOT ACCESS — FICTIONAL ARCHIVE","Browser-local only. No shell or elevated privileges.","Type help to see commands."]);
 useEffect(()=>{const update=()=>setFound(readDiscoveries());window.addEventListener("cd:discovery",update);return()=>window.removeEventListener("cd:discovery",update)},[]);
 const execute=(e:React.FormEvent)=>{e.preventDefault();if(!command.trim())return;setHistory(h=>[...h,"> "+command,interpretCommand(command,found)].slice(-32));setCommand("");};
 const completion=found.includes("recovery")&&found.includes("mechanism")&&found.includes("entropy")&&found.includes("architecture");
 return <Shell><Hero eyebrow="05 / AN UNAUTHORIZED FICTION" title="ROOT ACCESS." copy="The archive remembers what you discover. It controls absolutely nothing outside this imaginary universe."/><section className="uni-container">
 <div className="uni-workbench"><div className="uni-panel"><div className="uni-kicker">LOCAL ARTIFACT INDEX · {found.length}/6</div><h2 style={{fontSize:42}}>{completion?"CORRELATION COMPLETE.":"RECOVER THE FRAGMENTS."}</h2>
 {Object.entries(DISCOVERIES).map(([key,meaning])=><div key={key} style={{padding:"15px 0",borderBottom:"1px solid #ffffff25"}}><strong style={{font:"600 13px monospace"}}>{found.includes(key as Discovery)?"◉":"○"} {key.toUpperCase()}</strong><p className="uni-muted" style={{margin:"6px 0 0"}}>{found.includes(key as Discovery)?meaning:"UNDISCOVERED · Explore the corresponding experience."}</p></div>)}
 <button className="uni-button" onClick={()=>{resetDiscoveries();setHistory(["Archive reset."]);}}>RESET ARCHIVE</button>
 </div><div className="uni-panel"><div className="uni-kicker">FICTIONAL TERMINAL · ALLOWLISTED COMMANDS</div><h2 style={{fontSize:38}}>THE SYSTEM IS LISTENING.</h2>
 <div className="uni-log" role="log" aria-live="polite" style={{minHeight:320}}>{history.map((line,i)=><div key={i} style={{marginBottom:8}}>{line}</div>)}</div>
 <form onSubmit={execute} className="uni-controls"><label htmlFor="archive-command">cd@archive:~$</label><input id="archive-command" autoComplete="off" maxLength={90} value={command} onChange={e=>setCommand(e.target.value)} style={{background:"#070c13",color:"#d9f8a1",padding:13,border:"1px solid #8798a5",flex:1,minWidth:110}}/><button className="uni-button" type="submit">RUN ↵</button></form>
 <div className="uni-note" style={{marginTop:20}}>The narrative is optional. Real project content and functional site controls never depend on these fictional commands.</div>
 </div></div></section></Shell>;
}
