import { useState } from "react";
import { Activity, ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, GitCommit, RotateCcw, ShieldCheck, Terminal, Workflow } from "lucide-react";
import {
  EVIDENCE, INCIDENT_METRICS, REMEDIATIONS, evaluateRemediation,
  type EvidenceKind, type Remediation,
} from "./incidentScenario";
import "./incident-replay.css";

const PHASES=["Detect","Investigate","Remediate","Verify"] as const;
const TRACE_POINTS=INCIDENT_METRICS.map((d,i)=>[45+i*83,190-d.latency/2200*156] as const);
const CHART_PATH=TRACE_POINTS.map(([x,y],i)=>(i?"L":"M")+x.toFixed(1)+" "+y.toFixed(1)).join(" ");
const chartArea=CHART_PATH+" L"+TRACE_POINTS.at(-1)![0]+" 190 L45 190 Z";

export default function IncidentReplay() {
  const [phase,setPhase]=useState<0|1|2|3>(0);
  const [evidence,setEvidence]=useState<EvidenceKind>("traces");
  const [choice,setChoice]=useState<Remediation|null>(null);
  const selected=choice?evaluateRemediation(choice):null;
  const solved=selected?.correct===true;
  const reset=()=>{setPhase(0);setEvidence("traces");setChoice(null);};
  const navigate=(next:number)=>{if(next>=0&&next<=3&&(next!==3||solved))setPhase(next as 0|1|2|3);};
  return <section className="incident-replay" id="incident" aria-labelledby="incident-heading">
    <header className="incident-intro" data-reveal>
      <div><span className="incident-eyebrow"><Activity size={16}/> THE ENGINEERING LAB / SCENARIO 042</span>
        <h2 id="incident-heading">DEBUG THE<br/><em>DISASTER.</em></h2>
      </div>
      <p>Everybody has a dashboard. Pick the right fix when a deployment knocks checkout sideways. Bad instincts are expensive.</p>
    </header>
    <div className="incident-workbench">
      <div className="incident-upper">
        <div className="incident-severity"><span className={phase===3?"incident-status-led resolved":"incident-status-led"}/>
          {phase===3?"RESOLVED / VERIFICATION":"SEV-1 / CHECKOUT ERROR RATE"}
        </div>
        <span className="incident-scenario-label">SIMULATED CASE · NO CUSTOMER DATA</span>
      </div>
      <nav className="incident-phase-tabs" aria-label="Incident investigation stages">
        {PHASES.map((label,i)=><button type="button" key={label} data-step={label.toLowerCase()}
          onClick={()=>navigate(i)} disabled={i===3&&!solved}
          className={phase===i?"active":""} aria-current={phase===i?"step":undefined}>
          <span>{String(i+1).padStart(2,"0")}</span>{label}
          {phase>i&&<CheckCircle2 size={16}/>}
        </button>)}
      </nav>
      <div className="incident-columns">
        <div className="incident-monitor">
          <div className="incident-monitor-heading">
            <span><Activity size={16}/> API / CHECKOUT</span>
            <strong>{phase===3?"p95 RECOVERING":"p95 LATENCY SPIKE"}</strong>
          </div>
          <div className="incident-chart" role="img" aria-label={phase===3
            ?"After rollback, p95 latency falls to 142 milliseconds"
            :"Simulated checkout p95 latency rises from 118 to 2110 milliseconds after deployment"}>
            <div className="incident-chart-head">
              <span>P95 RESPONSE TIME</span><strong>{phase===3?"142":"2,110"} <small>ms</small></strong>
            </div>
            <svg viewBox="0 0 680 220" preserveAspectRatio="none" aria-hidden="true">
              <defs><linearGradient id="incidentFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ff937c" stopOpacity=".32"/><stop offset="100%" stopColor="#ff937c" stopOpacity="0"/>
              </linearGradient></defs>
              {[52,98,144,190].map(y=><line key={y} x1="45" y1={y} x2="634" y2={y} stroke="#58757a" strokeDasharray="4 9" opacity=".55"/>)}
              <line x1="294" y1="18" x2="294" y2="190" stroke="#f7e58c" strokeDasharray="4 5" opacity=".7"/>
              <text x="300" y="27" fill="#e9ecaa" fontSize="12" fontFamily="monospace">DEPLOY</text>
              {phase===3?<path d="M45 48 L128 65 L211 107 L294 144 L377 170 L460 180 L543 182 L626 184"
                stroke="#c7fe9e" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>:
                <>
                  <path d={chartArea} fill="url(#incidentFill)"/>
                  <path d={CHART_PATH} stroke="#ff987e" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="626" cy={TRACE_POINTS.at(-1)![1]} r="7" fill="#ffb09b" stroke="#ffe2d3" strokeWidth="2"/>
                </>}
              <text x="45" y="208" fill="#94adaf" fontSize="12">14:30</text>
              <text x="575" y="208" fill="#94adaf" fontSize="12">14:50</text>
            </svg>
          </div>
          <div className="incident-metrics">
            <div><span>5XX RATE</span><strong className={phase===3?"recovered":""}>{phase===3?"0.3":"24.3"}%</strong></div>
            <div><span>POOL WAIT</span><strong className={phase===3?"recovered":""}>{phase===3?"18":"1,957"} ms</strong></div>
            <div><span>DEPLOY</span><strong>72abf1</strong></div>
          </div>
          <div className="incident-monitor-notes"><span><GitCommit size={16}/> DEPLOY @ 14:31:58</span><span>REQUESTS: 240 IN FLIGHT</span></div>
        </div>
        <div className="incident-investigator">
          {phase===0&&<>
            <div className="incident-panel-tag">01 / DETECTION</div>
            <h3>The alarms are having a perfectly reasonable meltdown.</h3>
            <p>A deployment completed two minutes before latency and 5xx errors increased. Is it the database, the application, or the network?</p>
            <div className="incident-clue"><CircleAlert size={20}/><span>P95 crossed 2 seconds. 24.3% of requests failed. Correlation is a clue, not yet a root cause.</span></div>
            <button className="incident-primary" type="button" onClick={()=>navigate(1)}>OPEN THE EVIDENCE <ArrowRight size={19}/></button>
          </>}
          {phase===1&&<>
            <div className="incident-panel-tag">02 / ROOT CAUSE ANALYSIS</div>
            <h3>Follow the evidence, not your gut.</h3>
            <div className="incident-evidence-tabs" role="tablist" aria-label="Evidence sources">
              {(Object.keys(EVIDENCE) as EvidenceKind[]).map(kind=><button type="button"
                key={kind} role="tab" aria-selected={evidence===kind}
                onClick={()=>setEvidence(kind)}>{EVIDENCE[kind].label}</button>)}
            </div>
            <div className="incident-evidence" role="tabpanel">
              <strong>{EVIDENCE[evidence].heading}</strong>
              <div className="incident-log">{EVIDENCE[evidence].lines.map((line,i)=><div key={i}>{line}</div>)}</div>
              <p>{EVIDENCE[evidence].insight}</p>
            </div>
            <button className="incident-primary" type="button" onClick={()=>navigate(2)}>CHOOSE A REMEDIATION <ArrowRight size={19}/></button>
          </>}
          {phase===2&&<>
            <div className="incident-panel-tag">03 / DECISION UNDER PRESSURE</div>
            <h3>Pick the fix. Production gets one vote.</h3>
            <p>Three plausible actions. Only one directly reverses the regression and limits further risk.</p>
            <div className="incident-remedies">
              {REMEDIATIONS.map(option=><button type="button" key={option.id}
                onClick={()=>setChoice(option.id)} aria-pressed={choice===option.id}
                className={choice===option.id?"selected":""}>
                <span><strong>{option.title}</strong><small>{option.caption}</small></span>
                <span aria-hidden="true">{choice===option.id?"◉":"○"}</span>
              </button>)}
            </div>
            {selected&&<div className={"incident-verdict"+(solved?" correct":"")} role="status">
              {solved?<CheckCircle2 size={19}/>:<CircleAlert size={19}/>}
              <span>{selected.consequence}</span>
            </div>}
            {solved&&<button className="incident-primary" type="button" onClick={()=>navigate(3)}>VERIFY RECOVERY <ArrowRight size={19}/></button>}
          </>}
          {phase===3&&<>
            <div className="incident-panel-tag">04 / VERIFICATION & FOLLOW-UP</div>
            <h3>Rolled back. Still not time to celebrate.</h3>
            <div className="incident-recovery"><ShieldCheck size={38}/>
              <div><strong>p95: 2,110ms → 142ms</strong><span>5xx error rate: 24.3% → 0.3%</span></div>
            </div>
            <p>The rollback restores the previous pool configuration. Next: cap retry fan-out, tune connection limits against measured concurrency, and add a canary gate for p95 and 5xx.</p>
            <div className="incident-clue"><Workflow size={18}/><span>Production reliability is not one magic AI-generated fix. It's evidence, rollback, verification, and keeping the next deploy boring.</span></div>
            <button className="incident-primary" type="button" onClick={reset}>RUN ANOTHER INVESTIGATION <RotateCcw size={18}/></button>
          </>}
          <div className="incident-progress-nav">
            <button type="button" disabled={phase===0} onClick={()=>navigate(phase-1)}><ArrowLeft size={15}/> PREVIOUS</button>
            <span>{String(phase+1).padStart(2,"0")} / 04</span>
            <span><Terminal size={15}/> SIMULATION ONLY</span>
          </div>
        </div>
      </div>
    </div>
    <footer className="incident-foot">
      <span>OBSERVE → CORRELATE → REMEDIATE → VERIFY.</span>
      <span>AN EXPLORABLE FAILURE, NOT A POWERPOINT ABOUT ONE.</span>
    </footer>
  </section>;
}
