import { GARDEN_HEIGHT, GARDEN_WIDTH, type GardenState, type LivingSpecies } from './entropyEngine';

export const ART_W = 1040;
export const ART_H = 640;
export const LEFT = 40;
export const TOP = 27;
export const FIELD_W = 960;
export const FIELD_H = 582;
export const CELL_W = FIELD_W / GARDEN_WIDTH;
export const CELL_H = FIELD_H / GARDEN_HEIGHT;

export type Cursor = { x: number; y: number };

function idx(x: number, y: number) { return y * GARDEN_WIDTH + x; }

function rgba(color: string, alpha: number) {
  // Rendering colors remain centralized in the species palette.
  const rgb = color.match(/[\da-f]{2}/gi)!.map(part => parseInt(part, 16));
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
}
export const COLOR: Record<LivingSpecies, string> = { 1: '#63efcf', 2: '#bda5ff', 3: '#efa883' };

/** Canvas painter can render an artwork at any resolution, without reading DOM state. */
export function paintEntropyGarden(ctx: CanvasRenderingContext2D, state: GardenState, cursor: Cursor | null = null, width = ART_W, height = ART_H) {
  ctx.setTransform(width / ART_W, 0, 0, height / ART_H, 0, 0);
  const atmosphere = ctx.createLinearGradient(0, 0, ART_W, ART_H);
  atmosphere.addColorStop(0, '#081525'); atmosphere.addColorStop(.5, '#151a33'); atmosphere.addColorStop(1, '#08111e');
  ctx.fillStyle = atmosphere; ctx.fillRect(0, 0, ART_W, ART_H);
  const glow = ctx.createRadialGradient(ART_W * .53, ART_H * .45, 30, ART_W * .53, ART_H * .45, 580);
  glow.addColorStop(0, '#8667c51c'); glow.addColorStop(.62, '#56baad12'); glow.addColorStop(1, '#0b152100');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, ART_W, ART_H);
  ctx.strokeStyle = 'rgba(180,199,237,.055)'; ctx.lineWidth = 1;
  for (let x = 0; x <= GARDEN_WIDTH; x++) {
    ctx.beginPath(); ctx.moveTo(LEFT + x * CELL_W, TOP); ctx.lineTo(LEFT + x * CELL_W, TOP + FIELD_H); ctx.stroke();
  }
  for (let y = 0; y <= GARDEN_HEIGHT; y++) {
    ctx.beginPath(); ctx.moveTo(LEFT, TOP + y * CELL_H); ctx.lineTo(LEFT + FIELD_W, TOP + y * CELL_H); ctx.stroke();
  }
  // Roots bridge organisms of the same species before petals are painted.
  for (let y = 0; y < GARDEN_HEIGHT; y++) for (let x = 0; x < GARDEN_WIDTH; x++) {
    const cell = state.cells[idx(x, y)];
    if (!cell.species || cell.vigor < 25) continue;
    const xx = LEFT + (x + .5) * CELL_W, yy = TOP + (y + .5) * CELL_H;
    const neighbor = state.cells[idx((x + 1) % GARDEN_WIDTH, y)];
    if (neighbor.species !== cell.species || x === GARDEN_WIDTH - 1) continue;
    ctx.strokeStyle = rgba(COLOR[cell.species], .09 + Math.min(cell.vigor, neighbor.vigor) * .0018);
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + CELL_W * .5, yy - 4, xx + CELL_W, yy); ctx.stroke();
  }
  for (let y = 0; y < GARDEN_HEIGHT; y++) for (let x = 0; x < GARDEN_WIDTH; x++) {
    const i = idx(x, y), c = state.cells[i];
    const cx = LEFT + (x + .5) * CELL_W, cy = TOP + (y + .5) * CELL_H;
    if (!c.species) {
      if (c.water > 83) {
        ctx.fillStyle = 'rgba(90,149,217,.13)'; ctx.beginPath(); ctx.arc(cx, cy, 2.1, 0, Math.PI * 2); ctx.fill();
      }
      continue;
    }
    const species = c.species, color = COLOR[species], health = c.vigor / 100;
    const size = .58 + health * .62;
    const phase = i * .61803398875 + state.tick * .07;
    const drift = Math.sin(phase) * state.climate.wind * .018;
    if (c.bloom) {
      const aura = ctx.createRadialGradient(cx, cy, 2, cx, cy, 25);
      aura.addColorStop(0, rgba(color, .42)); aura.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(cx, cy, 25, 0, Math.PI * 2); ctx.fill();
    }
    ctx.lineCap = 'round';
    if (species === 1) {
      ctx.strokeStyle = rgba(color, .27 + health * .6); ctx.lineWidth = 1 + health;
      for (let j = -1; j <= 1; j++) {
        ctx.beginPath(); ctx.moveTo(cx, cy + 6);
        ctx.quadraticCurveTo(cx + (j * 6 + drift) * size, cy - 2, cx + j * 6 * size + drift, cy - (7 + Math.sin(i + j) * 3) * size);
        ctx.stroke();
      }
      ctx.fillStyle = rgba(color, .25 + health * .7);
      ctx.beginPath(); ctx.ellipse(cx + drift, cy - 6 * size, 3.5 * size, 2.2 * size, phase * .1, 0, Math.PI * 2); ctx.fill();
    } else if (species === 2) {
      ctx.strokeStyle = rgba(color, .6 * health); ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(cx, cy + 7); ctx.quadraticCurveTo(cx + drift * 2, cy, cx + drift * 2, cy - 5 * size); ctx.stroke();
      for (let j = 0; j < 5; j++) {
        const a = j / 5 * Math.PI * 2 + phase * .07;
        ctx.fillStyle = rgba(color, .24 + health * .67);
        ctx.beginPath(); ctx.ellipse(cx + drift * 2 + Math.cos(a) * 4 * size, cy - 5 * size + Math.sin(a) * 4 * size,
          3.5 * size, 1.9 * size, a, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#f9e4ad'; ctx.beginPath(); ctx.arc(cx + drift * 2, cy - 5 * size, 1.6 * size, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.strokeStyle = rgba(color, .25 + health * .68);
      ctx.lineWidth = 1.2 + health * .6;
      for (let j = -2; j <= 2; j++) {
        ctx.beginPath(); ctx.moveTo(cx, cy + 6);
        ctx.quadraticCurveTo(cx + j * 3 + drift * 2, cy + 1, cx + j * 5 + drift * 4, cy - (9 - Math.abs(j)) * size);
        ctx.stroke();
      }
    }
    if (c.bloom >= 4) {
      ctx.fillStyle = 'rgba(255,247,208,.82)';
      ctx.beginPath(); ctx.arc(cx + 9, cy - 11, Math.min(2.6, c.bloom * .24), 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.strokeStyle = 'rgba(201,225,236,.42)'; ctx.lineWidth = 1;
  ctx.strokeRect(LEFT, TOP, FIELD_W, FIELD_H);
  if (cursor) {
    const cx = LEFT + (cursor.x + .5) * CELL_W, cy = TOP + (cursor.y + .5) * CELL_H;
    ctx.strokeStyle = '#edfbc9'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 17, cy); ctx.lineTo(cx - 11, cy); ctx.moveTo(cx + 11, cy); ctx.lineTo(cx + 17, cy); ctx.stroke();
  }
  ctx.fillStyle = '#9fbdc7'; ctx.font = '12px monospace';
  ctx.fillText('CD / ENTROPY FIELD 02', LEFT, 19);
  ctx.textAlign = 'right'; ctx.fillText(`CYCLE ${state.tick.toString().padStart(4, '0')} · ${state.seed}`, ART_W - LEFT, 19);
  ctx.textAlign = 'left';
  ctx.fillText('LIVING SYSTEM / ALL TELEMETRY SIMULATED', LEFT, ART_H - 9);
}

