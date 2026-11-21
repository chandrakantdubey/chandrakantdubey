/**
 * INCIDENT ZERO — a deterministic, bounded, browser-local reliability simulation.
 *
 * Units are abstract requests per simulation tick, NOT production benchmarks.
 * Metrics, spans, logs, and reports derive from the same mutable-by-copy state.
 * This models saturation and intervention trade-offs, not Kubernetes/Postgres internals.
 */
export const INCIDENT_ENGINE_VERSION="2.0.0";
export type IncidentKind="pool"|"retries"|"cache"|"cascade"|"deploy";
export type IncidentAction="rollback"|"throttle"|"restore-traffic"|"scale"|"limit-retries"|"circuit"|"close-circuit"|"warm-cache";
export type IncidentCommand={type:"advance";ticks:number}|{type:"action";action:IncidentAction};

export interface IncidentMetric {
  tick:number;
  incoming:number;admitted:number;retryLoad:number;processed:number;
  rejected:number;queue:number;latency:number;errors:number;
  availability:number;utilization:number;capacity:number;cacheHit:number;
}
export interface IncidentState {
  kind:IncidentKind;seed:number;tick:number;
  appCapacity:number;dependencyCapacity:number;incoming:number;
  queue:number;health:number;retries:number;cacheHit:number;
  revision:number;shed:number;breaker:boolean;replicas:number;
  actions:IncidentAction[];commands:IncidentCommand[];
  history:IncidentMetric[];totalFailed:number;totalRejected:number;
  totalProcessed:number;estimatedCostUnits:number;
}
export interface ScenarioDefinition {
  title:string;description:string;clue:string;rootCause:string;
  firstResponse:string;service:string;change:string;
}
export const SCENARIOS:Record<IncidentKind,ScenarioDefinition>={
  pool:{
    title:"CONNECTION STARVATION",description:"A rollout reduces the connection pool while checkout concurrency remains high.",
    clue:"Database acquisition time dominates the request trace; query execution is short.",
    rootCause:"A deploy reduced available connection capacity without bounding concurrent checkout work.",
    firstResponse:"Rollback pool configuration; then bound retries and measure saturation.",
    service:"ORDERS / DATABASE",change:"DB_POOL_MAX 100 → 20; CHECKOUT_CONCURRENCY 80 → 240",
  },
  retries:{
    title:"RETRY AMPLIFICATION",description:"An overloaded downstream dependency receives duplicate work faster than it can recover.",
    clue:"The same logical request generates repeat attempts; retry work exceeds original demand.",
    rootCause:"Unbounded retry amplification saturates a dependency with capacity for normal traffic.",
    firstResponse:"Cap retries, verify queue drain, and budget future retry attempts.",
    service:"GATEWAY / PAYMENTS",change:"MAX_RETRIES 1 → 5; RETRY_BACKOFF jittered → fixed 50ms",
  },
  cache:{
    title:"CACHE STAMPEDE",description:"A mass cache invalidation directs repeated hot-key reads to the primary datastore.",
    clue:"Cache-hit ratio fell sharply before database queue depth climbed.",
    rootCause:"An invalidation event removed protection for a hot read path.",
    firstResponse:"Warm the hot cache while protecting the database; add single-flight loading.",
    service:"CACHE / DATABASE",change:"CACHE_INVALIDATE all; HOT_KEY_CACHE_HIT 91% → 4%",
  },
  cascade:{
    title:"CASCADING FAILURE",description:"A nonessential recommendation dependency saturates the request path.",
    clue:"Requests block on a secondary dependency despite the core checkout path being healthy.",
    rootCause:"A synchronous optional dependency was allowed to consume critical-path capacity.",
    firstResponse:"Open the dependency circuit; serve core requests without recommendations.",
    service:"CHECKOUT / RECOMMENDER",change:"FEATURE_RECOMMENDATIONS best-effort → blocking",
  },
  deploy:{
    title:"CANARY REGRESSION",description:"A new release increases request CPU cost and sharply reduces API throughput.",
    clue:"The new revision has higher request service time at unchanged baseline traffic.",
    rootCause:"The latest application revision introduced expensive synchronous CPU work.",
    firstResponse:"Rollback the regression, compare profiles, and introduce a canary latency gate.",
    service:"GATEWAY / CHECKOUT",change:"REVISION stable → canary; CPU_SERVICE_COST +140%",
  },
};
const ACTIONS:IncidentAction[]=[
  "rollback","throttle","restore-traffic","scale",
  "limit-retries","circuit","close-circuit","warm-cache",
];
const BASE:Record<IncidentKind,{app:number;dependency:number;retry:number;hit:number}>={
  pool:{app:230,dependency:92,retry:1.13,hit:0},
  retries:{app:235,dependency:170,retry:1.85,hit:0},
  cache:{app:230,dependency:90,retry:1.04,hit:.04},
  cascade:{app:220,dependency:96,retry:1.24,hit:0},
  deploy:{app:88,dependency:230,retry:1.05,hit:0},
};
function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n))}
function jitter(seed:number,tick:number){
  let n=(seed ^ Math.imul(tick+1,0x9e3779b1))>>>0;
  n^=n>>>16;n=Math.imul(n,0x85ebca6b);n^=n>>>13;
  return ((n>>>0)%2001-1000)/1000;
}
function simulate(s:IncidentState,ticks:number):IncidentState {
  const next:IncidentState={...s,history:s.history.slice(),actions:s.actions.slice(),commands:s.commands.slice()};
  for(let i=0;i<ticks;i++){
    const tick=next.tick+1;
    const incoming=next.incoming*(1+jitter(next.seed,tick)*.035);
    const admitted=incoming*(1-next.shed);
    const retryLoad=admitted*Math.max(0,next.retries-1);
    const demand=admitted+retryLoad;
    // Cache hits bypass the dependency but not the application. A circuit
    // bypasses only an optional dependency in the cascade scenario.
    const backendFraction=next.kind==="cache"?1-next.cacheHit:
      next.kind==="cascade"&&next.breaker?.4:1;
    const dependencyCeiling=next.dependencyCapacity/Math.max(.05,backendFraction);
    const capacity=Math.max(1,Math.min(next.appCapacity,dependencyCeiling));
    const work=next.queue+demand;
    const processed=Math.min(work,capacity);
    const overflow=Math.max(0,work-capacity-1200);
    next.queue=clamp(work-processed,0,1200);
    // Rejected load is tracked separately from server-side 5xx failures:
    // shedding 70% of traffic is not a successful "recovery".
    const rejected=incoming*next.shed;
    const errors=clamp(Math.max(0,next.queue-70)/23+overflow/Math.max(1,incoming)*100,0,90);
    const latency=Math.round(85+next.queue*2.3+(demand/capacity)*62+
      (next.kind==="deploy"&&next.revision===1?115:0));
    const availability=clamp(100-errors-(rejected/incoming)*100,0,100);
    const utilization=clamp(100*demand/capacity,0,300);
    const point:IncidentMetric={
      tick,incoming:Math.round(incoming),admitted:Math.round(admitted),
      retryLoad:Math.round(retryLoad),processed:Math.round(processed),
      rejected:Math.round(rejected),queue:Math.round(next.queue),latency,
      errors:+errors.toFixed(1),availability:+availability.toFixed(1),
      utilization:+utilization.toFixed(1),capacity:Math.round(capacity),
      cacheHit:+next.cacheHit.toFixed(3),
    };
    next.totalFailed+=incoming*errors/100;
    next.totalRejected+=rejected;
    next.totalProcessed+=processed;
    next.history.push(point);
    if(next.history.length>100)next.history.shift();
    next.tick=tick;
    next.health=clamp(100-errors*1.4-next.queue/28,0,100);
  }
  return next;
}
export function createIncident(kind:IncidentKind="pool",seed=42):IncidentState {
  if(!Object.hasOwn(SCENARIOS,kind))throw Error("Unknown incident kind");
  if(!Number.isSafeInteger(seed)||seed<0||seed>2147483647)throw Error("Invalid seed");
  const base=BASE[kind];
  const state:IncidentState={
    kind,seed,tick:0,appCapacity:base.app,dependencyCapacity:base.dependency,
    incoming:140,queue:0,health:100,retries:base.retry,cacheHit:base.hit,
    revision:1,shed:0,breaker:false,replicas:4,
    actions:[],commands:[],history:[],
    totalFailed:0,totalRejected:0,totalProcessed:0,estimatedCostUnits:0,
  };
  // The opening evidence is consistent with 8 ticks of unmitigated impact.
  return simulate(state,8);
}
export function advanceIncident(state:IncidentState,ticks=1):IncidentState {
  const safe=clamp(Math.floor(ticks),0,100);
  if(!Number.isFinite(ticks)||!safe||state.commands.length>=80)return state;
  const next=simulate(state,safe);
  next.commands.push({type:"advance",ticks:safe});
  return next;
}
export function intervene(state:IncidentState,action:IncidentAction):IncidentState {
  if(!ACTIONS.includes(action)||state.commands.length>=80)return state;
  const next:IncidentState={...state,actions:[...state.actions,action]};
  switch(action){
    case "rollback":
      if(state.kind==="pool"){next.dependencyCapacity=225;next.retries=Math.min(next.retries,1.04);next.revision=0;}
      if(state.kind==="deploy"){next.appCapacity=215;next.revision=0;}
      break;
    case "throttle":next.shed=clamp(next.shed+.18,0,.72);break;
    case "restore-traffic":next.shed=clamp(next.shed-.18,0,.72);break;
    case "scale":
      next.appCapacity=Math.min(480,next.appCapacity+42);
      next.replicas=Math.min(20,next.replicas+2);
      next.estimatedCostUnits+=2;
      if(state.kind==="pool")next.dependencyCapacity=Math.max(70,next.dependencyCapacity-4);
      break;
    case "limit-retries":next.retries=1;break;
    case "circuit":next.breaker=true;next.retries=Math.min(next.retries,1.02);break;
    case "close-circuit":next.breaker=false;break;
    case "warm-cache":next.cacheHit=clamp(next.cacheHit+.78,0,.94);break;
  }
  const advanced=simulate(next,3);
  advanced.commands.push({type:"action",action});
  return advanced;
}
export function isRecovered(s:IncidentState):boolean {
  const last=s.history.slice(-4);
  return last.length===4&&last.every(p=>
    p.queue<35&&p.latency<300&&p.errors<1&&p.availability>=99&&p.rejected<2);
}
export function assessment(s:IncidentState){
  const recent=s.history.slice(-5);
  const average=(key:keyof IncidentMetric)=>recent.reduce((n,p)=>n+Number(p[key]),0)/Math.max(1,recent.length);
  const score=clamp(Math.round(100-Math.min(50,s.totalFailed/40)-Math.min(25,s.totalRejected/90)
    -Math.min(15,s.estimatedCostUnits*2)-Math.min(10,Math.max(0,s.actions.length-3)*2)),0,100);
  return {
    recovered:isRecovered(s),score,
    meanLatency:Math.round(average("latency")),
    meanAvailability:+average("availability").toFixed(1),
    userImpact:Math.round(s.totalFailed+s.totalRejected),
    costUnits:s.estimatedCostUnits,
    actionCount:s.actions.length,
    tradeoffs:s.shed>0?"Some traffic is still being rejected. Restore traffic before declaring recovery.":
      s.breaker&&s.kind==="cascade"?"Optional recommendations remain degraded by circuit breaking.":
      "No active load shedding. Continue monitoring for regression.",
  };
}
export function evidenceFor(s:IncidentState,atTick=s.tick):string {
  const point=s.history.find(p=>p.tick===atTick)??s.history.at(-1);
  if(!point)return "No evidence";
  return [
    "TRACE / "+s.kind.toUpperCase()+"-"+s.seed.toString(16).padStart(4,"0")+" / T+"+point.tick,
    "gateway.request        "+point.latency+" ms",
    "request.admitted       "+point.admitted+" req/tick",
    "request.retry_work     "+point.retryLoad+" req/tick",
    "queue.waiting          "+point.queue+" req",
    "dependency.capacity    "+point.capacity+" req/tick",
    "cache.hit_ratio        "+(point.cacheHit*100).toFixed(1)+"%",
    "server.error_rate      "+point.errors.toFixed(1)+"%",
    "request.availability   "+point.availability.toFixed(1)+"%",
    "NOTE: "+SCENARIOS[s.kind].clue,
  ].join("\n");
}
export type IncidentEvidenceTab="traces"|"logs"|"changes";
export function evidencePanel(s:IncidentState,tab:IncidentEvidenceTab,tick=s.tick):string {
  const p=s.history.find(point=>point.tick===tick)??s.history.at(-1);
  if(!p)return "NO DATA";
  if(tab==="traces")return evidenceFor(s,p.tick);
  if(tab==="changes")return [
    "CHANGE HISTORY  /  SIMULATED",
    "14:31:58  deploy revision=1",
    "config.diff  "+SCENARIOS[s.kind].change,
    ...s.commands.filter(c=>c.type==="action").map((c,i)=>"operation."+String(i+1).padStart(2,"0")+"  "+(c as {type:"action";action:IncidentAction}).action),
    "CURRENT_REVISION  "+s.revision,
    "SCENARIO: "+SCENARIOS[s.kind].title,
  ].join("\n");
  const level=p.errors>10?"ERROR":p.queue>80?"WARN":"INFO";
  return [
    "SIMULATED LOGS   /  T+"+p.tick,
    "["+level+"] incoming="+p.incoming+" admitted="+p.admitted+" rejected="+p.rejected,
    "["+level+"] queue.depth="+p.queue+" utilization="+p.utilization+"%",
    "[TRACE] gateway latency="+p.latency+"ms server_error="+p.errors+"%",
    "[TRACE] dependency="+SCENARIOS[s.kind].service,
    "[INFO] cache.hit="+(p.cacheHit*100).toFixed(1)+"% retries="+p.retryLoad+" req/tick",
    "[NOTE] All records are generated from the model; no customer data.",
  ].join("\n");
}
export interface IncidentReplay {
  version:typeof INCIDENT_ENGINE_VERSION;kind:IncidentKind;seed:number;commands:IncidentCommand[];
}
export function replayIncident(record:IncidentReplay):IncidentState {
  if(!record||record.version!==INCIDENT_ENGINE_VERSION||!Object.hasOwn(SCENARIOS,record.kind)
    ||!Number.isSafeInteger(record.seed)||record.seed<0||record.seed>2147483647
    ||!Array.isArray(record.commands)||record.commands.length>80)throw Error("Unsupported incident replay");
  let state=createIncident(record.kind,record.seed);
  for(const command of record.commands){
    if(!command||typeof command!=="object")throw Error("Malformed incident command");
    if(command.type==="advance"&&Number.isSafeInteger(command.ticks)&&command.ticks>=1&&command.ticks<=100)
      state=advanceIncident(state,command.ticks);
    else if(command.type==="action"&&ACTIONS.includes(command.action))
      state=intervene(state,command.action);
    else throw Error("Invalid incident command");
  }
  return state;
}
export function encodeIncidentReplay(s:IncidentState):string {
  const record:IncidentReplay={version:INCIDENT_ENGINE_VERSION,kind:s.kind,seed:s.seed,commands:s.commands};
  return btoa(JSON.stringify(record)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
}
export function decodeIncidentReplay(token:string):IncidentState {
  if(typeof token!=="string"||token.length>7000||!/^[A-Za-z0-9_-]+$/.test(token))
    throw Error("Invalid incident replay token");
  const base64=token.replace(/-/g,"+").replace(/_/g,"/");
  const decoded=JSON.parse(atob(base64)) as IncidentReplay;
  return replayIncident(decoded);
}
