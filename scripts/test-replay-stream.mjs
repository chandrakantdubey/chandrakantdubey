import assert from 'node:assert/strict';
import {
  createGarden,advanceGarden,applyGardenCommand,restoreGarden,gardenReplay,
  validateGardenReplay,beginGardenReplay,stepGardenReplay,GARDEN_MAX_TICK,
} from '../src/experience/entropyEngine.ts';
const seeded = createGarden(712);
let simulation=advanceGarden(seeded,14);
for(let i=0;i<23;i++){
  simulation=applyGardenCommand(simulation,{type:'interact',x:i%52,y:i%32,tool:'plant',species:(i%3)+1});
}
simulation=advanceGarden(simulation,38);
simulation=applyGardenCommand(simulation,{type:'climate',climate:{rain:75,light:43,wind:26}});
simulation=advanceGarden(simulation,61);
simulation=applyGardenCommand(simulation,{type:'seed-storm'});
simulation=advanceGarden(simulation,37);
const replay=gardenReplay(simulation);
const legacy=restoreGarden(replay);
assert.deepEqual(legacy,simulation,'synchronous canonical replay is exact');
let session=beginGardenReplay(replay);
let steps=0;
while(!session.done){
  assert.ok(++steps<100,'progress must be monotonic and bounded');
  const oldTick=session.state.tick,oldCommand=session.nextCommand;
  session=stepGardenReplay(replay,session,7,4);
  assert.ok(session.state.tick>oldTick||session.nextCommand>oldCommand||session.done,'every iteration must progress');
}
assert.ok(steps>=10,'replay is deliberately spread across frames');
assert.deepEqual(session.state,legacy,'cooperative replay output must match synchronous replay byte-for-byte');
assert.equal(stepGardenReplay(replay,session),session,'finished session is stable');
const empty={version:replay.version,seed:7,tick:0,commands:[]};
assert.equal(stepGardenReplay(empty,beginGardenReplay(empty)).done,true);
const limit={version:replay.version,seed:7,tick:GARDEN_MAX_TICK,commands:[]};
let cursor=beginGardenReplay(limit),sessions=0;
while(!cursor.done){cursor=stepGardenReplay(limit,cursor,64,15);sessions++;}
assert.equal(cursor.state.tick,GARDEN_MAX_TICK);
assert.ok(sessions>=94,'max replay is decomposed into bounded chunks');
const invalid={...replay,commands:[...replay.commands,{at:replay.tick,command:{type:'climate',climate:{rain:NaN,light:45,wind:50}}}]};
assert.throws(()=>validateGardenReplay(invalid),/Invalid replay climate/);
const invalidLate={...replay,tick:GARDEN_MAX_TICK,commands:[...replay.commands,{at:GARDEN_MAX_TICK,command:{type:'interact',x:900,y:0,tool:'water'}}]};
assert.throws(()=>beginGardenReplay(invalidLate),/Coordinates must address a cell/);
assert.throws(()=>stepGardenReplay(replay,beginGardenReplay(replay),0));
assert.throws(()=>stepGardenReplay(replay,beginGardenReplay(replay),1,1000));
assert.deepEqual(legacy,restoreGarden(replay),'streaming does not mutate legacy canonical replay');
console.log(`Replay hardening: ${steps} cooperative steps; 6000-day bounds; corrupt-late-command preflight; deterministic equivalence PASS`);
