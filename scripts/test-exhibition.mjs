import assert from "node:assert/strict";
import { createFoilGeometry } from "../src/exhibition/foilGeometry.ts";
import { featuredProjects, workExperience, technologyGroups, links } from "../src/atelier/content.ts";
import { publicTeamWork, internalTeamWork } from "../src/atelier/clientWork.ts";

function inspectGeometry(segments,sides) {
  const mesh=createFoilGeometry(segments,sides);
  const ns=Math.max(36,Math.min(480,Math.floor(segments)));
  const nc=Math.max(8,Math.min(24,Math.floor(sides)));
  assert.equal(mesh.positions.length,(ns+1)*(nc+1)*6);
  assert.equal(mesh.indices.length,ns*nc*6);
  for(let i=0;i<mesh.positions.length;i+=6){
    const p=mesh.positions.subarray(i,i+3);
    const n=mesh.positions.subarray(i+3,i+6);
    assert.ok([...p,...n].every(Number.isFinite),"All positions and normals are finite");
    assert.ok(Math.abs(Math.hypot(...n)-1)<0.0005,"Normals must be unit length");
  }
  assert.ok([...mesh.indices].every(i=>i>=0 && i<mesh.positions.length/6),"Indices are valid");
  for(let j=0;j<=nc;j++){
    const first=j*6,last=(ns*(nc+1)+j)*6;
    for(let k=0;k<6;k++){
      assert.ok(Math.abs(mesh.positions[first+k]-mesh.positions[last+k])<.0006,"Foil surface closes without a seam");
    }
  }
  return mesh;
}
const a=inspectGeometry(360,18);
const b=inspectGeometry(360,18);
assert.deepEqual(a.positions,b.positions,"Geometry is deterministic");
assert.deepEqual(a.indices,b.indices);
inspectGeometry(200,12);
const bounded=inspectGeometry(1e6,1e6);
assert.ok(bounded.positions.length/6<=12025,"Geometry stays within mobile/desktop caps");

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
assert.ok(internalTeamWork.every(p=>!Object.hasOwn(p,"url")),"Private intranet work must have no fabricated public URLs");
assert.match(links.email,/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
console.log("Chromatic foil geometry, closed normals, bounded complexity and portfolio content: PASS.");
