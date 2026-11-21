/**
 * KINETIC CHAMBER — deterministic, fixed-step, browser-local mechanical simulation.
 * No timers, graphics, browser APIs or nondeterministic input inside the engine.
 * Visual animation is driven by this state and can pause independently.
 */
export const KINETIC_VERSION = '1.0.0' as const;
export const FIXED_DT = 1 / 60;
export const PHASES = 4;
export const TARGET_STEPS = [1, 2, 3] as const;
export type RotorIndex = 0 | 1 | 2;
export type CouplerIndex = 0 | 1;
export interface Rotor {
  /** Unwrapped radians, used to render physically continuous motion. */
  angle: number;
  velocity: number;
  /** Target detent modulo four (90-degree indexed gear teeth). */
  detent: number;
}
export type KineticCommand =
  | { type: 'turn'; rotor: RotorIndex; direction: -1 | 1 }
  | { type: 'coupler'; link: CouplerIndex }
  | { type: 'pulse' }
  | { type: 'reset'; seed?: number };
export type MachineEvent =
  | 'rotor-turn' | 'coupler-engaged' | 'coupler-released'
  | 'pulse-accepted' | 'pulse-rejected' | 'overheat' | 'completed';
export interface KineticState {
  version: typeof KINETIC_VERSION;
  seed: number;
  tick: number;
  rotors: [Rotor, Rotor, Rotor];
  couplers: [boolean, boolean];
  temperature: number;
  charge: number;
  capacitor: number;
  stableTicks: number;
  completed: boolean;
  pulses: number;
  rejectedPulses: number;
  commands: KineticCommand[];
  lastEvent: MachineEvent | null;
}
export interface Transition { state: KineticState; event: MachineEvent | null; }

