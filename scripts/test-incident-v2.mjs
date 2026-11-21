import assert from "node:assert/strict";
import {
  INCIDENT_ENGINE_VERSION, SCENARIOS,assessment,advanceIncident,createIncident,
  decodeIncidentReplay,encodeIncidentReplay,evidenceFor,evidencePanel,intervene,
  isRecovered,replayIncident,traceSpans,
} from "../src/experience/incidentEngine.ts";

const responsePlan={
  pool:"rollback",
  retries:"limit-retries",
  cache:"warm-cache",
  cascade:"circuit",
  deploy:"rollback",
};
for(const kind of Object.keys(SCENARIOS)){
  const start=createIncident(kind,444);
  assert.deepEqual(start,createIncident(kind,444),"same seed must always produce identical opening state");
  assert.ok(start.history.length===8);
  const spans=traceSpans(start);
  assert.equal(spans.length,6,"trace waterfall must cover all six services");
  for(const span of spans)assert.ok(span.startMs>=0&&span.durationMs>=1&&span.startMs+span.durationMs<=start.history.at(-1).latency);
  assert.ok(spans.some(span=>span.status==="slow"),kind+" identifies a model-derived critical path");
  assert.ok(!isRecovered(start),kind+" cannot start recovered");
  let run=intervene(start,responsePlan[kind]);
  run=advanceIncident(run,50);
  assert.ok(isRecovered(run),kind+" must have at least one meaningful recovery path");
  assert.ok(assessment(run).meanAvailability>=99,kind+" must restore admission and service");
  assert.ok(run.history.every(p=>p.queue>=0&&p.errors>=0&&p.errors<=100));
  const payload=encodeIncidentReplay(run);
  assert.deepEqual(decodeIncidentReplay(payload),run,kind+" replay link must reconstruct full deterministic state");
  assert.deepEqual(replayIncident({
    version:INCIDENT_ENGINE_VERSION,kind,seed:444,commands:run.commands,
  }),run,kind+" canonical commands must replay deterministically");
  assert.match(evidencePanel(run,"logs",start.tick),/SIMULATED LOGS/);
  assert.match(evidencePanel(run,"changes",run.tick),/CHANGE HISTORY/);
  assert.match(evidenceFor(run,start.tick),/TRACE/);
}
let shedding=createIncident("pool",77);
for(let i=0;i<4;i++)shedding=intervene(shedding,"throttle");
shedding=advanceIncident(shedding,40);
assert.ok(shedding.history.at(-1).queue<35,"load shedding drains queue");
assert.ok(!isRecovered(shedding),"a system rejecting most users is not recovered");
assert.ok(assessment(shedding).meanAvailability<50);
let misguided=intervene(createIncident("pool",77),"scale");
misguided=advanceIncident(misguided,40);
assert.ok(!isRecovered(misguided),"scaling app replicas cannot fix saturated connection pool");
let restored=intervene(shedding,"rollback");
for(let i=0;i<4;i++)restored=intervene(restored,"restore-traffic");
restored=advanceIncident(restored,50);
assert.ok(isRecovered(restored),"recovering and restoring admitted traffic must be verifiable");
assert.throws(()=>decodeIncidentReplay("!!!!"));
assert.throws(()=>replayIncident({version:INCIDENT_ENGINE_VERSION,kind:"pool",seed:12,commands:[{type:"advance",ticks:10000}]}));
assert.throws(()=>replayIncident({version:"0",kind:"pool",seed:12,commands:[]}));
const normal=createIncident("cache",12);
const altered=intervene(normal,"warm-cache");
assert.notEqual(normal.history.at(-1).latency,altered.history.at(-1).latency);
console.log("Incident Zero v2: five causal scenarios, verification, admission-loss guard, action tradeoffs, replay integrity — PASS");
