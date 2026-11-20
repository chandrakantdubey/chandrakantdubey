import { useState } from "react";
import { ArrowRight, RotateCcw, GitMerge, GitBranch, ShieldCheck } from "lucide-react";
import { CAS_START_VERSION,simulateCasRace,type Racer } from "./consistencyRace";
import "./consistency-experiment.css";

export default function ConsistencyExperiment() {
  const [winner,setWinner]=useState<Racer>("ingress");
  const [step,setStep]=useState<0|1|2>(0);
  const outcome=simulateCasRace(winner);
  const select=(value:Racer)=>{setWinner(value);setStep(0);};
  return <section id="consistency" className="consistency-experiment" aria-labelledby="consistency-heading">
    <div className="consistency-head">
      <div>
        <span className="consistency-eyebrow"><GitMerge size={16}/> RECOVERED EXPERIMENT / 001</span>
        <h2 id="consistency-heading">TWO WRITERS.<br/><em>ONE VERSION.</em></h2>
      </div>
      <p>The short version of optimistic concurrency: both operators can be right, and one write can still be stale.</p>
    </div>
    <div className="consistency-shell">
      <div className="consistency-intro">
        <span>SIMULATED / NO LIVE ROOM</span>
        <span>BASE VERSION: v{CAS_START_VERSION}</span>
      </div>
      <div className="consistency-scenario">
        <div className="consistency-controls">
          <h3>Who wins the first write?</h3>
          <p>Two operators read the same snapshot. Both try to rotate an independent router. The storage layer permits only one conditional write per version.</p>
          <div className="consistency-choice" role="group" aria-label="First successful writer">
            {(["ingress","egress"] as const).map(value=><button key={value} type="button"
              aria-pressed={winner===value} onClick={()=>select(value)}>
              <GitBranch size={17}/>{value.toUpperCase()} FIRST
            </button>)}
          </div>
          <button className="consistency-run" type="button" onClick={()=>setStep(s=>s===0?1:s===1?2:0)}>
            {step===0?"RACE THE WRITES":step===1?"REBASE AND RETRY":"RESET EXPERIMENT"}
            {step===2?<RotateCcw size={18}/>:<ArrowRight size={18}/>}
          </button>
        </div>
        <div className="consistency-trace" role="status" aria-live="polite" aria-atomic="true">
          <div className="consistency-version">
            <span>ROOM REVISION</span>
            <strong>v{step===0?outcome.startVersion:step===1?outcome.winnerVersion:outcome.finalVersion}</strong>
            <span className={step===1?"consistency-conflict":step===2?"consistency-recovered":""}>
              {step===0?"TWO PENDING COMMANDS":step===1?"ONE STALE WRITE":"BOTH ACTIONS COMMITTED"}
            </span>
          </div>
          <div className="consistency-event-stream">
            {outcome.orderedEvents.slice(0,step===0?1:step===1?3:5).map((event,i)=><div key={i} className="consistency-event">
              <span>{String(i+1).padStart(2,"0")}</span><p>{event}</p>
            </div>)}
          </div>
          {step===1&&<div className="consistency-verdict negative">409 / EXPECTED v{outcome.losingExpected} · ACTUAL v{outcome.conflictActual}</div>}
          {step===2&&<div className="consistency-verdict positive"><ShieldCheck size={17}/> RECOVERED / v{outcome.finalVersion}</div>}
        </div>
      </div>
      <footer className="consistency-foot">
        <span>This is a CAS teaching model, not a recording from a production match. Real rooms also require command idempotency, validation and authenticated player ownership.</span>
        <a href="https://github.com/chandrakantdubey/chandrakantdubey/blob/main/api/packet.ts"
          target="_blank" rel="noopener noreferrer">INSPECT ROOM IMPLEMENTATION <ArrowRight size={15}/></a>
      </footer>
    </div>
  </section>;
}
