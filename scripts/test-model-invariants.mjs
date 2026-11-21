import assert from 'node:assert/strict';
import {
  BASE_CAPACITY, BASE_RESILIENCE,
  estimateCapacity, simulateResilience,
} from '../src/experience/systemsModel.ts';

/** The original model counted retry successes twice and could show 109.5%. */
const formerlyOvercounted=simulateResilience({
  baseRps:225,dependencyCapacity:1375,failureRate:10,
  retryPolicy:'fixed',circuitBreaker:false,concurrencyLimit:1525,
});
assert.ok(formerlyOvercounted.completionPct<=100);
assert.ok(formerlyOvercounted.completed<=formerlyOvercounted.totalOffered);
assert.ok(formerlyOvercounted.retryAmplification>1,
  'attempt amplification is retained even when successful logical requests are bounded');

for(let seed=0;seed<2000;seed++) {
  const baseline={
    baseRps:100+(seed*79%1450),
    dependencyCapacity:100+(seed*97%1500),
    failureRate:seed%65,
    retryPolicy:['fixed','none','exponential'][seed%3],
    circuitBreaker:seed%2===0,
    concurrencyLimit:100+(seed*47%2100),
  };
  const copy=structuredClone(baseline);
  const result=simulateResilience(baseline);
  assert.deepEqual(baseline,copy,'simulator must not mutate its input');
  assert.equal(result.ticks.length,60);
  assert.ok(result.completed<=result.totalOffered+.0001,'no duplicate logical successes');
  assert.ok(result.completionPct>=0 && result.completionPct<=100);
  assert.ok(result.retryAmplification>=0 && Number.isFinite(result.retryAmplification));
  assert.ok(result.peakQueue>=0 && result.peakQueue<=80000);
  for(const step of result.ticks){
    assert.ok(step.completed>=0 && step.admitted>=0 && step.offered>=0);
    assert.ok(step.queue>=0 && step.queue<=80000);
    assert.ok(Number.isFinite(step.retries));
  }
  const capacity={...BASE_CAPACITY,
    rps:seed*57%10000,edgeHit:seed*17%96,replicasPerRegion:1+seed%30,
    regionCount:[1,2,3][seed%3],dbReadCapacity:100+seed*71%6000,
    failRegion:seed%7===0};
  const before=structuredClone(capacity);
  const estimated=estimateCapacity(capacity);
  assert.deepEqual(capacity,before,'capacity model must not mutate the user input');
  assert.ok(estimated.servedRps>=0 && estimated.servedRps<=estimated.demandRps+0.001);
  assert.ok(estimated.rejectedRps>=0 && estimated.rejectedRps<=estimated.demandRps+0.001);
  assert.ok(estimated.availabilityPct>=0 && estimated.availabilityPct<=100);
  assert.ok(estimated.estimatedMonthlyUsd>=0 && Number.isFinite(estimated.estimatedMonthlyUsd));
  assert.ok(estimated.estimatedP95Ms>=0 && Number.isFinite(estimated.estimatedP95Ms));
}
const badInput=estimateCapacity({
  ...BASE_CAPACITY,
  rps:Number.POSITIVE_INFINITY,edgeHit:Number.NaN,
  regionCount:Number.NaN,replicasPerRegion:Number.POSITIVE_INFINITY,
});
assert.equal(badInput.demandRps,0,'nonfinite traffic is normalized');
assert.equal(badInput.availableRegions,1,'invalid region count is normalized');
assert.ok(Number.isFinite(badInput.estimatedMonthlyUsd));
assert.ok(Number.isFinite(badInput.estimatedP95Ms));
const defaultCapacity=estimateCapacity(BASE_CAPACITY);
const scaled=estimateCapacity({...BASE_CAPACITY,replicasPerRegion:BASE_CAPACITY.replicasPerRegion+2});
assert.ok(scaled.servedRps>=defaultCapacity.servedRps,
  'scaling additional app replicas cannot reduce modeled throughput');
const failedRegion=estimateCapacity({...BASE_CAPACITY,failRegion:true});
assert.ok(failedRegion.appCapacityRps<defaultCapacity.appCapacityRps,
  'losing a region reduces available app throughput');
assert.deepEqual(simulateResilience(BASE_RESILIENCE),simulateResilience(BASE_RESILIENCE),
  'resilience model is deterministic');
console.log('Systems invariants: 2,000 capacity + 2,000 resilience samples, no >100% unique completions, sanitized inputs PASS');
