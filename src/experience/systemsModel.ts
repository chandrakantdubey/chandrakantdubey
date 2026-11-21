/**
 * Explainable capacity and resilience estimators. Units are intentionally
 * hypothetical, prices are illustrative USD/month, not cloud-provider quotes.
 */
export interface CapacityInput {
  rps:number;edgeHit:number;replicasPerRegion:number;regionCount:1|2|3;
  appPerReplica:number;dbReadCapacity:number;dbReadFraction:number;
  failRegion:boolean;
}
export interface CapacityResult {
  demandRps:number;edgeOffloadRps:number;appRps:number;appCapacityRps:number;
  dbRps:number;dbCapacityRps:number;servedRps:number;rejectedRps:number;
  estimatedP95Ms:number;estimatedMonthlyUsd:number;capacityPressure:number;
  dbPressure:number;availableRegions:number;availabilityPct:number;
  bottleneck:'edge'|'application'|'database'|'none';
  warnings:string[];
}
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const finite=(v:number)=>Number.isFinite(v)?v:0;
export const BASE_CAPACITY:CapacityInput={
  rps:1800,edgeHit:55,replicasPerRegion:6,regionCount:2,
  appPerReplica:240,dbReadCapacity:700,dbReadFraction:.72,failRegion:false,
};
export function estimateCapacity(input:CapacityInput):CapacityResult{
  const rps=clamp(finite(input.rps),0,100000);
  const edgeHit=clamp(finite(input.edgeHit),0,99)/100;
  const regions=clamp(Math.floor(finite(input.regionCount)),1,3);
  const replicas=clamp(Math.floor(finite(input.replicasPerRegion)),1,100);
  const perReplica=clamp(finite(input.appPerReplica),1,3000);
  const availableRegions=input.failRegion?Math.max(0,regions-1):regions;
  const appCapacityRps=availableRegions*replicas*perReplica;
  const edgeOffloadRps=rps*edgeHit;
  const appRps=rps-edgeOffloadRps;
  const appAdmitted=Math.min(appRps,appCapacityRps);
  const dbReadFraction=clamp(finite(input.dbReadFraction),0,1);
  const dbRps=appAdmitted*dbReadFraction;
  const dbCapacityRps=clamp(finite(input.dbReadCapacity),1,100000);
  const appServed=dbReadFraction===0?appAdmitted:Math.min(appAdmitted,dbCapacityRps/dbReadFraction);
  const servedRps=edgeOffloadRps+appServed;
  const rejectedRps=Math.max(0,rps-servedRps);
  const capacityPressure=appCapacityRps>0?appRps/appCapacityRps*100:999;
  const dbPressure=dbRps/dbCapacityRps*100;
  const appUtil=clamp(appRps/Math.max(1,appCapacityRps),0,1.2);
  const dbUtil=clamp(dbRps/Math.max(1,dbCapacityRps),0,1.2);
  // Queueing-inspired curve, with bounded near-saturation penalty.
  const estimatedP95Ms=Math.round(42+90/(1-clamp(appUtil,.01,.97))+.6*115/(1-clamp(dbUtil,.01,.97)));
  // Hypothetical unit costs: VM/replica $38, regional base $90, managed DB $180,
  // edge requests $0.015 per million, plus traffic estimates.
  const estimatedMonthlyUsd=Math.round(regions*replicas*38+regions*90+180+rps*3600*24*30/1e6*.015 + rps*30*.002);
  const warnings:string[]=[];
  if(appRps>appCapacityRps)warnings.push('The application tier cannot admit the incoming cache misses.');
  if(dbRps>dbCapacityRps)warnings.push('The database is saturated even if the application has spare replicas.');
  if(input.failRegion&&regions===1)warnings.push('The only region is unavailable; only edge-cached requests can complete.');
  if(appUtil>.85)warnings.push('Application headroom is below the modeled 15% target.');
  if(dbUtil>.85)warnings.push('Database headroom is below the modeled 15% target.');
  if(rejectedRps>0)warnings.push('Capacity shortfall causes modeled request rejection; this is not successful load shedding.');
  const bottleneck:CapacityResult['bottleneck']=appRps>appCapacityRps?'application':dbRps>dbCapacityRps?'database':'none';
  return {demandRps:rps,edgeOffloadRps,appRps,appCapacityRps,dbRps,dbCapacityRps,
    servedRps,rejectedRps,estimatedP95Ms,estimatedMonthlyUsd,capacityPressure,dbPressure,
    availableRegions,availabilityPct:rps?+((servedRps/rps)*100).toFixed(2):100,
    bottleneck,warnings};
}
export type RetryPolicy='none'|'fixed'|'exponential';
export interface ResilienceInput {
  baseRps:number;dependencyCapacity:number;failureRate:number;
  retryPolicy:RetryPolicy;circuitBreaker:boolean;concurrencyLimit:number;
}
export const BASE_RESILIENCE:ResilienceInput={
  baseRps:400,dependencyCapacity:480,failureRate:12,
  retryPolicy:'exponential',circuitBreaker:true,concurrencyLimit:650,
};
export interface ResilienceTick {
  tick:number;offered:number;admitted:number;retries:number;
  completed:number;failed:number;queue:number;breakerOpen:boolean;
}
export interface ResilienceResult {
  ticks:ResilienceTick[];totalOffered:number;completed:number;failed:number;
  peakQueue:number;retryAmplification:number;breakerTrips:number;
  completionPct:number;maxAcceptedRps:number;
}
export function simulateResilience(input:ResilienceInput):ResilienceResult{
  const base=clamp(finite(input.baseRps),0,20000);
  const cap=clamp(finite(input.dependencyCapacity),1,20000);
  const failure=clamp(finite(input.failureRate),0,99)/100;
  const limit=clamp(finite(input.concurrencyLimit),1,30000);
  const ticks:ResilienceTick[]=[];
  let queue=0, pendingRetry=0,openUntil=-1,consecutive=0,trips=0,totalAttempts=0,totalOffered=0,done=0,failed=0,peakQueue=0;
  for(let tick=0;tick<60;tick++){
    // Repeatable traffic event at ticks 15..32; no RNG or clock dependency.
    const offered=base*(tick>=15&&tick<=32?2.2:1);
    totalOffered+=offered;
    const breakerOpen=tick<openUntil;
    const admitted=breakerOpen?0:Math.min(limit,offered+pendingRetry);
    const shed=offered+pendingRetry-admitted;
    pendingRetry=0;
    queue=Math.min(80000,queue+admitted);
    const processed=Math.min(queue,cap);
    queue-=processed;
    const effectiveFailure=clamp(failure+(queue>cap?Math.min(.7,(queue/cap-1)*.14):0),0,.99);
    const successfulAttempts=processed*(1-effectiveFailure);
    const errors=processed-successfulAttempts;
    totalAttempts+=admitted;
    // A retry is an additional attempt, not an additional logical request.
    // The aggregate model has no per-request IDs, so cap unique successes by
    // original requests still unresolved. Errors/failed remain attempt counts.
    const uniqueCompleted=Math.min(successfulAttempts,Math.max(0,totalOffered-done));
    done+=uniqueCompleted;failed+=errors+shed;
    peakQueue=Math.max(peakQueue,queue);
    if(input.retryPolicy==='fixed')pendingRetry=errors*1.8;
    else if(input.retryPolicy==='exponential')pendingRetry=errors*(tick%3===0?.8:.3);
    if(processed>0&&effectiveFailure>.21)consecutive++;else consecutive=Math.max(0,consecutive-1);
    if(input.circuitBreaker&&consecutive>=3){openUntil=tick+5;trips++;consecutive=0;pendingRetry=0;}
    ticks.push({tick,offered:Math.round(offered),admitted:Math.round(admitted),retries:Math.round(pendingRetry),
      completed:Math.round(uniqueCompleted),failed:Math.round(errors+shed),queue:Math.round(queue),breakerOpen});
  }
  return {ticks,totalOffered:Math.round(totalOffered),completed:Math.round(done),failed:Math.round(failed),
    peakQueue:Math.round(peakQueue),retryAmplification:+(totalAttempts/Math.max(1,totalOffered)).toFixed(2),
    breakerTrips:trips,completionPct:+(done/Math.max(1,totalOffered)*100).toFixed(1),
    maxAcceptedRps:Math.max(...ticks.map(t=>t.admitted))};
}
