import { useMemo, useState } from 'react';
import { featuredProjects } from '../atelier/content';
import ConsistencyExperiment from '../exhibition/ConsistencyExperiment';
import {
  BASE_CAPACITY, BASE_RESILIENCE, estimateCapacity, simulateResilience,
  type CapacityInput, type ResilienceInput, type RetryPolicy,
} from './systemsModel';
import './systems-gallery.css';
const SHOWCASE_IDS=['blackout','farmpulse','stylescape','timesheet'] as const;
const CHOICES=['CAPACITY','RESILIENCE','CONSISTENCY','SOURCE CASES'] as const;
function Slider({id,label,value,min,max,step=1,onChange,unit=''}:{id:string;label:string;value:number;min:number;max:number;step?:number;unit?:string;onChange:(v:number)=>void}){
  return <div className="sg-slider"><label htmlFor={id}>{label}</label><input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/><strong>{value}{unit}</strong></div>;
}
function MiniPlot({values,color,label}:{values:number[];color:string;label:string}){
  const top=Math.max(1,...values);
  const pts=values.map((v,i)=>`${Math.round(i*590/Math.max(1,values.length-1))},${Math.round(145-v/top*126)}`).join(' ');
  return <svg viewBox="0 0 590 164" width="100%" role="img" aria-label={label}>
    {[20,60,100,140].map(y=><line key={y} x1="0" x2="590" y1={y} y2={y} stroke="#c2c9d2" strokeDasharray="4 7" strokeOpacity=".2"/>)}
    <polyline points={pts} stroke={color} strokeWidth="3" fill="none" strokeLinejoin="round"/>
    <text x="5" y="157" fill="#b0bece" fontSize="12">T+0</text><text x="580" y="157" fill="#b0bece" fontSize="12" textAnchor="end">T+60</text>
  </svg>;
}
function CapacityLab(){
  const [value,setValue]=useState<CapacityInput>(BASE_CAPACITY);
  const set=(key:keyof CapacityInput,v:CapacityInput[typeof key])=>setValue(state=>({...state,[key]:v}));
  const result=useMemo(()=>estimateCapacity(value),[value]);
  return <div className="sg-workbench">
    <div className="sg-console"><div className="sg-kicker">MODEL 001 / SCALE ARCHITECT</div><h2>WHERE DOES THE SYSTEM BEND?</h2><p>Control ingress traffic, the edge cache, application capacity, and the downstream database. Then remove a region.</p>
      <Slider id="sg-rps" label="INGRESS REQUESTS / SEC" value={value.rps} min={100} max={10000} step={100} onChange={v=>set('rps',v)}/>
      <Slider id="sg-hit" label="EDGE CACHE HIT RATE" value={value.edgeHit} min={0} max={95} onChange={v=>set('edgeHit',v)} unit="%"/>
      <Slider id="sg-replicas" label="REPLICAS PER REGION" value={value.replicasPerRegion} min={1} max={30} onChange={v=>set('replicasPerRegion',v)}/>
      <Slider id="sg-per" label="CAPACITY / REPLICA" value={value.appPerReplica} min={60} max={600} step={20} onChange={v=>set('appPerReplica',v)}/>
      <Slider id="sg-db" label="DATABASE READ CAPACITY" value={value.dbReadCapacity} min={100} max={6000} step={100} onChange={v=>set('dbReadCapacity',v)}/>
      <div className="sg-split-input"><label htmlFor="sg-region">ACTIVE/CONFIGURED REGIONS</label><select id="sg-region" value={value.regionCount} onChange={e=>set('regionCount',Number(e.target.value) as 1|2|3)}><option value={1}>1 region</option><option value={2}>2 regions</option><option value={3}>3 regions</option></select>
        <label className="sg-toggle"><input type="checkbox" checked={value.failRegion} onChange={e=>set('failRegion',e.target.checked)}/> SIMULATE REGION FAILURE</label></div>
      <button type="button" className="sg-reset" onClick={()=>setValue(BASE_CAPACITY)}>RESET MODEL ↺</button>
    </div>
    <div className="sg-output"><div className="sg-kicker">LIVE MODEL ESTIMATE / NO REAL CLOUD CHARGES</div>
      <div className="sg-stats">{[
        ['MODELED AVAILABILITY',result.availabilityPct+'%'],['REJECTED REQUESTS',Math.round(result.rejectedRps).toLocaleString()+' / s'],
        ['SIMULATED P95',result.estimatedP95Ms.toLocaleString()+' ms'],['HYPOTHETICAL MONTHLY COST','$'+result.estimatedMonthlyUsd.toLocaleString()],
      ].map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div>
      <h3>{result.bottleneck==='none'?'NO CAPACITY BOTTLENECK.':'BOTTLENECK / '+result.bottleneck.toUpperCase()}</h3>
      <div className="sg-flow">
        {[['EDGE',result.demandRps],['CACHE MISS',result.appRps],['APP CAP',result.appCapacityRps],['DB READS',result.dbRps],['DB CAP',result.dbCapacityRps]].map(([label,amount])=><div key={label as string}><span>{label}</span><i><b style={{width:Math.min(100,Number(amount)/Math.max(1,result.demandRps)*100)+'%'}}/></i><strong>{Math.round(Number(amount)).toLocaleString()}</strong></div>)}
      </div>
      <div className="sg-findings" role="status"><strong>ARCHITECTURE NOTES</strong>{result.warnings.length?result.warnings.map((s,i)=><p key={i}>◉ {s}</p>):<p>All modeled processing tiers have enough absolute throughput. Try losing a region or reducing the cache hit rate.</p>}</div>
      <p className="sg-model-disclaimer">Simplified steady-state estimate only. The pricing assumptions are hypothetical, not AWS/GCP/Azure quotes. The latency formula is illustrative, not a measured SLO or queueing benchmark. A region failure assumes independent app capacity but one shared database ceiling.</p>
    </div>
  </div>;
}
function ResilienceLab(){
  const [value,setValue]=useState<ResilienceInput>(BASE_RESILIENCE);
  const set=(key:keyof ResilienceInput,v:ResilienceInput[typeof key])=>setValue(s=>({...s,[key]:v}));
  const result=useMemo(()=>simulateResilience(value),[value]);
  const fixed=useMemo(()=>simulateResilience({...value,retryPolicy:'fixed'}),[value]);
  const none=useMemo(()=>simulateResilience({...value,retryPolicy:'none'}),[value]);
  return <div className="sg-workbench"><div className="sg-console"><div className="sg-kicker">MODEL 002 / RETRY STORM</div><h2>YOUR RETRY IS SOMEONE ELSE'S LOAD.</h2><p>Simulate a 60-tick incident with a sudden burst, a constrained dependency, and explicit retry policy.</p>
    <Slider id="sg-baseload" label="BASE REQUESTS / TICK" min={50} max={1500} step={50} value={value.baseRps} onChange={v=>set('baseRps',v)}/>
    <Slider id="sg-dependency" label="DEPENDENCY CAPACITY" min={100} max={1400} step={50} value={value.dependencyCapacity} onChange={v=>set('dependencyCapacity',v)}/>
    <Slider id="sg-failure" label="DEPENDENCY ERROR BASELINE" min={0} max={50} value={value.failureRate} onChange={v=>set('failureRate',v)} unit="%"/>
    <Slider id="sg-concurrency" label="CONCURRENCY CEILING" min={100} max={2000} step={50} value={value.concurrencyLimit} onChange={v=>set('concurrencyLimit',v)}/>
    <div className="sg-split-input"><label htmlFor="sg-policy">RETRY STRATEGY</label><select id="sg-policy" value={value.retryPolicy} onChange={e=>set('retryPolicy',e.target.value as RetryPolicy)}><option value="none">None</option><option value="fixed">Fixed / aggressive</option><option value="exponential">Backoff / bounded</option></select>
    <label className="sg-toggle"><input type="checkbox" checked={value.circuitBreaker} onChange={e=>set('circuitBreaker',e.target.checked)}/> ENABLE CIRCUIT BREAKER</label></div>
    <button type="button" className="sg-reset" onClick={()=>setValue(BASE_RESILIENCE)}>RESET MODEL ↺</button>
    </div><div className="sg-output"><div className="sg-kicker">SIXTY TICKS / DETERMINISTIC MODEL</div>
    <div className="sg-stats">{[
      ['COMPLETED / OFFERED',result.completionPct+'%'],['PEAK QUEUE',result.peakQueue.toLocaleString()],
      ['ATTEMPT AMPLIFICATION',result.retryAmplification+'×'],['BREAKER OPEN EVENTS',String(result.breakerTrips)],
    ].map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div>
    <h3>QUEUE DEPTH / BURST FROM T+15 TO T+32</h3><MiniPlot label="Sixty-tick deterministic queue depth" color="#f0aa8c" values={result.ticks.map(t=>t.queue)}/>
    <div className="sg-comparisons"><strong>POLICY COMPARISON / SAME INPUT CONDITIONS</strong><div><span>NO RETRIES</span><b>{none.peakQueue.toLocaleString()} PEAK QUEUE</b></div><div><span>AGGRESSIVE FIXED</span><b>{fixed.peakQueue.toLocaleString()} PEAK QUEUE</b></div><div><span>YOUR POLICY</span><b>{result.peakQueue.toLocaleString()} PEAK QUEUE</b></div></div>
    <p className="sg-model-disclaimer">Abstract work-per-tick model: no actual service, traffic capture, probability measurement, or reliability guarantee. A circuit breaker may reduce infrastructure load while increasing immediate rejections; inspect throughput and failure counts together.</p>
    </div></div>;
}
const projectTradeoffs:Record<string,string>={
  blackout:'Authoritative state prevents client score tampering, but requires room lifecycle management, reconnect logic, and server capacity.',
  farmpulse:'TimescaleDB suits time-series ingestion, but retention, hypertable layout, and write amplification must be profiled at real scale.',
  stylescape:'A pure SVG render pipeline is exportable and deterministic, but complex layered scenes can become DOM-heavy.',
  timesheet:'Independent services separate HRMS responsibilities, but integration contracts and database change management add operational complexity.',
};
function Cases(){
  return <div className="sg-cases"><div className="sg-case-intro"><div className="sg-kicker">THE CODE IS THE RECEIPT</div><h2>ARCHITECTURE WITH EVIDENCE.</h2><p>These are documented public repositories, not invented benchmark case studies. The design decisions below are drawn from the existing portfolio descriptions; tradeoffs are architectural analysis, not claims of measured production results.</p></div>
    <div className="sg-case-grid">{featuredProjects.filter(p=>SHOWCASE_IDS.some(id=>p.id===id)).map(project=><article key={project.id} className="sg-case"><div className="sg-case-top"><span>{project.label}</span><span>{project.status??'PUBLIC SOURCE'}</span></div><h3>{project.name}</h3><p>{project.description}</p><div><strong>IMPLEMENTATION EVIDENCE</strong><p>{project.implementation}</p></div><div><strong>ENGINEERING TRADEOFF</strong><p>{projectTradeoffs[project.id]}</p></div><div className="sg-case-tags">{project.stack.map(t=><span key={t}>{t}</span>)}</div><a href={project.repository} target="_blank" rel="noopener noreferrer">INSPECT SOURCE CODE ↗</a></article>)}</div>
    <p className="sg-model-disclaimer">Any organizational contributions not independently verifiable from these public repositories are deliberately excluded. No fabricated uptime, throughput, cost savings, or ownership attribution.</p>
  </div>;
}
export default function SystemsGallery(){
  const [tab,setTab]=useState<typeof CHOICES[number]>('CAPACITY');
  return <div className="sg"><div className="sg-menu" role="group" aria-label="Engineering demonstrations">{CHOICES.map(choice=><button type="button" key={choice} onClick={()=>setTab(choice)} aria-pressed={tab===choice}>{choice}</button>)}</div>
    {tab==='CAPACITY'?<CapacityLab/>:tab==='RESILIENCE'?<ResilienceLab/>:tab==='CONSISTENCY'?<div className="sg-consistency"><ConsistencyExperiment/></div>:<Cases/>}
  </div>;
}
