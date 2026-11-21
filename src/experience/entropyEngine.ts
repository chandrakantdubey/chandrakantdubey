/**
 * ENTROPY GARDEN / V2
 * An original, deterministic cellular ecosystem, not a random particle wallpaper.
 * Pure TypeScript: no browser state, ambient time, network, or Math.random.
 * Simulation ticks are abstract days, not a biological forecast.
 */
export const GARDEN_VERSION = '2.0.0' as const;
export const GARDEN_WIDTH = 52;
export const GARDEN_HEIGHT = 32;
export const GARDEN_AREA = GARDEN_WIDTH * GARDEN_HEIGHT;
export const GARDEN_MAX_TICK = 6000;
export const GARDEN_MAX_COMMANDS = 400;

export type Species = 0 | 1 | 2 | 3;
export type LivingSpecies = Exclude<Species, 0>;
export type GardenTool = 'plant' | 'water' | 'prune' | 'feed';
export type GardenClimate = { rain: number; light: number; wind: number };
export type GardenCell = {
  species: Species;
  vigor: number;     // [0,100]
  age: number;       // simulation days
  water: number;     // [0,100]
  nutrients: number; // [0,100]
  bloom: number;     // days until glow fades
};
export type GardenCommand =
  | { type: 'interact'; x: number; y: number; tool: GardenTool; species?: LivingSpecies }
  | { type: 'climate'; climate: GardenClimate }
  | { type: 'seed-storm' };
export type RecordedGardenCommand = { at: number; command: GardenCommand };
export interface GardenState {
  version: typeof GARDEN_VERSION;
  seed: number;
  tick: number;
  cells: GardenCell[];
  climate: GardenClimate;
  commands: RecordedGardenCommand[];
  births: number;
  deaths: number;
  bloomEvents: number;
  lastEvent: 'planted' | 'watered' | 'pruned' | 'fed' | 'rain' | 'bloom' | 'storm' | 'climate' | null;
}
export type GardenMetrics = {
  population: number;
  species: [number, number, number];
  coverage: number;
  diversity: number;
  vitality: number;
  moisture: number;
  nutrition: number;
  blooms: number;
  regeneration: number;
};

