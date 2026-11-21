import { useEffect, useMemo, useState } from "react";
import {
  assessment,advanceIncident,createIncident,decodeIncidentReplay,encodeIncidentReplay,
  evidencePanel,intervene,isRecovered,SCENARIOS,
  type IncidentAction,type IncidentEvidenceTab,type IncidentKind,type IncidentMetric,type IncidentState,
} from "./incidentEngine";
import { revealDiscovery } from "./discoveries";
import "./incident-workbench.css";

const ACTIONS:Array<{id:IncidentAction;label:string;description:string;category:string}>=[
  {id:"rollback",label:"Rollback release",description:"Restore the previous deployment configuration",category:"DEPLOY"},
  {id:"limit-retries",label:"Cap retries",description:"Stop repeated attempts amplifying dependency load",category:"TRAFFIC"},
  {id:"circuit",label:"Open circuit",description:"Bypass optional dependencies, contain propagation",category:"RESILIENCE"},
  {id:"close-circuit",label:"Close circuit",description:"Restore optional dependency calls",category:"RESILIENCE"},
  {id:"scale",label:"Add replicas",description:"Increase app capacity, not downstream capacity",category:"CAPACITY"},
  {id:"warm-cache",label:"Warm hot keys",description:"Restore a high cache-hit ratio",category:"CACHE"},
  {id:"throttle",label:"Shed 18% traffic",description:"Reject incoming load to protect dependencies",category:"TRAFFIC"},
  {id:"restore-traffic",label:"Restore traffic",description:"Lift the traffic shed by 18%",category:"TRAFFIC"},
];
type Series="latency"|"errors"|"queue";
const SERIES:Record<Series,{label:string;unit:string;color:string}> = {
  latency:{label:"LATENCY",unit:"ms",color:"#ff9b80"},
  errors:{label:"5XX",unit:"%",color:"#ffce9f"},
  queue:{label:"QUEUE",unit:"",color:"#c6e994"},
};
const SERVICES=["EDGE","GATEWAY","CHECKOUT","CACHE","DEPENDENCY","DATABASE"] as const;
const SERVICE_DESCRIPTIONS:Record<(typeof SERVICES)[number],string>={
  EDGE:"Ingress and coarse traffic admission",
  GATEWAY:"Request routing, timeouts and retry policy",
  CHECKOUT:"Primary application capacity and CPU utilization",
  CACHE:"Hit ratio controls the database request fraction",
  DEPENDENCY:"Downstream service with its own capacity limit",
  DATABASE:"Connection acquisition and the primary persistence path",
};
function format(n:number){return new Intl.NumberFormat("en-US").format(n)}
function graphData(history:IncidentMetric[],series:Series) {
  const points=history.slice(-50);
  const max=Math.max(series==="errors"?20:series==="queue"?200:300,...points.map(p=>p[series]))*1.08;
  const coordinates=points.map((p,i)=>({
    x:30+i/Math.max(1,points.length-1)*700,
    y:210-p[series]/max*175,
  }));
  return {path:coordinates.map((p,i)=>(i?"L":"M")+p.x.toFixed(1)+" "+p.y.toFixed(1)).join(" "),
    area:coordinates.length?coordinates.map((p,i)=>(i?"L":"M")+p.x.toFixed(1)+" "+p.y.toFixed(1)).join(" ")+" L730 210 L30 210 Z":"",
    max,points,coordinates};
}
function TelemetryChart({state,series,selectedTick,onSelectTick}:{state:IncidentState;series:Series;selectedTick:number;onSelectTick:(tick:number)=>void}) {
  const data=useMemo(()=>graphData(state.history,series),[state.history,series]);
  const selected=data.points.findIndex(p=>p.tick===selectedTick);
  const marker=selected>=0?data.coordinates[selected]:null;
  const last=data.points.at(-1);
  return <div className="iw-chart-wrap">
    <div className="iw-chart-heading">
      <span>{SERIES[series].label} / SIMULATED TIMESERIES</span>
      <strong>{last?.[series]} {SERIES[series].unit}</strong>
    </div>
    <svg viewBox="0 0 760 250" width="100%" role="img"
      aria-label={SERIES[series].label+" from simulation tick "+data.points[0]?.tick+" to "+last?.tick}>
      <defs><linearGradient id="iwArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SERIES[series].color} stopOpacity=".23"/><stop offset="1" stopColor={SERIES[series].color} stopOpacity="0"/></linearGradient></defs>
      {[35,79,123,167,210].map(y=><line key={y} x1="30" y1={y} x2="730" y2={y} stroke="#91a3b9" strokeOpacity=".18" strokeDasharray="3 7"/>)}
      <path d={data.area} fill="url(#iwArea)"/>
      <path d={data.path} fill="none" stroke={SERIES[series].color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      {marker&&<><line x1={marker.x} x2={marker.x} y1="25" y2="210" stroke="#e8f4f1" strokeOpacity=".8" strokeDasharray="3 4"/>
        <circle cx={marker.x} cy={marker.y} r="5" fill="#f9f9f4" stroke={SERIES[series].color} strokeWidth="3"/></>}
      <text x="30" y="239" fontSize="12" fill="#9eb2c4">T+{data.points[0]?.tick}</text>
      <text x="730" y="239" textAnchor="end" fontSize="12" fill="#9eb2c4">T+{last?.tick}</text>
      <text x="32" y="24" fontSize="12" fill="#9eb2c4">{Math.ceil(data.max)} {SERIES[series].unit}</text>
    </svg>
    <div className="iw-scrubber">
      <label htmlFor="incident-tick">INSPECT TICK <strong>T+{selectedTick}</strong></label>
      <input id="incident-tick" type="range" min={state.history[0]?.tick??0}
        max={state.tick} value={selectedTick} step={1} onChange={e=>onSelectTick(Number(e.target.value))}/>
    </div>
  </div>;
}
function Topology({state,selected,onSelect}:{state:IncidentState;selected:string;onSelect:(service:string)=>void}) {
  const culprit=state.kind==="pool"||state.kind==="cache"?"DATABASE":
    state.kind==="retries"||state.kind==="cascade"?"DEPENDENCY":"CHECKOUT";
  const bad=state.history.at(-1)?.queue??0;
  return <div className="iw-topology" aria-label="Service dependencies">
    <div className="iw-topology-title"><span>DEPENDENCY MAP</span><small>SELECT A SERVICE TO INSPECT</small></div>
    <div className="iw-nodes">{SERVICES.map((node,i)=><button key={node} type="button"
      className={"iw-node"+(node===culprit&&bad>45?" iw-node-degraded":"")+(selected===node?" iw-node-selected":"")}
      aria-pressed={selected===node} onClick={()=>onSelect(node)}>
      <span className="iw-node-id">0{i+1}</span><strong>{node}</strong>
      <span className="iw-node-status">{node===culprit&&bad>45?"● DEGRADED":"● CONNECTED"}</span>
    </button>)}</div>
    <div className="iw-node-detail"><strong>{selected}</strong><span>{SERVICE_DESCRIPTIONS[selected as (typeof SERVICES)[number]]??"Select a service"}</span></div>
  </div>;
}
function restoreFromUrl():IncidentState {
  try {
    const token=new URLSearchParams(window.location.search).get("r");
    if(token)return decodeIncidentReplay(token);
  }catch{/* Corrupt links must not block the workbench. */}
  return createIncident("pool",42);
}
export default function IncidentWorkbench() {
  const [state,setState]=useState<IncidentState>(restoreFromUrl);
  const [series,setSeries]=useState<Series>("latency");
  const [tab,setTab]=useState<IncidentEvidenceTab>("traces");
  const [focusTick,setFocusTick]=useState<number|null>(null);
  const [selectedService,setSelectedService]=useState<string>("DATABASE");
  const [reportOpen,setReportOpen]=useState(false);
  const [notice,setNotice]=useState("");
  const [decisionMode,setDecisionMode]=useState<"evidence"|"actions">("evidence");
  const point=state.history.find(p=>p.tick===focusTick)??state.history.at(-1)!;
  const recovered=isRecovered(state);
  const result=assessment(state);
  const selectedTick=point.tick;
  useEffect(()=>{if(recovered&&state.actions.length)revealDiscovery("recovery");},[recovered,state.actions.length]);
  const reset=(kind:IncidentKind=state.kind,seed=state.seed)=>{
    window.history.replaceState(null,"",window.location.pathname);
    setState(createIncident(kind,seed));setFocusTick(null);setTab("traces");setReportOpen(false);setNotice("");
  };
  const action=(id:IncidentAction)=>{
    setState(s=>intervene(s,id));setFocusTick(null);setNotice("");
    window.dispatchEvent(new CustomEvent("cd:sound-cue",{detail:{type:"warning"}}));
  };
  const step=(ticks:number)=>{setState(s=>advanceIncident(s,ticks));setFocusTick(null)};
  const share=async()=>{
    const url=new URL(window.location.href);
    url.searchParams.set("r",encodeIncidentReplay(state));
    if(url.toString().length>7500){setNotice("This replay is too long for a URL. Start a shorter session.");return}
    try{await navigator.clipboard.writeText(url.toString());setNotice("A deterministic incident replay link was copied.")}
    catch{setNotice("Clipboard unavailable. You can still inspect the session here.")}
  };
  const download=()=>{
    const report={model:"SIMULATED",kind:state.kind,seed:state.seed,version:"2.0.0",...result,
      rootCause:SCENARIOS[state.kind].rootCause,commands:state.commands,history:state.history};
    const blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download="incident-zero-"+state.kind+"-"+state.seed+".json";link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  return <section className="uni-container iw-app" aria-label="Simulated production incident workbench">
    <div className="iw-config">
      <div className="iw-config-left"><span className="iw-overline">INCIDENT ZERO / WORKBENCH V2</span>
        <label htmlFor="incident-scenario">SCENARIO</label>
        <select id="incident-scenario" value={state.kind} onChange={e=>reset(e.target.value as IncidentKind)}>
          {Object.entries(SCENARIOS).map(([id,scenario])=><option value={id} key={id}>{scenario.title}</option>)}
        </select>
        <span className="iw-overline">SEED {state.seed} · T+{state.tick}</span>
      </div>
      <div className="iw-config-right"><button onClick={()=>reset(state.kind,state.seed+1)}>NEW INCIDENT ↻</button><button onClick={()=>step(5)}>ADVANCE +5 TICKS →</button></div>
    </div>
    <div className="iw-statusline">
      <span className={recovered?"iw-led iw-led-ok":"iw-led"}/><strong>{recovered?"SLO VERIFIED / STABLE":"SEV-1 / INVESTIGATING"}</strong>
      <span>{SCENARIOS[state.kind].service}</span><span className="iw-status-time">SIMULATED · NO CUSTOMER DATA</span>
    </div>
    <div className="iw-layout">
      <div className="iw-main">
        <div className="iw-headline"><span className="iw-overline">INCIDENT BRIEF / 001</span>
          <h2>{SCENARIOS[state.kind].title}</h2><p>{SCENARIOS[state.kind].description}</p></div>
        <div className="iw-metrics">
          {[
            {name:"P95-LIKE LATENCY",value:format(point.latency)+"ms",tone:point.latency>300?"danger":"healthy"},
            {name:"5XX ERROR RATE",value:point.errors.toFixed(1)+"%",tone:point.errors>=1?"danger":"healthy"},
            {name:"QUEUE DEPTH",value:format(point.queue),tone:point.queue>35?"danger":"healthy"},
            {name:"AVAILABILITY",value:point.availability.toFixed(1)+"%",tone:point.availability<99?"danger":"healthy"},
          ].map(metric=><div key={metric.name} className={"iw-metric iw-"+metric.tone}><span>{metric.name}</span><strong>{metric.value}</strong></div>)}
        </div>
        <div className="iw-telemetry">
          <div className="iw-panel-heading"><strong>TELEMETRY EXPLORER</strong><span>SELECTED / T+{selectedTick}</span></div>
          <div className="iw-chart-tabs" role="group" aria-label="Metric selection">
            {(Object.keys(SERIES) as Series[]).map(key=><button key={key} type="button" aria-pressed={series===key} onClick={()=>setSeries(key)}>{SERIES[key].label}</button>)}
          </div>
          <TelemetryChart state={state} series={series} selectedTick={selectedTick} onSelectTick={setFocusTick}/>
        </div>
        <Topology state={state} selected={selectedService} onSelect={setSelectedService}/>
      </div>
      <aside className="iw-sidebar">
        <div className="iw-operations">
          <div className="iw-panel-heading"><strong>OPERATOR ACTIONS</strong><span>{state.actions.length} APPLIED</span></div>
          <p>Choose an intervention. The simulation advances three ticks after each command. Capacity, dependency load, and traffic loss all matter.</p>
          <div className="iw-action-grid">{ACTIONS.map(entry=><button type="button" key={entry.id} onClick={()=>action(entry.id)}
            disabled={state.commands.length>=80} title={entry.description}>
            <small>{entry.category}</small><strong>{entry.label}</strong><span>{entry.description}</span>
          </button>)}</div>
        </div>
        <div className="iw-evidence">
          <div className="iw-panel-heading"><strong>INVESTIGATION</strong><span>TIME T+{selectedTick}</span></div>
          <div className="iw-evidence-tabs" role="tablist" aria-label="Investigative evidence">
            {(["traces","logs","changes"] as const).map(value=><button type="button" role="tab"
              aria-selected={tab===value} key={value} onClick={()=>setTab(value)}>{value.toUpperCase()}</button>)}
          </div>
          <pre className="iw-log" role="tabpanel" aria-label={tab+" at tick "+selectedTick}>{evidencePanel(state,tab,selectedTick)}</pre>
          <div className="iw-inference"><strong>INVESTIGATIVE LEAD</strong><p>{SCENARIOS[state.kind].clue}</p></div>
        </div>
      </aside>
    </div>
    <div className="iw-report-section">
      <div className="iw-report-top"><div><span className="iw-overline">POST-INCIDENT REVIEW</span>
        <h2>OUTCOMES, NOT CONFETTI.</h2><p>Recovery requires four consecutive ticks below the latency, 5xx, queue, and admission-loss thresholds.</p></div>
        <div className="iw-report-actions">
          <button onClick={()=>setReportOpen(v=>!v)} aria-expanded={reportOpen}> {reportOpen?"CLOSE REPORT":"OPEN REPORT"} ↓</button>
          <button onClick={()=>void share()}>COPY REPLAY LINK ↗</button><button onClick={download}>EXPORT REPORT ↓</button>
        </div>
      </div>
      {reportOpen&&<div className="iw-report-body">
        <div className="iw-report-stats">
          {[
            {key:"VERIFICATION",value:recovered?"PASS":"NOT YET"},
            {key:"OPERATOR SCORE",value:String(result.score)+"/100"},
            {key:"EST. AFFECTED REQUESTS",value:format(result.userImpact)},
            {key:"COST UNITS",value:String(result.costUnits)},
          ].map(p=><div key={p.key}><span>{p.key}</span><strong>{p.value}</strong></div>)}
        </div>
        <div className="iw-report-columns"><div><strong>ROOT CAUSE</strong><p>{SCENARIOS[state.kind].rootCause}</p><strong>RUNBOOK</strong><p>{SCENARIOS[state.kind].firstResponse}</p></div>
          <div><strong>OPERATOR TIMELINE</strong>
            <div className="iw-timeline">{state.commands.length?state.commands.map((c,i)=><div key={i}><span>0{(i+1).toString().padStart(2,"0")}</span>
              {c.type==="action"?"APPLY / "+c.action.toUpperCase():"ADVANCE / "+c.ticks+" TICKS"}</div>):<p>No operator actions recorded.</p>}</div>
            <p>{result.tradeoffs}</p></div></div>
        <p className="iw-disclaimer">This report describes a deterministic abstraction, not real-world incident performance or customer impact. Scores are illustrative, client-generated and unverified.</p>
      </div>}
      {notice&&<p role="status" className="iw-notice">{notice}</p>}
    </div>
  </section>;
}
