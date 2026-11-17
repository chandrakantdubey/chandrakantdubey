import assert from "node:assert/strict";
import { DEFAULT_SCENARIO, simulateScenario, explainTrace } from "../src/systems-lab/simulate.ts";
import { SCENARIO_PRESETS, matchingPreset } from "../src/systems-lab/presets.ts";

const baseline = simulateScenario(DEFAULT_SCENARIO);
assert.equal(baseline.incoming, 1800);
assert.equal(baseline.cacheHits, 756);
assert.equal(baseline.originDemand, 1044);
assert.equal(baseline.rejected, 0);
assert.equal(baseline.served, baseline.incoming);

const withFailure = simulateScenario({ ...DEFAULT_SCENARIO, failure: true });
assert.equal(withFailure.healthyReplicas, 2);
assert.ok(withFailure.recovered > 0);
assert.equal(withFailure.rejected, 0);

const noRetries = simulateScenario({ ...DEFAULT_SCENARIO, failure: true, retries: false });
assert.equal(noRetries.recovered, 0);
assert.ok(noRetries.rejected > 0);
assert.ok(noRetries.served < withFailure.served);

const saturated = simulateScenario({
  requestsPerSecond: 6000, cacheHitRate: 0, replicas: 1, failure: false, retries: true,
});
assert.equal(saturated.capacity, 700);
assert.equal(saturated.served, 700);
assert.equal(saturated.rejected, 5300);

const allCached = simulateScenario({
  requestsPerSecond: 2000, cacheHitRate: 100, replicas: 2, failure: false, retries: false,
});
assert.equal(allCached.originDemand, 0);
assert.equal(allCached.rejected, 0);

for (const replicas of [1, 2, 3, 8]) {
  for (const cacheHitRate of [0, 25, 50, 80, 100]) {
    for (const failure of [false, true]) {
      for (const retries of [false, true]) {
        const scenario = {requestsPerSecond: 5000, cacheHitRate, replicas, failure, retries};
        const result = simulateScenario(scenario);
        assert.equal(result.served + result.rejected, result.incoming);
        assert.ok(result.served >= 0 && result.rejected >= 0);
        assert.ok(result.successRate >= 0 && result.successRate <= 100);
        assert.ok(result.utilization >= 0 && result.utilization <= 100);
        assert.ok(result.initialSuccess + result.recovered <= result.capacity);
        assert.ok(explainTrace(scenario, result).length >= 4);
      }
    }
  }
}

const seenPresets = new Set();
for (const preset of SCENARIO_PRESETS) {
  assert.ok(!seenPresets.has(preset.id), "Preset ID must be unique");
  seenPresets.add(preset.id);
  assert.equal(matchingPreset(preset.configuration), preset.id);
  assert.equal(simulateScenario(preset.configuration).incoming, preset.configuration.requestsPerSecond);
}
assert.equal(matchingPreset(DEFAULT_SCENARIO), "baseline");
assert.equal(matchingPreset({ ...DEFAULT_SCENARIO, replicas: 6 }), null);

// Edge cases: request accounting must hold even for non-UI inputs.
for (const config of [
  {requestsPerSecond: 0, cacheHitRate: 0, replicas: 1, failure: true, retries: true},
  {requestsPerSecond: Number.NaN, cacheHitRate: -100, replicas: 0, failure: false, retries: false},
  {requestsPerSecond: 120000, cacheHitRate: 500, replicas: 200, failure: true, retries: true},
]) {
  const result = simulateScenario(config);
  assert.equal(result.served + result.rejected, result.incoming);
  assert.ok(result.successRate >= 0 && result.successRate <= 100);
  assert.ok(result.capacity >= 0);
}

console.log("Systems Lab simulator checks passed.");
