import assert from "node:assert/strict";
import { createTypeParticles, advanceTypeParticles, typeDisplacement } from "../src/field/typeEngine.ts";
import { featuredProjects, workExperience } from "../src/atelier/content.ts";
import { publicTeamWork, internalTeamWork } from "../src/atelier/clientWork.ts";

const samples=Array.from({length:3000},(_,i)=>({x:(i%120)*5,y:Math.floor(i/120)*5,tone:i<1500?0:1}));
const a=createTypeParticles(samples,2049);
const b=createTypeParticles(samples,2049);
const c=createTypeParticles(samples,2050);
assert.deepEqual(a,b,"same seed creates same glyph particle field");
assert.notDeepEqual(a.slice(0,12),c.slice(0,12),"different seed changes entry state");
assert.ok(a.length<=2400,"particles are capped to bound draw time");
assert.ok(a.length>400,"nontrivial typography field");

const initial=JSON.stringify(a);
advanceTypeParticles(a,{dt:0,time:0,pointer:{x:0,y:0,active:false},pulses:[]});
assert.equal(JSON.stringify(a),initial,"zero delta must be a no-op");

const pointer={x:210,y:45,active:true};
for(let frame=0;frame<500;frame++){
  const time=frame/60;
  advanceTypeParticles(a,{dt:1/60,time,pointer,pulses:frame<70?[{x:210,y:45,born:0}]:[]});
}
assert.ok(typeDisplacement(a)>0,"letters react to cursor and shockwaves");
assert.ok(a.every(p=>[p.x,p.y,p.vx,p.vy,p.homeX,p.homeY].every(Number.isFinite)),"long-running simulation stays finite");
assert.ok(a.every(p=>p.tone===0||p.tone===1),"glyph coloring remains valid");
assert.equal(typeDisplacement([]),0);
const pathological=createTypeParticles([{x:5,y:5,tone:0}],99);
advanceTypeParticles(pathological,{dt:200,time:1e12,pointer:{x:5,y:5,active:true},pulses:[{x:5,y:5,born:1e12}]});
assert.ok(Number.isFinite(pathological[0].x));

assert.equal(featuredProjects.length,6);
assert.equal(publicTeamWork.length,6);
assert.equal(internalTeamWork.length,4);
assert.equal(new Set(publicTeamWork.map(p=>p.title)).size,6);
for(const p of publicTeamWork){
  assert.ok(p.url.startsWith("https://"),"public project URLs are absolute HTTPS");
}
for(const p of internalTeamWork){
  assert.ok(!("url" in p),"bank intranet projects must not expose invented URLs");
}
assert.ok(publicTeamWork.some(p=>p.url==="https://retail.bombaydyeing.com/"));
assert.ok(publicTeamWork.some(p=>p.url==="https://brushofhope.life"));
assert.ok(publicTeamWork.some(p=>p.url==="https://nutriiya.com"));
assert.ok(internalTeamWork.some(p=>p.title==="i-Compass"));
assert.ok(internalTeamWork.some(p=>p.title==="VAMS"));
assert.equal(workExperience.find(p=>p.company==="Nutriiya")?.period,"Sep 2025 — Jan 2026");
assert.ok(!featuredProjects.some(p=>p.name==="AI Concepts Atlas"),"excluded project must remain excluded");

console.log("Kinetic glyph physics, company work, privacy and employment timeline checks passed.");
