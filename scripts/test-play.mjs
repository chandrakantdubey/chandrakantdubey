import assert from "node:assert/strict";
import { WIDTH,HEIGHT,NO_INPUT,newFluxGame,startFlux,updateFlux,random } from "../src/play/fluxEngine.ts";

// Arcade is deterministic, fixed-step, collision-aware and bounded.
assert.equal(WIDTH,960);assert.equal(HEIGHT,540);
assert.deepEqual(random(123),random(123));
const f=newFluxGame(123);
assert.equal(f.phase,"idle");
assert.equal(updateFlux(f,NO_INPUT,.05),f,"idle remains still");
const started=startFlux(f);
let a=started,b=startFlux(newFluxGame(123));
for(let i=0;i<700;i++){
  a=updateFlux(a,{...NO_INPUT,up:i%5===0,right:i%6===0},1/60);
  b=updateFlux(b,{...NO_INPUT,up:i%5===0,right:i%6===0},1/60);
  assert.deepEqual(a,b,"identical input produces identical arcade state");
  assert.ok(a.x>=0&&a.x<=WIDTH&&a.y>=0&&a.y<=HEIGHT,"ship stays inside");
  assert.ok(a.objects.length<=90,"bounded entity count");
  if(a.phase==="over")break;
}
const spark={kind:"spark",x:480,y:270,vx:0,vy:0,r:10,life:5,phase:0};
const scored=updateFlux({...startFlux(newFluxGame(66)),objects:[spark]},NO_INPUT,.016);
assert.ok(scored.score>0);
assert.equal(scored.objects.length,0);
const hazard={...spark,kind:"hazard",r:20};
const damaged=updateFlux({...startFlux(newFluxGame(66)),objects:[hazard]},NO_INPUT,.016);
assert.equal(damaged.health,2);
assert.ok(damaged.invulnerable>0);
const repeat=updateFlux({...damaged,objects:[hazard]},NO_INPUT,.016);
assert.equal(repeat.health,2,"invulnerability prevents double damage");
assert.equal(updateFlux(started,NO_INPUT,Number.NaN),started);


console.log("Signal Shift fixed-step physics, collisions, score and bounds — PASS");