function clamp(n: number, a = 0, b = 100) { return Math.min(b, Math.max(a, n)); }
function validSeed(seed: number) { return Number.isSafeInteger(seed) && seed >= 0 && seed <= 0x7fffffff; }
function hash(seed: number, tick: number, cell: number, channel: number) {
  let v = (seed ^ Math.imul(tick + 1, 0x9e3779b1) ^ Math.imul(cell + 17, 0x85ebca6b) ^ Math.imul(channel + 31, 0xc2b2ae35)) >>> 0;
  v ^= v >>> 16; v = Math.imul(v, 0x7feb352d); v ^= v >>> 15; v = Math.imul(v, 0x846ca68b); v ^= v >>> 16;
  return (v >>> 0) / 4294967296;
}
function at(x: number, y: number) { return y * GARDEN_WIDTH + x; }
function neighbors(x: number, y: number) {
  // Toroidal x wrap creates a continuous biome; y edges remain boundaries.
  const left = (x - 1 + GARDEN_WIDTH) % GARDEN_WIDTH;
  const right = (x + 1) % GARDEN_WIDTH;
  const list = [at(left, y), at(right, y)];
  if (y > 0) list.push(at(x, y - 1));
  if (y < GARDEN_HEIGHT - 1) list.push(at(x, y + 1));
  return list;
}
export function createGarden(seed = 17): GardenState {
  if (!validSeed(seed)) throw new Error('Garden seed must be a nonnegative 31-bit integer');
  const cells: GardenCell[] = Array.from({ length: GARDEN_AREA }, (_, i) => {
    const x = i % GARDEN_WIDTH, y = Math.floor(i / GARDEN_WIDTH);
    const water = clamp(54 + 18 * Math.sin(x * .22 + seed * .001) + 17 * Math.sin(y * .27) + (hash(seed, 0, i, 1) - .5) * 20);
    const nutrients = clamp(49 + 21 * Math.cos(y * .17 + x * .08) + (hash(seed, 0, i, 2) - .5) * 18);
    const spawn = hash(seed, 0, i, 3);
    const species: Species = spawn < .065 ? 1 : spawn < .099 ? 2 : spawn < .123 ? 3 : 0;
    return { species, vigor: species ? 55 + hash(seed, 0, i, 4) * 24 : 0,
      age: species ? Math.floor(hash(seed, 0, i, 5) * 8) : 0,
      water, nutrients, bloom: 0 };
  });
  return {
    version: GARDEN_VERSION, seed, tick: 0, cells,
    climate: { rain: 53, light: 55, wind: 27 },
    commands: [], births: 0, deaths: 0, bloomEvents: 0, lastEvent: null,
  };
}
function habitat(species: LivingSpecies, water: number, nutrients: number, light: number, wind: number) {
  // Every species occupies a distinct niche, allowing climate to favor one
  // while reducing another: mycelium, lumen blooms, and windgrass.
  const soilPenalty = nutrients < 26 ? (26 - nutrients) / 46 : 0;
  if (species === 1) return clamp(1 - Math.abs(water - 72) / 85 - Math.abs(light - 28) / 150 - soilPenalty, 0, 1);
  if (species === 2) return clamp(1 - Math.abs(light - 76) / 94 - Math.abs(water - 56) / 150 - soilPenalty, 0, 1);
  return clamp(1 - Math.abs(water - 29) / 92 - Math.abs(wind - 75) / 155 - soilPenalty, 0, 1);
}
function changeCell(cell: GardenCell): GardenCell { return { ...cell }; }
/**
 * Advances 1..64 days with immutable snapshots. Reproduction proposals are
 * resolved only after all live cells are updated, avoiding iteration-order
 * breeding advantages. Each parent can propagate at most one seed per day.
 */
