/** Deterministic browser-local incident model. Illustrative telemetry, never real customer data. */
export type IncidentKind = "pool" | "retries" | "cache" | "cascade" | "deploy";
export type IncidentAction = "rollback" | "throttle" | "scale" | "limit-retries" | "circuit" | "warm-cache";
export interface IncidentState {
  kind: IncidentKind;
  seed: number;
  tick: number;
  capacity: number;
  incoming: number;
  queue: number;
  health: number;
  retries: number;
  cacheHit: number;
  revision: number;
  shed: number;
  breaker: boolean;
  actions: IncidentAction[];
  history: Array<{tick:number; latency:number; errors:number; queue:number}>;
}
export const SCENARIOS: Record<IncidentKind,{title:string;description:string;clue:string}> = {
  pool: {title:"CONNECTION STARVATION",description:"Checkout latency rises after a capacity configuration deployment.",clue:"Traces show database connection acquisition dominating query execution time."},
  retries: {title:"RETRY AMPLIFICATION",description:"A degraded dependency creates a growing retry queue.",clue:"Repeated request IDs appear across retry attempts; fan-out is increasing."},
  cache: {title:"CACHE STAMPEDE",description:"A cache flush sends hot-key traffic directly to the primary datastore.",clue:"Cache hit rate collapses while backend reads spike."},
  cascade: {title:"CASCADING FAILURE",description:"A dependent service saturates and starts dragging the gateway down.",clue:"Dependency timeouts precede gateway saturation; blast radius expands."},
  deploy: {title:"CANARY REGRESSION",description:"An application revision increases per-request CPU work.",clue:"The latest revision has higher service time even at steady incoming RPS."},
};
export function createIncident(kind:IncidentKind="pool", seed=42):IncidentState {
  const init:IncidentState={kind,seed,tick:0,capacity:kind==="pool"?85:kind==="deploy"?105:115,incoming:125,queue:0,health:100,retries:kind==="retries"?1.75:1.08,cacheHit:kind==="cache"?0.15:0.82,revision:1,shed:0,breaker:false,actions:[],history:[]};
  return advanceIncident(init,8);
}
function jitter(seed:number,tick:number) {
  let n=(seed ^ Math.imul(tick+1,2654435761))>>>0;
  n^=n>>>16;n=Math.imul(n,2246822507);n^=n>>>13;
  return ((n>>>0)%1000)/1000;
}
export function advanceIncident(s:IncidentState, ticks=1):IncidentState {
  let state={...s,history:s.history.slice(),actions:s.actions.slice()};
  for(let i=0;i<Math.max(0,Math.min(100,ticks));i++){
    const tick=state.tick+1;
    const volatility=(jitter(state.seed,tick)-0.5)*9;
    const arrivals=state.incoming*(1-state.shed)*state.retries*(1+volatility/120);
    const cachePenalty=state.kind==="cache" ? (1-state.cacheHit)*52 : 0;
    const effectiveCapacity=Math.max(1,(state.capacity-cachePenalty)*(state.breaker ? 1.1:1));
    const queue=Math.min(1200,Math.max(0,state.queue+arrivals-effectiveCapacity));
    const latency=Math.round(90+queue*3.2+arrivals/effectiveCapacity*90+(state.kind==="deploy"&&state.revision===1?140:0));
    const errors=Math.min(99.9,Math.max(0,(queue-150)/35+(state.breaker?6:0)));
    const health=Math.max(0,Math.min(100,100-errors*1.5-queue/30));
    state={...state,tick,queue,health,history:[...state.history,{tick,latency,errors:+errors.toFixed(1),queue:Math.round(queue)}].slice(-50)};
  }
  return state;
}
export function intervene(s:IncidentState, action:IncidentAction):IncidentState {
  const next={...s,actions:[...s.actions,action]};
  switch(action){
    case "rollback":
      if(s.kind==="pool"){next.capacity=210;next.retries=1.08;}
      else if(s.kind==="deploy"){next.capacity=190;next.revision=0;}
      else {next.capacity+=5;}
      break;
    case "throttle": next.shed=Math.min(.8,next.shed+.27); break;
    case "scale": next.capacity+=s.kind==="pool"?8:43; break;
    case "limit-retries": next.retries=1.0; break;
    case "circuit": next.breaker=true;next.retries=1.0;break;
    case "warm-cache": next.cacheHit=Math.min(.95,next.cacheHit+.7);break;
  }
  return advanceIncident(next,3);
}
export function evidenceFor(s:IncidentState) {
  const last=s.history.at(-1)!;
  return [
    "TRACE "+s.kind.toUpperCase()+"-00"+s.seed,
    "gateway.request       "+last.latency+"ms",
    "queue.depth           "+last.queue,
    "dependency.capacity   "+s.capacity.toFixed(0)+" req/tick",
    "retry.multiplier      "+s.retries.toFixed(2),
    "cache.hit_ratio       "+(s.cacheHit*100).toFixed(0)+"%",
    "traffic.shed          "+(s.shed*100).toFixed(0)+"%",
    "error.rate            "+last.errors.toFixed(1)+"%",
    "HINT: "+SCENARIOS[s.kind].clue,
  ].join("\n");
}
