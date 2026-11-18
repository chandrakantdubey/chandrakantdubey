import assert from "node:assert/strict";
import {
  randomFromSeed, createMesh, advanceMesh, averageDisplacement, normalizeSeed,
} from "../src/field/engine.ts";
import {
  featuredProjects, workExperience, technologyGroups, links,
} from "../src/atelier/content.ts";

const a = randomFromSeed(2049), b = randomFromSeed(2049), c = randomFromSeed(2050);
const sequence = Array.from({length: 20}, () => a());
assert.deepEqual(sequence, Array.from({length: 20}, () => b()), "same seed must reproduce the same values");
assert.notDeepEqual(sequence, Array.from({length: 20}, () => c()), "different seeds must change the sequence");
assert.ok(sequence.every(x => x >= 0 && x < 1));

const first = createMesh(850, 480, 2049);
const second = createMesh(850, 480, 2049);
const different = createMesh(850, 480, 2050);
assert.deepEqual(first, second, "mesh initialization must be deterministic");
assert.notDeepEqual(first.nodes.slice(0, 6), different.nodes.slice(0, 6));
assert.equal(first.nodes.length, first.columns * first.rows);
assert.ok(first.nodes.length <= 345 && first.nodes.length > 0, "mesh must be bounded");
assert.ok(first.edges.length > first.nodes.length);
assert.ok(first.edges.length < first.nodes.length * 4, "connections should remain O(N)");
assert.ok(first.edges.every(e => e.a >= 0 && e.b >= 0 && e.a < first.nodes.length && e.b < first.nodes.length));

const frozen = createMesh(800, 460, 2049);
advanceMesh(frozen, {dt:0,time:0,pointer:{x:0,y:0,active:false},pulses:[]});
assert.equal(averageDisplacement(frozen), 0, "zero-dt is a no-op");

const mesh = createMesh(850, 480, 2049);
const pointer = {x:425,y:240,active:true};
for(let frame=0;frame<500;frame++){
  const time=frame/60;
  advanceMesh(mesh, {dt:1/60,time,pointer,pulses:frame<80?[{x:420,y:240,born:0}]:[]});
}
assert.ok(averageDisplacement(mesh) > 0, "field should react to forces");
assert.ok(mesh.nodes.every(n=>[n.x,n.y,n.vx,n.vy].every(Number.isFinite)), "simulation must not diverge");

const stress=createMesh(100000, 100000, 100000);
assert.ok(stress.nodes.length <= 345, "extreme viewports are capped");
advanceMesh(stress, {dt:500,time:1e9,pointer:{x:10,y:20,active:true},pulses:[]});
assert.ok(stress.nodes.every(n=>Number.isFinite(n.x)&&Number.isFinite(n.y)));
assert.equal(normalizeSeed(0),1);
assert.equal(normalizeSeed(99999999),999999);
assert.equal(normalizeSeed(Number.NaN),1);

assert.equal(featuredProjects.length,6,"six verified repositories only");
assert.equal(new Set(featuredProjects.map(p=>p.id)).size,6);
for(const project of featuredProjects){
  assert.match(project.repository,/^https:\/\/github\.com\/chandrakantdubey\/[\w-]+$/);
  assert.ok(project.stack.length>=4 && project.implementation.length>20);
  assert.ok(project.description.length>40);
}
assert.ok(featuredProjects.some(x=>x.id==="farmpulse"&&x.status==="IN DEVELOPMENT"),"unshipped work must be clearly identified");
assert.deepEqual(workExperience.map(x=>x.company),["Adeptken","Nutriiya","Kintree","Uvation"]);
assert.equal(technologyGroups.length,4);
assert.match(links.email,/^[^@]+@[^@]+\.[^@]+$/);
console.log("Kinetic portfolio engine, deterministic behavior and source-curated content: PASS");