export function advanceGarden(current: GardenState, days = 1): GardenState {
  if (!Number.isSafeInteger(days) || days < 0 || days > 64 || current.tick >= GARDEN_MAX_TICK) return current;
  let s = current;
  for (let day = 0; day < days && s.tick < GARDEN_MAX_TICK; day++) {
    const tick = s.tick + 1;
    const next = s.cells.map(changeCell);
    const births: Array<{ index: number; species: LivingSpecies; fitness: number }> = [];
    const { rain, light, wind } = s.climate;
    let deaths = 0, bloomEvents = 0;
    for (let i = 0; i < GARDEN_AREA; i++) {
      const old = s.cells[i], n = next[i];
      const x = i % GARDEN_WIDTH, y = Math.floor(i / GARDEN_WIDTH);
      const adj = neighbors(x, y);
      const waterAverage = adj.reduce((sum, j) => sum + s.cells[j].water, 0) / adj.length;
      const nutrientAverage = adj.reduce((sum, j) => sum + s.cells[j].nutrients, 0) / adj.length;
      const irregularity = hash(s.seed, tick, i, 1) * 2 - 1;
      const shade = (y / (GARDEN_HEIGHT - 1) - .5) * 18;
      const localLight = clamp(light + shade + irregularity * 4);
      n.water = clamp(old.water + (rain - 46) * .094 + (waterAverage - old.water) * .14 - (localLight - 50) * .038 + irregularity * 1.1);
      n.nutrients = clamp(old.nutrients + .72 + (nutrientAverage - old.nutrients) * .07);
      if (old.bloom > 0) n.bloom = old.bloom - 1;
      if (!old.species) continue;
      const kind = old.species;
      const fitness = habitat(kind, n.water, n.nutrients, localLight, wind);
      const competition = adj.filter(j => s.cells[j].species).length;
      const metabolicDrain = kind === 2 ? 1.02 : kind === 3 ? .72 : .86;
      const sustenance = Math.min(n.water * .11, n.nutrients * .12);
      const improvement = (fitness - .48) * 7.4 + Math.min(1.8, sustenance * .14) - metabolicDrain - competition * .14;
      n.vigor = clamp(old.vigor + improvement - (old.age > 80 ? (old.age - 80) * .045 : 0));
      n.water = clamp(n.water - (1.2 + fitness * 1.4));
      n.nutrients = clamp(n.nutrients - (.8 + fitness * 1.2));
      n.age = old.age + 1;
      if (n.vigor < 7 || n.age > 190) {
        n.species = 0; n.vigor = 0; n.age = 0; n.bloom = 0;
        n.nutrients = clamp(n.nutrients + 19); deaths++;
        continue;
      }
      const nearbySpecies = new Set(adj.map(j => s.cells[j].species).filter(Boolean));
      if (nearbySpecies.size >= 2 && n.vigor >= 67 && fitness > .59 && hash(s.seed, tick, i, 4) < .11) {
        n.bloom = 9;
        n.vigor = clamp(n.vigor + 2);
        bloomEvents++;
      }
      if (n.vigor > 67 && n.age > 7 && fitness > .55 && hash(s.seed, tick, i, 7) < (.12 + .10 * fitness)) {
        const vacancies = adj.filter(j => s.cells[j].species === 0);
        if (vacancies.length) {
          // Wind preferentially moves the seed east; low wind prefers a
          // deterministic neighboring site. No Math.random anywhere.
          const offset = hash(s.seed, tick, i, 8);
          const target = wind >= 65 && vacancies.includes(at((x + 1) % GARDEN_WIDTH, y))
            ? at((x + 1) % GARDEN_WIDTH, y)
            : vacancies[Math.floor(offset * vacancies.length)];
          const targetCell = next[target];
          const localFitness = habitat(kind, targetCell.water, targetCell.nutrients, light, wind);
          if (localFitness > .47) births.push({ index: target, species: kind, fitness: localFitness + hash(s.seed, tick, i, 9) * .05 });
        }
      }
    }
    // Higher-fitness proposals win contested empty sites; stable tie-break by
    // cell index, avoiding run-to-run nondeterminism.
    births.sort((a, b) => b.fitness - a.fitness || a.index - b.index);
    let actualBirths = 0;
    for (const birth of births) {
      const cell = next[birth.index];
      if (cell.species) continue;
      cell.species = birth.species; cell.vigor = 38; cell.age = 0;
      cell.nutrients = clamp(cell.nutrients - 4); actualBirths++;
    }
    s = { ...s, tick, cells: next, births: s.births + actualBirths,
      deaths: s.deaths + deaths, bloomEvents: s.bloomEvents + bloomEvents,
      lastEvent: bloomEvents ? 'bloom' : s.lastEvent };
  }
  return s;
}
function validateIndex(x: number, y: number) {
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= GARDEN_WIDTH || y >= GARDEN_HEIGHT)
    throw new Error('Coordinates must address a cell inside the garden');
}
export function applyGardenCommand(s: GardenState, command: GardenCommand): GardenState {
  if (s.commands.length >= GARDEN_MAX_COMMANDS) return s;
  if (command.type === 'climate') {
    const { rain, light, wind } = command.climate;
    if (![rain, light, wind].every(n => Number.isInteger(n) && n >= 0 && n <= 100)) throw new Error('Climate requires integer percentages');
    return { ...s, climate: { rain, light, wind },
      commands: [...s.commands, { at: s.tick, command: { type: 'climate', climate: { rain, light, wind } } }],
      lastEvent: 'climate' };
  }
  if (command.type === 'seed-storm') {
    const cells = s.cells.map(changeCell);
    const radius = 3 + Math.floor(hash(s.seed, s.tick, 15, 0) * 5);
    const centerX = Math.floor(hash(s.seed, s.tick, 25, 0) * GARDEN_WIDTH);
    const centerY = Math.floor(hash(s.seed, s.tick, 27, 0) * GARDEN_HEIGHT);
    for (let y = 0; y < GARDEN_HEIGHT; y++) for (let x = 0; x < GARDEN_WIDTH; x++) {
      const dist = Math.hypot(x - centerX, y - centerY);
      if (dist > radius) continue;
      const n = cells[at(x, y)];
      n.water = clamp(n.water + 34); n.nutrients = clamp(n.nutrients + 14);
      if (n.species && dist < radius * .6) n.vigor = clamp(n.vigor - 22);
    }
    return { ...s, cells, commands: [...s.commands, { at: s.tick, command }], lastEvent: 'storm' };
  }
  if (command.type !== 'interact') throw new Error('Unknown garden command');
  validateIndex(command.x, command.y);
  if (!['plant', 'water', 'prune', 'feed'].includes(command.tool)) throw new Error('Unknown garden tool');
  if (command.tool === 'plant' && ![1, 2, 3].includes(command.species as number)) throw new Error('Plant command requires a valid species');
  const { x, y, tool } = command;
  const cells = s.cells.slice();
  const radius = tool === 'plant' ? 0 : tool === 'water' ? 3 : 2;
  for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
    if (dx * dx + dy * dy > radius * radius) continue;
    const yy = y + dy;
    if (yy < 0 || yy >= GARDEN_HEIGHT) continue;
    const xx = (x + dx + GARDEN_WIDTH) % GARDEN_WIDTH;
    const i = at(xx, yy), c = { ...cells[i] };
    if (tool === 'plant') {
      if (!c.species) { c.species = command.species!; c.vigor = 68; c.age = 0; c.nutrients = clamp(c.nutrients - 3); }
    } else if (tool === 'water') c.water = clamp(c.water + 24);
    else if (tool === 'feed') c.nutrients = clamp(c.nutrients + 28);
    else if (tool === 'prune' && c.species) {
      c.species = 0; c.vigor = 0; c.age = 0; c.bloom = 0; c.nutrients = clamp(c.nutrients + 12);
    }
    cells[i] = c;
  }
  return { ...s, cells, lastEvent: tool === 'plant' ? 'planted' : tool === 'water' ? 'watered' : tool === 'feed' ? 'fed' : 'pruned',
    commands: [...s.commands, { at: s.tick, command: tool === 'plant' ? { ...command, species: command.species } : command }] };
}
export function gardenMetrics(s: GardenState): GardenMetrics {
  const counts: [number, number, number] = [0, 0, 0];
  let vigor = 0, water = 0, nutrients = 0, blooms = 0;
  for (const c of s.cells) {
    water += c.water; nutrients += c.nutrients;
    if (c.species) { counts[c.species - 1]++; vigor += c.vigor; }
    if (c.bloom) blooms++;
  }
  const population = counts.reduce((a, b) => a + b, 0);
  const diversity = population ? -counts.reduce((sum, count) => {
    if (!count) return sum;
    const p = count / population;
    return sum + p * Math.log(p);
  }, 0) / Math.log(3) * 100 : 0;
  const coverage = population / GARDEN_AREA * 100;
  const vitality = population ? vigor / population : 0;
  const regeneration = clamp(coverage * .28 + diversity * .36 + vitality * .36);
  return {
    population, species: counts, coverage: +coverage.toFixed(1),
    diversity: +diversity.toFixed(1), vitality: +vitality.toFixed(1),
    moisture: +(water / GARDEN_AREA).toFixed(1),
    nutrition: +(nutrients / GARDEN_AREA).toFixed(1), blooms,
    regeneration: +regeneration.toFixed(1),
  };
}
export type GardenReplay = {
  version: typeof GARDEN_VERSION;
  seed: number;
  tick: number;
  commands: RecordedGardenCommand[];
};
export function gardenReplay(s: GardenState): GardenReplay {
  return { version: s.version, seed: s.seed, tick: s.tick, commands: s.commands };
}
/**
 * A replay imported from disk is untrusted. Validate its entire schedule before
 * any potentially expensive evolution work so a malformed trailing command
 * cannot force thousands of simulated days before being rejected.
 */