function wrappedStep(n: number) { return ((n % PHASES) + PHASES) % PHASES; }
function clamp(n: number, a: number, b: number) { return Math.min(b, Math.max(a, n)); }
/** Shortest angular distance from x to y in radians. */
function angleDelta(x: number, y: number) {
  return Math.atan2(Math.sin(y - x), Math.cos(y - x));
}
function targetRadians(detent: number) { return (Math.PI / 2) * detent; }
export function createMachine(seed = 17): KineticState {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0x7fffffff) throw Error('Invalid seed');
  return {
    version: KINETIC_VERSION, seed, tick: 0,
    rotors: [
      { angle: 0, velocity: 0, detent: 0 },
      { angle: 0, velocity: 0, detent: 0 },
      { angle: 0, velocity: 0, detent: 0 },
    ],
    couplers: [true, true], temperature: 21, charge: 100,
    capacitor: 0, stableTicks: 0, completed: false,
    pulses: 0, rejectedPulses: 0, commands: [], lastEvent: null,
  };
}
function connectedRotors(start: RotorIndex, couplers: readonly [boolean, boolean]): Array<{ index: RotorIndex; direction: number }> {
  const seen = new Set<number>();
  const found: Array<{ index: RotorIndex; direction: number }> = [];
  const explore = (index: RotorIndex, direction: number) => {
    if (seen.has(index)) return;
    seen.add(index); found.push({ index, direction });
    if (index > 0 && couplers[index - 1]) explore((index - 1) as RotorIndex, -direction);
    if (index < 2 && couplers[index]) explore((index + 1) as RotorIndex, -direction);
  };
  explore(start, 1);
  return found;
}
export function calibrated(state: KineticState): boolean {
  return state.rotors.every((r, i) => r.detent === TARGET_STEPS[i]) &&
    state.couplers.every(Boolean);
}
export function physicallyStable(state: KineticState): boolean {
  if (!calibrated(state)) return false;
  return state.rotors.every(r => Math.abs(angleDelta(r.angle, targetRadians(r.detent))) < 0.025 && Math.abs(r.velocity) < 0.06);
}
export function dispatchMachine(state: KineticState, command: KineticCommand): Transition {
  if (command.type === 'reset') return { state: createMachine(command.seed ?? state.seed), event: null };
  if (state.completed || state.commands.length >= 800) return { state, event: null };
  const next: KineticState = {
    ...state, rotors: state.rotors.map(r => ({ ...r })) as KineticState['rotors'],
    couplers: [...state.couplers] as [boolean, boolean],
    commands: [...state.commands, command], lastEvent: null,
  };
  if (command.type === 'turn') {
    if (![0, 1, 2].includes(command.rotor) || ![-1, 1].includes(command.direction)) throw Error('Invalid rotor input');
    const linked = connectedRotors(command.rotor, next.couplers);
    const cost = linked.length * 3.5;
    if (next.charge < cost || next.temperature > 90) return {
      state: { ...next, lastEvent: 'overheat' }, event: 'overheat',
    };
    for (const { index, direction } of linked) {
      next.rotors[index].detent = wrappedStep(next.rotors[index].detent + command.direction * direction);
    }
    next.charge -= cost;
    next.temperature = clamp(next.temperature + linked.length * 2.2, 0, 100);
    next.stableTicks = 0;
    next.lastEvent = 'rotor-turn';
  } else if (command.type === 'coupler') {
    if (![0, 1].includes(command.link)) throw Error('Invalid coupler');
    next.couplers[command.link] = !next.couplers[command.link];
    next.temperature = clamp(next.temperature + 0.8, 0, 100);
    next.stableTicks = 0;
    next.lastEvent = next.couplers[command.link] ? 'coupler-engaged' : 'coupler-released';
  } else if (command.type === 'pulse') {
    next.pulses++;
    if (physicallyStable(next) && next.stableTicks >= 45 && next.temperature < 70 && next.charge >= 8) {
      next.capacitor = clamp(next.capacitor + 25, 0, 100);
      next.charge -= 8;
      next.temperature = clamp(next.temperature + 4.5, 0, 100);
      next.lastEvent = next.capacitor === 100 ? 'completed' : 'pulse-accepted';
      if (next.capacitor === 100) next.completed = true;
    } else {
      next.rejectedPulses++;
      next.temperature = clamp(next.temperature + 8, 0, 100);
      next.lastEvent = 'pulse-rejected';
    }
  } else {
    throw Error('Unknown machine command');
  }
  return { state: next, event: next.lastEvent };
}
/** 60Hz integration, independent of display FPS and wall clock. */
export function tickMachine(current: KineticState, steps = 1): KineticState {
  if (current.completed || !Number.isSafeInteger(steps) || steps < 0 || steps > 240) return current;
  const state: KineticState = {
    ...current, rotors: current.rotors.map(r => ({ ...r })) as KineticState['rotors'],
    couplers: [...current.couplers] as [boolean, boolean],
    commands: current.commands.slice(),
    lastEvent: null,
  };
  for (let step = 0; step < steps; step++) {
    for (const rotor of state.rotors) {
      const error = angleDelta(rotor.angle, targetRadians(rotor.detent));
      // Damped angular spring with bounded angular velocity. This makes target
      // changes have visible momentum rather than instant CSS snap rotations.
      const acceleration = 35 * error - 12.8 * rotor.velocity;
      rotor.velocity = clamp(rotor.velocity + acceleration * FIXED_DT, -8, 8);
      rotor.angle += rotor.velocity * FIXED_DT;
    }
    state.temperature = clamp(state.temperature - 3.8 * FIXED_DT, 21, 100);
    state.charge = clamp(state.charge + 2.5 * FIXED_DT, 0, 100);
    state.stableTicks = physicallyStable(state) && state.temperature < 70 ?
      Math.min(120, state.stableTicks + 1) : 0;
    state.tick++;
  }
  return state;
}
export function machineScore(state: KineticState): number {
  if (!state.completed) return 0;
  const heatPenalty = Math.round(Math.max(0, state.temperature - 25) * 2);
  return clamp(1200 - Math.floor(state.tick / 15) - state.rejectedPulses * 75 - heatPenalty, 100, 1200);
}
export function machineStatus(state: KineticState): string {
  if (state.completed) return 'CORE ONLINE / STABLE POWER TRANSFER';
  if (state.temperature >= 90) return 'OVERHEATED / WAIT FOR COOLING';
  if (!state.couplers.every(Boolean)) return 'LINKS DISCONNECTED / CALIBRATE ROTORS';
  if (!calibrated(state)) return 'PHASE MISMATCH / ADJUST DETENTS';
  if (state.stableTicks < 45) return 'ROTORS SETTLING / MAINTAIN ALIGNMENT';
  return 'PHASE-LOCK READY / CHARGE CORE';
}
