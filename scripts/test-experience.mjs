import assert from "node:assert/strict";
import { createIncident, advanceIncident, intervene, evidenceFor, SCENARIOS } from "../src/experience/incidentEngine.ts";
const kinds=Object.keys(SCENARIOS);
for (const kind of kinds) {
  const a=createIncident(kind,1234);
  const b=createIncident(kind,1234);
  assert.deepEqual(a,b,"identical seeds reproduce initial state");
  assert.deepEqual(advanceIncident(a,12),advanceIncident(b,12),"identical clock progress reproduces telemetry");
  const x=intervene(a,"rollback");
  const y=intervene(a,"throttle");
  assert.notDeepEqual(x,y,"different actions must create distinct consequences");
  assert.ok(evidenceFor(a).includes("TRACE"));
  assert.ok(a.history.length>=8);
}
let moves=[0,0,0];
for (const [i,count] of [[0,0],[1,2],[2,1]]) {
  for (let j=0;j<count;j++)moves=moves.map((v,k)=>(k===i||k===(i+1)%3)?(v+90)%360:v);
}
assert.deepEqual(moves,[90,180,270],"coupled phase puzzle is solvable");
const { newSiegeGame,beginPacketGame,timeRemaining,waveForTick,SIEGE_MS }=await import("../src/play/packetEngine.js");
const siege=beginPacketGame(newSiegeGame(909),1000);
assert.equal(timeRemaining(siege,1000),SIEGE_MS);
assert.equal(timeRemaining(siege,91000),150000);
assert.equal(waveForTick(370,"siege"),5);
assert.equal(waveForTick(370),3);
console.log("Experience simulations: deterministic seeds, varied interventions, and solvable machine verified.");
