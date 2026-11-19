import assert from "node:assert/strict";
import { createCodeMonument, GLYPHS, CODE_VERTEX_STRIDE } from "../src/exhibition/codeGeometry.ts";
import { featuredProjects, workExperience, technologyGroups, links } from "../src/atelier/content.ts";
import { publicTeamWork, internalTeamWork } from "../src/atelier/clientWork.ts";

assert.equal(GLYPHS.C.length,10);
assert.equal(GLYPHS.D.length,10);
assert.ok([...GLYPHS.C,...GLYPHS.D].every(row=>row.length===8 && /^[01]+$/.test(row)));
const occupied=[...GLYPHS.C,...GLYPHS.D].join("").split("").filter(x=>x==="1").length;
const a=createCodeMonument(2026),b=createCodeMonument(2026),c=createCodeMonument(2027);
assert.equal(a.modules,occupied);
assert.ok(a.modules>=60 && a.modules<=120,"letter geometry must be bounded");
assert.equal(a.vertices.length,a.modules*24*CODE_VERTEX_STRIDE);
assert.equal(a.indices.length,a.modules*36);
assert.deepEqual(a.vertices,b.vertices,"same identity seed gives identical compiled geometry");
assert.deepEqual(a.indices,b.indices);
assert.notDeepEqual(a.vertices.slice(0,64),c.vertices.slice(0,64),"scatter positions vary with seed");
assert.ok([...a.vertices].every(Number.isFinite),"all geometry components must be finite");
assert.ok([...a.indices].every(i=>i>=0 && i<a.modules*24),"indices must be inside VBO");
assert.ok(a.modules*24<65535,"WebGL1 Uint16 index range not exceeded");
let chrome=0,lime=0,coral=0;
for(let v=0;v<a.vertices.length;v+=CODE_VERTEX_STRIDE){
  const nx=a.vertices[v+3],ny=a.vertices[v+4],nz=a.vertices[v+5];
  assert.ok(Math.abs(Math.hypot(nx,ny,nz)-1)<.0001,"unit normal");
  const material=a.vertices[v+15];
  assert.ok([0,1,2].includes(material));
  if(material===0)chrome++;else if(material===1)lime++;else coral++;
}
assert.ok(chrome>0 && lime>0 && coral>0,"geometry needs contrasting materials");
assert.ok(a.vertices.byteLength<256*1024,"single GPU geometry stays small");

assert.equal(featuredProjects.length,6);
assert.deepEqual(featuredProjects.map(p=>p.name),["Blackout Protocol","Timesheet","StyleScape","Pokédex RPG","FitStream","FarmPulse"]);
assert.ok(!featuredProjects.some(p=>p.name==="AI Concepts Atlas"));
assert.ok(featuredProjects.every(p=>p.repository.startsWith("https://github.com/chandrakantdubey/")));
assert.equal(workExperience.find(p=>p.company==="Nutriiya")?.period,"Sep 2025 — Jan 2026");
assert.equal(technologyGroups.length,4);
assert.equal(publicTeamWork.length,6);
assert.equal(internalTeamWork.length,4);
assert.ok(publicTeamWork.some(p=>p.url==="https://retail.bombaydyeing.com/"));
assert.ok(publicTeamWork.some(p=>p.url==="https://brushofhope.life"));
assert.ok(publicTeamWork.some(p=>p.url==="https://nutriiya.com"));
assert.ok(internalTeamWork.every(p=>!Object.hasOwn(p,"url")),"private work must not leak public URLs");
assert.match(links.email,/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
console.log("Code monument geometry, bounded assembly, normal vectors, seed determinism and portfolio content: PASS");
