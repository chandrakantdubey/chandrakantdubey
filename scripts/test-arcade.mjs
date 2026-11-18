import assert from "node:assert/strict";
import { projects, experience, skillGroups, contact } from "../src/arcade/data.ts";
import { INITIAL_ENCOUNTER, encounterFinished, resolveTurn, advanceRoute } from "../src/arcade/mini-games.ts";

assert.equal(projects.length, 4, "Portfolio has four playable project previews");
assert.equal(new Set(projects.map(p=>p.id)).size, projects.length, "Each project has a unique ID");
for (const project of projects) {
  assert.match(project.source, /^https:\/\/github\.com\/chandrakantdubey\//);
  assert.ok(project.name.length > 2 && project.stack.length >= 3);
  assert.ok(project.interaction.length > 4);
}
assert.equal(experience.length, 4);
assert.deepEqual(experience.map(e=>e.company), ["Adeptken","Nutriiya","Kintree","Uvation"]);
assert.match(experience[0].period, /2026/);
assert.equal(skillGroups.length, 4);
for (const group of skillGroups) {
  assert.ok(group.items.length >= 6);
  assert.equal(new Set(group.items).size, group.items.length, "Skill names should not repeat");
}
assert.match(contact.email, /^[^@\s]+@[^@\s]+\.[^@\s]+$/);

let state = INITIAL_ENCOUNTER;
assert.equal(encounterFinished(state), false);
for (let i=0; i<8 && !encounterFinished(state); i++) {
  const next = resolveTurn(state, "attack");
  assert.equal(next.turn, state.turn + 1);
  assert.ok(next.hero <= state.hero);
  assert.ok(next.enemy < state.enemy);
  state = next;
}
assert.equal(state.enemy, 0, "Attack sequence should be winnable");
assert.equal(encounterFinished(state), true);
assert.strictEqual(resolveTurn(state, "attack"), state, "Finished encounter cannot be mutated");

const guarded = resolveTurn(INITIAL_ENCOUNTER, "guard");
const attacked = resolveTurn(INITIAL_ENCOUNTER, "attack");
assert.ok(guarded.hero > attacked.hero, "Guard reduces incoming damage");
assert.ok(guarded.enemy > attacked.enemy, "Guard deals less damage");

let progress = 0;
for(let i=0;i<55;i++) {
  const next=advanceRoute(progress);
  assert.ok(next>=progress && next<=100);
  progress=next;
}
assert.equal(progress,100);
assert.equal(advanceRoute(100),100);
assert.equal(advanceRoute(-100),0);
assert.equal(advanceRoute(Number.NaN),0);

console.log("Playable portfolio data and mini-game checks passed.");
