/**
 * FIELD 01
 * A bounded spring mesh. Deterministic topology and initial conditions.
 * The browser renderer is intentionally separate from this pure simulation.
 */
export interface MeshNode {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
}
export interface MeshEdge { a: number; b: number }
export interface Mesh { nodes: MeshNode[]; edges: MeshEdge[]; columns: number; rows: number }
export interface Pointer { x: number; y: number; active: boolean }
export interface Pulse { x: number; y: number; born: number }
export interface StepInput {
  dt: number;
  time: number;
  pointer: Pointer;
  pulses: readonly Pulse[];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

/** Mulberry32, with unsigned 32-bit seed semantics. */
export function randomFromSeed(seed: number): () => number {
  let state = (seed >>> 0);
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let x = Math.imul(state ^ (state >>> 15), 1 | state);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Grid neighbor edges are O(N), not O(N²) all-pairs connections.
 * Limits keep memory and draw calls bounded even on very large displays.
 */
export function createMesh(width: number, height: number, seed: number): Mesh {
  const w = clamp(width, 1, 4096);
  const h = clamp(height, 1, 2048);
  const columns = Math.max(5, Math.min(23, Math.floor(w / 54) + 1));
  const rows = Math.max(5, Math.min(15, Math.floor(h / 54) + 1));
  const dx = w / (columns - 1);
  const dy = h / (rows - 1);
  const jitter = Math.min(dx, dy) * 0.13;
  const next = randomFromSeed(seed);
  const nodes: MeshNode[] = [];
  const edges: MeshEdge[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const homeX = dx * x + (next() - 0.5) * jitter;
      const homeY = dy * y + (next() - 0.5) * jitter;
      nodes.push({
        homeX, homeY, x: homeX, y: homeY, vx: 0, vy: 0,
        phase: next() * Math.PI * 2,
      });
      const index = y * columns + x;
      if (x > 0) edges.push({ a: index - 1, b: index });
      if (y > 0) edges.push({ a: index - columns, b: index });
      if (y > 0 && x > 0 && (x + y) % 2 === 0) {
        edges.push({ a: index - columns - 1, b: index });
      }
      if (y > 0 && x < columns - 1 && (x + y) % 2 === 1) {
        edges.push({ a: index - columns + 1, b: index });
      }
    }
  }
  return { nodes, edges, columns, rows };
}

/** Semi-implicit Euler with frame-time clamping and exponential damping. */
export function advanceMesh(mesh: Mesh, input: StepInput): void {
  const dt = clamp(input.dt, 0, 0.034);
  if (dt === 0) return;
  const damping = Math.exp(-8.8 * dt);
  const pointerRadius = 158;
  const pointerRadiusSq = pointerRadius * pointerRadius;
  const time = Number.isFinite(input.time) ? input.time : 0;

  for (const node of mesh.nodes) {
    const idleX = Math.sin(time * 0.47 + node.phase) * 3.2;
    const idleY = Math.cos(time * 0.39 + node.phase) * 3.2;
    let fx = (node.homeX + idleX - node.x) * 37;
    let fy = (node.homeY + idleY - node.y) * 37;

    if (input.pointer.active) {
      const vx = node.x - input.pointer.x;
      const vy = node.y - input.pointer.y;
      const distSq = vx * vx + vy * vy;
      if (distSq > 0.1 && distSq < pointerRadiusSq) {
        const dist = Math.sqrt(distSq);
        const falloff = Math.pow(1 - dist / pointerRadius, 2);
        const impulse = 2200 * falloff / dist;
        fx += vx * impulse;
        fy += vy * impulse;
      }
    }

    for (const pulse of input.pulses) {
      const age = time - pulse.born;
      if (age < 0 || age > 1.35) continue;
      const dx = node.x - pulse.x;
      const dy = node.y - pulse.y;
      const dist = Math.hypot(dx, dy);
      const front = age * 420;
      const delta = (dist - front) / 38;
      const wave = Math.exp(-delta * delta) * (1 - age / 1.35);
      if (dist > 0.5) {
        fx += (dx / dist) * wave * 3600;
        fy += (dy / dist) * wave * 3600;
      }
    }
    node.vx = (node.vx + fx * dt) * damping;
    node.vy = (node.vy + fy * dt) * damping;
    node.x += node.vx * dt;
    node.y += node.vy * dt;
  }
}

export function averageDisplacement(mesh: Mesh): number {
  if (!mesh.nodes.length) return 0;
  let total = 0;
  for (const n of mesh.nodes) total += Math.hypot(n.x - n.homeX, n.y - n.homeY);
  return total / mesh.nodes.length;
}

export function normalizeSeed(seed: number): number {
  return clamp(Math.floor(seed), 1, 999999);
}
