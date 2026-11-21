import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  GARDEN_HEIGHT, GARDEN_WIDTH,
  applyGardenCommand, advanceGarden, beginGardenReplay, stepGardenReplay, createGarden, gardenMetrics, gardenReplay,
  type GardenClimate, type GardenCommand, type GardenState,
  type GardenTool, type LivingSpecies,
} from './entropyEngine';
import { revealDiscovery } from './discoveries';
import { ART_W, ART_H, LEFT, TOP, FIELD_W, FIELD_H, CELL_W, CELL_H, COLOR, paintEntropyGarden, type Cursor } from './entropyArt';
import './entropy-garden.css';

type Brush = { tool: GardenTool; species?: LivingSpecies };
const BRUSHES: ReadonlyArray<{ label: string; note: string; key: string; brush: Brush; glyph: string }> = [
  { label: 'Mycelium', note: 'Shade + rain', key: 'mycelium', brush: { tool: 'plant', species: 1 }, glyph: '✺' },
  { label: 'Lumen', note: 'Light + warmth', key: 'lumen', brush: { tool: 'plant', species: 2 }, glyph: '✦' },
  { label: 'Windgrass', note: 'Dry + wind', key: 'grass', brush: { tool: 'plant', species: 3 }, glyph: '⟡' },
  { label: 'Rain brush', note: 'Moisture +24', key: 'water', brush: { tool: 'water' }, glyph: '◌' },
  { label: 'Nutrients', note: 'Soil +28', key: 'feed', brush: { tool: 'feed' }, glyph: '◈' },
  { label: 'Prune', note: 'Clear a patch', key: 'prune', brush: { tool: 'prune' }, glyph: '╱' },
];
const CLIMATES: Array<{ label: string; climate: GardenClimate; description: string }> = [
  { label: 'EQUINOX', climate: { rain: 53, light: 55, wind: 27 }, description: 'Balanced weather, no single species dominates.' },
  { label: 'MONSOON', climate: { rain: 88, light: 28, wind: 32 }, description: 'Mycelium expands; heat-seeking flowers struggle.' },
  { label: 'SOLSTICE', climate: { rain: 44, light: 88, wind: 42 }, description: 'Lumen blooms thrive in extended daylight.' },
  { label: 'DUST FRONT', climate: { rain: 13, light: 81, wind: 92 }, description: 'Windgrass colonizes the driest edges.' },
];