export function validateGardenReplay(replay: GardenReplay): void {
  if (!replay || replay.version !== GARDEN_VERSION || !validSeed(replay.seed) ||
    !Number.isInteger(replay.tick) || replay.tick < 0 || replay.tick > GARDEN_MAX_TICK ||
    !Array.isArray(replay.commands) || replay.commands.length > GARDEN_MAX_COMMANDS) {
    throw new Error('Invalid or incompatible replay envelope');
  }
  let previous = 0;
  for (const item of replay.commands) {
    if (!item || !Number.isInteger(item.at) || item.at < previous || item.at > replay.tick ||
      !item.command || typeof item.command !== 'object') throw new Error('Invalid replay command order');
    previous = item.at;
    const command = item.command;
    if (command.type === 'climate') {
      if (!command.climate || !['rain', 'light', 'wind'].every(key => {
        const value = command.climate[key as keyof GardenClimate];
        return Number.isInteger(value) && value >= 0 && value <= 100;
      })) throw new Error('Invalid replay climate');
    } else if (command.type === 'interact') {
      validateIndex(command.x, command.y);
      if (!['plant', 'water', 'prune', 'feed'].includes(command.tool)) throw new Error('Invalid replay tool');
      if (command.tool === 'plant' && ![1, 2, 3].includes(command.species as number)) throw new Error('Invalid replay species');
    } else if (command.type !== 'seed-storm') throw new Error('Unknown garden replay command');
  }
}
export type GardenReplaySession = { state: GardenState; nextCommand: number; done: boolean };
export function beginGardenReplay(replay: GardenReplay): GardenReplaySession {
  validateGardenReplay(replay);
  return { state: createGarden(replay.seed), nextCommand: 0, done: false };
}
/**
 * Cooperative replay execution: cap days and command applications per frame.
 * The caller may yield between invocations or abandon the session entirely.
 * It is byte-equivalent to synchronous restoreGarden for valid records.
 */
