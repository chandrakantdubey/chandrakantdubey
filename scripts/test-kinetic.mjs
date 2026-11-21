import assert from 'node:assert/strict';
import {
  createMachine, dispatchMachine, tickMachine, calibrated, physicallyStable,
  machineScore, machineStatus, FIXED_DT, KINETIC_VERSION,
} from '../src/experience/kineticEngine.ts';

const execute = (state, ...commands) => commands.reduce((s, command) => dispatchMachine(s, command).state, state);
const first = createMachine(27);
assert.deepEqual(first, createMachine(27));
assert.equal(FIXED_DT, 1 / 60);
assert.equal(first.version, KINETIC_VERSION);
assert.equal(machineStatus(first), 'PHASE MISMATCH / ADJUST DETENTS');
let coupled = dispatchMachine(first, {type:'turn', rotor:0, direction:1}).state;
assert.deepEqual(coupled.rotors.map(r=>r.detent), [1,3,1], 'connected gear train alternates direction');
let disconnected = execute(first, {type:'coupler', link:0}, {type:'coupler', link:1});
assert.deepEqual(disconnected.couplers, [false,false]);
assert.equal(calibrated(disconnected), false);
let aligned = disconnected;
for (let i=0;i<3;i++) for (let n=0;n<i+1;n++) aligned=execute(aligned,{type:'turn',rotor:i,direction:1});
assert.deepEqual(aligned.rotors.map(r=>r.detent), [1,2,3]);
aligned = execute(aligned, {type:'coupler', link:0},{type:'coupler', link:1});
assert.equal(calibrated(aligned), true);
let premature = execute(aligned,{type:'pulse'});
assert.equal(premature.rejectedPulses,1,'premature pulse rejected');
assert.equal(premature.capacitor,0,'premature pulse cannot charge capacitor');
let ready = tickMachine(aligned,180);
assert.equal(physicallyStable(ready),true,'rotors settle with damped fixed-step integration');
assert.ok(ready.stableTicks>=45);
assert.match(machineStatus(ready),/PHASE-LOCK READY/);
let success=ready;
for(let i=0;i<4;i++) success=execute(success,{type:'pulse'});
assert.equal(success.completed,true);
assert.equal(success.capacitor,100);
assert.ok(machineScore(success)>100);
assert.equal(machineStatus(success),'CORE ONLINE / STABLE POWER TRANSFER');
assert.deepEqual(tickMachine(success,100),success,'completed state is immutable');
const trace=[{type:'coupler',link:0},{type:'coupler',link:1},{type:'turn',rotor:0,direction:1}];
const p=execute(first,...trace);
const q=execute(createMachine(27),...trace);
assert.deepEqual(tickMachine(p,100),tickMachine(q,100),'replay deterministic for fixed seed and command sequence');
assert.throws(()=>createMachine(-1));
assert.throws(()=>dispatchMachine(first,{type:'turn',rotor:5,direction:1}));
assert.throws(()=>dispatchMachine(first,{type:'coupler',link:4}));
assert.equal(tickMachine(first,400),first,'reject unreasonable catch-up requests');
console.log('Kinetic Chamber: deterministic physics, coupling, invalid pulse, phase-lock, completion and bounds PASS');