function tone(type: 'tap' | 'warning' | 'success' | 'discovery') {
  window.dispatchEvent(new CustomEvent('cd:sound-cue', { detail: { type } }));
}
function idx(x: number, y: number) { return y * GARDEN_WIDTH + x; }
/** UI uses the model as source of truth; no game state hidden in SVG/CSS. */
export default function EntropyGarden() {
  const [world, setWorld] = useState<GardenState>(() => createGarden(17));
  const live = useRef(world);
  const [running, setRunning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const importEpoch = useRef(0);
  const [brush, setBrush] = useState<Brush>({ tool: 'plant', species: 2 });
  const [climate, setClimate] = useState<GardenClimate>(world.climate);
  const [cursor, setCursor] = useState<Cursor>({ x: 26, y: 16 });
  const cursorRef = useRef<Cursor>(cursor);
  const [notice, setNotice] = useState('A seeded ecosystem. Cultivate balance, or watch one species take over.');
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const microscope = useRef<HTMLCanvasElement | null>(null);
  const lastPaintedCell = useRef<number>(-1);
  const metrics = gardenMetrics(world);
  const currentCell = world.cells[idx(cursor.x,cursor.y)];
  const organismName = currentCell.species === 1 ? 'MYCELIUM' : currentCell.species === 2 ? 'LUMEN' : currentCell.species === 3 ? 'WINDGRASS' : 'EMPTY SOIL';

  const update = useCallback((next: GardenState) => { live.current = next; setWorld(next); }, []);
  const paint = useCallback(() => {
    const element = canvas.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    // Preserve enough source resolution for a clear microscope, even when the
    // full field is compressed onto a 320px mobile viewport.
    const w = Math.max(ART_W, Math.round(rect.width * dpr));
    const h = Math.max(ART_H, Math.round(rect.height * dpr));
    if (element.width !== w || element.height !== h) { element.width = w; element.height = h; }
    const ctx = element.getContext('2d', { alpha: false });
    if (ctx) paintEntropyGarden(ctx, live.current, cursorRef.current, w, h);
    const detail = microscope.current;
    if (detail) {
      const detailCtx = detail.getContext('2d', { alpha: false });
      if (detailCtx) {
        const c = cursorRef.current;
        const centerX = LEFT + (c.x + .5) * CELL_W;
        const centerY = TOP + (c.y + .5) * CELL_H;
        const cropW = 230, cropH = 150;
        const originX = Math.max(0, Math.min(ART_W - cropW, centerX - cropW / 2));
        const originY = Math.max(0, Math.min(ART_H - cropH, centerY - cropH / 2));
        detailCtx.imageSmoothingQuality = 'high';
        detailCtx.drawImage(element, originX / ART_W * w, originY / ART_H * h,
          cropW / ART_W * w, cropH / ART_H * h, 0, 0, detail.width, detail.height);
      }
    }
  }, []);
  useEffect(() => { paint(); }, [world, cursor, paint]);
  useEffect(() => {
    const element = canvas.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(paint);
    observer.observe(element);
    return () => observer.disconnect();
  }, [paint]);
  useEffect(() => {
    if (!running) return;
    let frame = 0, last = 0, elapsed = 0;
    const loop = (time: number) => {
      if (document.hidden) { last = time; frame = requestAnimationFrame(loop); return; }
      if (!last) last = time;
      elapsed += Math.min(200, time - last); last = time;
      if (elapsed >= 180) {
        const days = Math.min(4, Math.floor(elapsed / 180));
        elapsed -= days * 180;
        const before = live.current.bloomEvents;
        const next = advanceGarden(live.current, days);
        update(next);
        if (next.bloomEvents > before && next.tick % 19 === 0) tone('success');
        if (next.tick >= 6000) { setRunning(false); setNotice('Maximum simulation cycle reached. Export or reseed.'); }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running, update]);
  const command = useCallback((action: GardenCommand) => {
    if (importing) return;
    const next = applyGardenCommand(live.current, action);
    update(next);
    tone(action.type === 'seed-storm' || (action.type === 'interact' && action.tool === 'prune') ? 'warning' : 'tap');
  }, [update, importing]);
  const reset = (seed: number) => {
    importEpoch.current++; setImporting(false);
    setRunning(false); const newWorld = createGarden(seed);
    update(newWorld); setClimate(newWorld.climate);
    setNotice('New ecosystem seeded. Different climates create different evolutionary paths.');
  };
  const getCell = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * ART_W;
    const y = (event.clientY - rect.top) / rect.height * ART_H;
    if (x < LEFT || y < TOP || x >= LEFT + FIELD_W || y >= TOP + FIELD_H) return null;
    return { x: Math.min(GARDEN_WIDTH - 1, Math.floor((x - LEFT) / CELL_W)),
      y: Math.min(GARDEN_HEIGHT - 1, Math.floor((y - TOP) / CELL_H)) };
  };
  const touch = (event: PointerEvent<HTMLCanvasElement>, force = false) => {
    if (importing) return;
    const location = getCell(event);
    if (!location) return;
    cursorRef.current = location; setCursor(location);
    if (!force && event.buttons !== 1) return;
    const index = idx(location.x, location.y);
    if (lastPaintedCell.current === index) return;
    lastPaintedCell.current = index;
    command({ type: 'interact', ...location, ...brush });
  };
  const keyOnCanvas = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (importing) return;
    let next = { ...cursorRef.current };
    if (event.key === 'ArrowRight') next.x = (next.x + 1) % GARDEN_WIDTH;
    else if (event.key === 'ArrowLeft') next.x = (next.x + GARDEN_WIDTH - 1) % GARDEN_WIDTH;
    else if (event.key === 'ArrowUp') next.y = Math.max(0, next.y - 1);
    else if (event.key === 'ArrowDown') next.y = Math.min(GARDEN_HEIGHT - 1, next.y + 1);
    else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); command({ type: 'interact', ...cursorRef.current, ...brush }); return;
    } else return;
    event.preventDefault(); cursorRef.current = next; setCursor(next);
  };
  const exportArt = () => {
    const output = document.createElement('canvas');
    output.width = 2600; output.height = 1600;
    const ctx = output.getContext('2d', { alpha: false });
    if (!ctx) { setNotice('This browser could not create an export surface.'); return; }
    paintEntropyGarden(ctx, live.current, null, output.width, output.height);
    output.toBlob(blob => {
      if (!blob) { setNotice('PNG export is not supported in this browser.'); return; }
      const link = document.createElement('a'), url = URL.createObjectURL(blob);
      link.href = url; link.download = `entropy-garden-${world.seed}-cycle-${world.tick}.png`;
      link.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
      revealDiscovery('entropy'); setNotice('Original generated artwork exported locally as PNG.');
      tone('discovery');
    }, 'image/png');
  };
  const exportReplay = () => {
    const artifact = { model: 'FICTIONAL / LOCAL SIMULATION', replay: gardenReplay(world), metrics };
    const blob = new Blob([JSON.stringify(artifact, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `entropy-garden-${world.seed}-${world.tick}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setNotice('Deterministic replay exported: same seed, commands, and final cycle produce the same world.');
  };
  const cancelImport = () => {
    importEpoch.current++;
    setImporting(false);
    setNotice('Replay import cancelled. Existing garden state was preserved.');
  };
  const importReplay = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 250_000) { setNotice('Replay file exceeds the 250KB safety limit.'); return; }
    const epoch = ++importEpoch.current;
    setRunning(false); setImporting(true); setImportProgress(0);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== 'object' || !('replay' in parsed)) throw new Error('Missing replay data');
      const replay = (parsed as { replay: ReturnType<typeof gardenReplay> }).replay;
      let session = beginGardenReplay(replay);
      // Fixed work budget keeps the browser responsive even for a replay at
      // the maximum 6000-day limit. State is committed only after validation.
      while (!session.done) {
        if (importEpoch.current !== epoch) return;
        session = stepGardenReplay(replay, session, 12, 10);
        if (session.done) break;
        setImportProgress(Math.round(session.state.tick / Math.max(1, replay.tick) * 100));
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      }
      if (importEpoch.current !== epoch) return;
      update(session.state); setClimate(session.state.climate);
      setNotice('Replay restored from local file. No data was sent to a server.');
    } catch {
      if (importEpoch.current === epoch) {
        setNotice('Replay rejected: invalid, incompatible, or corrupt file.'); tone('warning');
      }
    } finally {
      if (importEpoch.current === epoch) { setImporting(false); setImportProgress(0); }
    }
  };
  return <section className="entropy-garden" aria-busy={importing} aria-label="Entropy Garden living ecological simulator">
    <div className="entropy-header">
      <div><div className="entropy-kicker">CHAMBER 002 / BIOLOGICAL SYNTHESIS · DETERMINISTIC</div>
        <h2>THE GARDEN IS ALIVE.</h2>
        <p>Every organism consumes resources, competes, adapts, and leaves nutrients when it dies. Cultivate a diverse ecosystem—or push it into collapse.</p></div>
      <div className="entropy-control-buttons">
        <button type="button" disabled={importing} onClick={() => setRunning(v => !v)} aria-pressed={running}>{running ? 'Ⅱ PAUSE' : '▶ RUN SIMULATION'}</button>
        <button type="button" disabled={importing} onClick={() => update(advanceGarden(live.current, 1))}>STEP +1 DAY</button>
        <button type="button" disabled={importing} onClick={() => update(advanceGarden(live.current, 10))}>+10 DAYS</button>
        <button type="button" onClick={() => reset((world.seed + 1) % 2147483647)}>NEW SEED ↺</button>
      </div>
    </div>
    <div className="entropy-layout">
      <div className="entropy-visual">
        <div className="entropy-panel-top"><span>BIOME OBSERVATION ARRAY</span><span>52 × 32 CELLS / 3 SPECIES</span></div>
        <canvas ref={canvas} width={1040} height={640} role="button" tabIndex={0}
          aria-label="Editable garden: arrow keys position the cursor; Enter or Space applies the selected tool; pointer drag paints cells"
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Enter Space"
          onKeyDown={keyOnCanvas}
          onPointerDown={event => { lastPaintedCell.current = -1; event.currentTarget.setPointerCapture(event.pointerId); touch(event, true); }}
          onPointerMove={event => touch(event)} onPointerUp={() => { lastPaintedCell.current = -1; }}
          onPointerCancel={() => { lastPaintedCell.current = -1; }}
          onPointerLeave={() => { lastPaintedCell.current = -1; }}
          className="entropy-canvas"/>
        <div className="entropy-microscope">
          <div className="entropy-microscope-view"><span>MICROSCOPE / LOCAL BIOFIELD ×4</span>
            <canvas ref={microscope} width={460} height={270} aria-label={'Magnified ecological area at x ' + (cursor.x + 1) + ', y ' + (cursor.y + 1)} role="img"/>
          </div>
          <div className="entropy-microscope-stats" aria-live="off">
            <span>SELECTED CELL / {String(cursor.x + 1).padStart(2, '0')} : {String(cursor.y + 1).padStart(2, '0')}</span>
            <strong>{organismName}</strong>
            <div><span>VIGOR</span><b>{Math.round(currentCell.vigor)}%</b></div>
            <div><span>WATER</span><b>{Math.round(currentCell.water)}%</b></div>
            <div><span>SOIL NUTRIENTS</span><b>{Math.round(currentCell.nutrients)}%</b></div>
            <div><span>AGE</span><b>{currentCell.age} CYCLES</b></div>
            <small>Move the cursor or use arrow keys to inspect. Enter / Space cultivates the chosen patch.</small>
          </div>
        </div>
        <div className="entropy-legend">
          <span><i style={{ background: COLOR[1] }}/> MYCELIUM <strong>{metrics.species[0]}</strong></span>
          <span><i style={{ background: COLOR[2] }}/> LUMEN <strong>{metrics.species[1]}</strong></span>
          <span><i style={{ background: COLOR[3] }}/> WINDGRASS <strong>{metrics.species[2]}</strong></span>
          <span className="entropy-tick">CYCLE {world.tick} / 6000</span>
        </div>
        <div className="entropy-metrics">
          {([['BIODIVERSITY', metrics.diversity, '%'], ['COVERAGE', metrics.coverage, '%'],
            ['VITALITY', metrics.vitality, '%'], ['REGENERATION', metrics.regeneration, '%']] as Array<[string, number, string]>).map(([title, value, unit]) =>
            <div key={title}><span>{title}</span><strong>{value}{unit}</strong></div>)}
        </div>
      </div>
      <aside className="entropy-tools">
        <div className="entropy-kicker">HUMAN / ECOLOGICAL INTERVENTION</div>
        <h3>EVERY TOUCH CHANGES THE FUTURE.</h3>
        <p className="entropy-muted">Choose a species, water stressed regions, restore nutrients, or prune competition. The population will respond over simulated days.</p>
        <div className="entropy-brushes" role="group" aria-label="Select cultivation tool">
          {BRUSHES.map(item => <button key={item.key} type="button"
            aria-pressed={brush.tool === item.brush.tool && brush.species === item.brush.species}
            onClick={() => setBrush(item.brush)}><span className="entropy-brush-symbol">{item.glyph}</span>
            <strong>{item.label}</strong><small>{item.note}</small></button>)}
        </div>
        <div className="entropy-subhead">ENVIRONMENT / SET THE CLIMATE</div>
        <div className="entropy-presets" role="group" aria-label="Climate presets">
          {CLIMATES.map(preset => <button key={preset.label} type="button" title={preset.description}
            onClick={() => { setClimate(preset.climate); command({ type: 'climate', climate: preset.climate }); }}>{preset.label}</button>)}
        </div>
        {([['rain', 'RAINFALL'], ['light', 'SUNLIGHT'], ['wind', 'WIND SPEED']] as const).map(([id, label]) =>
          <label className="entropy-slider" key={id} htmlFor={'entropy-' + id}>
            <span>{label} <strong>{climate[id]}%</strong></span>
            <input type="range" id={'entropy-' + id} min={0} max={100} value={climate[id]}
              onChange={event => setClimate(c => ({ ...c, [id]: Number(event.target.value) }))}/>
          </label>)}
        <button className="entropy-apply" type="button" onClick={() => command({ type: 'climate', climate })}>APPLY CLIMATE →</button>
        <div className="entropy-subhead">DISTURBANCE / RESOURCE EVENTS</div>
        <button className="entropy-event" type="button" onClick={() => command({ type: 'seed-storm' })}>◈ TRIGGER LOCALIZED STORM <span>RAIN + NUTRIENT PULSE / DAMAGE</span></button>
        <div className="entropy-small-stats"><div>MOISTURE <strong>{metrics.moisture}%</strong></div>
          <div>NUTRIENTS <strong>{metrics.nutrition}%</strong></div><div>SYMBIOTIC BLOOMS <strong>{metrics.blooms}</strong></div></div>
      </aside>
    </div>
    <div className="entropy-footer">
      <div><div className="entropy-kicker">CAPTURE THE MOMENT</div>
        <p>Every image and replay is generated locally, from the same deterministic ecosystem. No account, no AI inference fees, no network upload.</p></div>
      <div className="entropy-export-controls">
        <button type="button" onClick={exportArt}>EXPORT 2600×1600 PNG ↘</button>
        <button type="button" onClick={exportReplay}>EXPORT REPLAY JSON ↘</button>
        <label className="entropy-import">IMPORT REPLAY ↗<input type="file" accept="application/json,.json"
          disabled={importing}
          onChange={event => { void importReplay(event.target.files?.[0]); event.target.value = ''; }}/></label>
        {importing && <button type="button" className="entropy-import-cancel" onClick={cancelImport}>CANCEL IMPORT · {importProgress}%</button>}
      </div>
    </div>
    <p className="entropy-notice" role="status">{importing ? 'Validating replay in bounded steps · ' + importProgress + '% · Your existing garden stays intact until completion.' : notice}</p>
    <p className="entropy-disclaimer">This is an original computational ecosystem, not a scientific model of biological populations. Simulation measurements are fictional and client-local.</p>
  </section>;
}