export function stepGardenReplay(replay: GardenReplay, session: GardenReplaySession,
  maxDays = 12, maxCommands = 10): GardenReplaySession {
  if (!Number.isInteger(maxDays) || maxDays < 1 || maxDays > 64 ||
      !Number.isInteger(maxCommands) || maxCommands < 1 || maxCommands > 25)
    throw new Error('Invalid replay work budget');
  if (session.done) return session;
  let state = session.state, index = session.nextCommand;
  let daysLeft = maxDays, commandsLeft = maxCommands;
  while (true) {
    const next = replay.commands[index];
    if (next && next.at === state.tick && commandsLeft > 0) {
      state = applyGardenCommand(state, next.command);
      index++; commandsLeft--;
      continue;
    }
    if (index >= replay.commands.length && state.tick === replay.tick)
      return { state, nextCommand: index, done: true };
    if ((next && next.at === state.tick && commandsLeft === 0) || daysLeft <= 0)
      return { state, nextCommand: index, done: false };
    const target = next ? next.at : replay.tick;
    if (target < state.tick) throw new Error('Replay cursor moved past a command');
    const days = Math.min(daysLeft, target - state.tick);
    if (days === 0) throw new Error('Unprogressable replay command');
    state = advanceGarden(state, days);
    daysLeft -= days;
  }
}
export function restoreGarden(replay: GardenReplay): GardenState {
  validateGardenReplay(replay);
  let s = createGarden(replay.seed);
  for (const item of replay.commands) {
    if (!item || !Number.isInteger(item.at) || item.at < s.tick || item.at > replay.tick || !item.command)
      throw new Error('Invalid replay command order');
    const delta = item.at - s.tick;
    for (let t = 0; t < delta; t += 64) s = advanceGarden(s, Math.min(64, delta - t));
    s = applyGardenCommand(s, item.command);
  }
  const remaining = replay.tick - s.tick;
  for (let t = 0; t < remaining; t += 64) s = advanceGarden(s, Math.min(64, remaining - t));
  return s;
}
