import assert from 'node:assert/strict';
import {
  createGarden, advanceGarden, applyGardenCommand, gardenMetrics,
  gardenReplay, restoreGarden, GARDEN_AREA, GARDEN_MAX_TICK,
  GARDEN_WIDTH, GARDEN_HEIGHT,
} from '../src/experience/entropyEngine.ts';

const deterministicA = createGarden(91), deterministicB = createGarden(91);
assert.deepEqual(deterministicA, deterministicB, 'seed must reproduce identical initial conditions');
assert.equal(deterministicA.cells.length, GARDEN_AREA);
assert.equal(GARDEN_AREA, GARDEN_WIDTH * GARDEN_HEIGHT);
assert.notDeepEqual(createGarden(91), createGarden(92), 'different seeds must produce different biomes');
const initial = gardenMetrics(deterministicA);
assert.ok(initial.population > 0 && initial.species.every(n => n > 0));
assert.ok(initial.coverage > 0 && initial.coverage < 30);
assert.ok(initial.diversity > 0 && initial.diversity <= 100);

let world = deterministicA;
const actions = [
  { type: 'climate', climate: { rain: 85, light: 30, wind: 15 } },
  { type: 'interact', x: 4, y: 5, tool: 'plant', species: 1 },
  { type: 'interact', x: 6, y: 5, tool: 'water' },
  { type: 'interact', x: 7, y: 5, tool: 'feed' },
  { type: 'seed-storm' },
];
for (const action of actions) world = applyGardenCommand(world, action);
world = advanceGarden(world, 47);
world = applyGardenCommand(world, { type: 'climate', climate: { rain: 55, light: 75, wind: 65 } });
world = advanceGarden(world, 64);
world = advanceGarden(world, 64);
assert.deepEqual(restoreGarden(gardenReplay(world)), world, 'replay must reproduce exact cells and state from seed and commands');
assert.ok(world.births > 0, 'living species reproduce');
assert.ok(world.bloomEvents > 0, 'symbiotic blooms arise');
assert.ok(world.tick === 175);
for (const c of world.cells) {
  assert.ok(Number.isFinite(c.water) && c.water >= 0 && c.water <= 100);
  assert.ok(Number.isFinite(c.nutrients) && c.nutrients >= 0 && c.nutrients <= 100);
  assert.ok(Number.isFinite(c.vigor) && c.vigor >= 0 && c.vigor <= 100);
  assert.ok(Number.isSafeInteger(c.age) && c.age >= 0);
  assert.ok(Number.isSafeInteger(c.bloom) && c.bloom >= 0);
  assert.ok([0, 1, 2, 3].includes(c.species));
}

const mono = createGarden(12);
const delta = advanceGarden(mono, 32);
const same = advanceGarden(createGarden(12), 32);
assert.deepEqual(delta, same, 'fixed-step evolution must remain deterministic');
assert.notDeepEqual(delta.cells, mono.cells, 'progression must transform ecology');
let dry = applyGardenCommand(createGarden(31), { type: 'climate', climate: { rain: 2, light: 99, wind: 97 } });
let humid = applyGardenCommand(createGarden(31), { type: 'climate', climate: { rain: 98, light: 12, wind: 10 } });
for (let i = 0; i < 4; i++) { dry = advanceGarden(dry, 64); humid = advanceGarden(humid, 64); }
const dryMetrics = gardenMetrics(dry), humidMetrics = gardenMetrics(humid);
assert.notDeepEqual(dryMetrics.species, humidMetrics.species, 'different climate assumptions must affect species composition');
assert.ok(dryMetrics.moisture < humidMetrics.moisture, 'rainfall controls environmental moisture');

const beforePrune = createGarden(100);
const afterPrune = applyGardenCommand(beforePrune, { type: 'interact', x: 10, y: 10, tool: 'prune' });
assert.notEqual(beforePrune, afterPrune);
assert.deepEqual(beforePrune, createGarden(100), 'pure commands cannot mutate source state');
assert.throws(() => createGarden(-1));
assert.throws(() => createGarden(Number.NaN));
assert.throws(() => applyGardenCommand(beforePrune, { type: 'interact', x: 999, y: 0, tool: 'plant', species: 1 }));
assert.throws(() => applyGardenCommand(beforePrune, { type: 'interact', x: 1, y: 1, tool: 'plant', species: 7 }));
assert.throws(() => applyGardenCommand(beforePrune, { type: 'climate', climate: { rain: 101, light: 50, wind: 55 } }));
assert.throws(() => restoreGarden({ ...gardenReplay(beforePrune), version: '1' }));
assert.throws(() => restoreGarden({ ...gardenReplay(beforePrune), tick: GARDEN_MAX_TICK + 1 }));
assert.throws(() => restoreGarden({ ...gardenReplay(beforePrune), tick: 0, commands: [{ at: 100, command: { type: 'seed-storm' } }] }));
assert.equal(advanceGarden(beforePrune, 300), beforePrune, 'large catch-up calls must be rejected');
console.log(JSON.stringify({
  result: 'PASS', population: gardenMetrics(world).population,
  births: world.births, deaths: world.deaths, blooms: world.bloomEvents,
  differentClimates: { dry: dryMetrics.species, humid: humidMetrics.species },
}, null, 2));
