import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  FIXED_DT, createMachine, dispatchMachine, tickMachine,
  machineScore, machineStatus, physicallyStable, TARGET_STEPS,
  type KineticCommand, type KineticState, type RotorIndex,
} from './kineticEngine';
import { revealDiscovery } from './discoveries';
import './kinetic-chamber.css';

const ROTOR_NAMES = ['THE HALO', 'THE ORBIT', 'THE HEART'] as const;
const rotorColors = ['#f6ad8d', '#b8a6ff', '#d9f6a5'] as const;
const RADII = [264, 198, 128] as const;

function signal(type: 'tap' | 'warning' | 'success' | 'discovery') {
  window.dispatchEvent(new CustomEvent('cd:sound-cue', { detail: { type } }));
}
function degrees(rad: number) { return (rad * 180) / Math.PI; }

/** A bounded, accessible interface over the deterministic 60Hz engine. */
export default function KineticChamber() {
  const [state, setState] = useState<KineticState>(() => createMachine(17));
  const live = useRef<KineticState>(state);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [instructions, setInstructions] = useState(false);
  const gesture = useRef<{ index: RotorIndex; pointerId: number; angle: number } | null>(null);
  const svg = useRef<SVGSVGElement | null>(null);
  const delivered = useRef(false);

  const command = useCallback((cmd: KineticCommand) => {
    const transition = dispatchMachine(live.current, cmd);
    live.current = transition.state;
    setState(transition.state);
    if (transition.event === 'pulse-accepted' || transition.event === 'completed') signal('success');
    else if (transition.event === 'pulse-rejected' || transition.event === 'overheat') signal('warning');
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    // Advances fixed physics ticks regardless of frame rate; caps work after
    // tab suspension. Rendering is sampled at 30fps or 8fps reduced motion.
    let frame = 0;
    let last = 0;
    let accumulator = 0;
    let sincePaint = 0;
    const interval = reducedMotion ? 1 / 8 : 1 / 30;
    const loop = (timestamp: number) => {
      if (document.hidden) {
        last = timestamp;
        frame = requestAnimationFrame(loop);
        return;
      }
      if (!last) last = timestamp;
      const elapsed = Math.min(0.1, Math.max(0, (timestamp - last) / 1000));
      last = timestamp;
      accumulator += elapsed;
      sincePaint += elapsed;
      let ticks = 0;
      while (accumulator >= FIXED_DT && ticks < 6) {
        accumulator -= FIXED_DT;
        ticks++;
      }
      if (ticks && !live.current.completed) {
        live.current = tickMachine(live.current, ticks);
        if (sincePaint >= interval) {
          setState(live.current);
          sincePaint = 0;
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  useEffect(() => {
    if (!state.completed || delivered.current) return;
    delivered.current = true;
    revealDiscovery('mechanism');
  }, [state.completed]);

  const pointerAngle = (event: PointerEvent<SVGCircleElement>) => {
    const element = svg.current;
    if (!element) return 0;
    const matrix = element.getScreenCTM();
    if (!matrix) return 0;
    const coords = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return Math.atan2(coords.y - 360, coords.x - 400);
  };
  const startDrag = (event: PointerEvent<SVGCircleElement>, index: RotorIndex) => {
    gesture.current = { index, pointerId: event.pointerId, angle: pointerAngle(event) };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const endDrag = (event: PointerEvent<SVGCircleElement>) => {
    const initial = gesture.current;
    gesture.current = null;
    if (!initial || initial.pointerId !== event.pointerId) return;
    const delta = Math.atan2(Math.sin(pointerAngle(event) - initial.angle), Math.cos(pointerAngle(event) - initial.angle));
    command({ type: 'turn', rotor: initial.index, direction: delta < -0.13 ? -1 : 1 });
  };

  const stable = physicallyStable(state);
  const ready = stable && state.stableTicks >= 45 && state.temperature < 70 && state.charge >= 8;
  const status = machineStatus(state);
  const reset = () => { delivered.current = false; command({ type: 'reset' }); };

  return <section className="kinetic" aria-label="Interactive deterministic kinetic machine">
    <div className="kinetic-topline">
      <span>CHAMBER 001 / KINETIC CONVERGENCE</span>
      <button type="button" onClick={() => setInstructions(v => !v)} aria-expanded={instructions}>
        {instructions ? 'CLOSE GUIDE −' : 'OPERATING MANUAL +'}
      </button>
    </div>
    {instructions && <div className="kinetic-guide">
      <strong>PHASE SYNCHRONIZATION PROTOCOL</strong>
      <p>Three massive inertial rotors must reach target detents of 90°, 180° and 270°. Engaged gear couplers reverse adjacent motion, so turning one ring changes the others. Disconnect links to calibrate independently, then reconnect the entire train. Once every rotor settles, send four clean power pulses to charge the central core. Pulses sent before phase lock are rejected and produce heat. Excess heat blocks adjustments until the system cools.</p>
      <p>Touch or drag a rotor to turn it, or use the accessible CW/CCW controls. There is no real machinery, no external service and no hidden network activity.</p>
    </div>}
    <div className="kinetic-layout">
      <div className="kinetic-stage">
        <div className="kinetic-stage-header"><span>REACTIVE STRUCTURE</span><span>DETERMINISTIC / 60HZ ENGINE</span></div>
        <svg ref={svg} viewBox="0 0 800 720" className="kinetic-art" role="img" aria-label="Three polished metal concentric rotor assemblies around a luminous energy core">
          <defs>
            <radialGradient id="kHalo"><stop stopColor="#9675d9" stopOpacity=".28"/><stop offset=".65" stopColor="#a99afe" stopOpacity=".11"/><stop offset="1" stopColor="#070d1a" stopOpacity="0"/></radialGradient>
            <linearGradient id="kMetal" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#e9effb"/><stop offset=".19" stopColor="#6a7494"/><stop offset=".31" stopColor="#fafcff"/>
              <stop offset=".51" stopColor="#212a45"/><stop offset=".73" stopColor="#9b9bc7"/><stop offset="1" stopColor="#edf1fb"/>
            </linearGradient>
            <radialGradient id="kCore"><stop stopColor={state.completed ? '#efffb9' : '#f1e3ff'} stopOpacity=".92"/>
              <stop offset=".33" stopColor={state.completed ? '#99e79c' : '#ae93f9'} stopOpacity=".84"/>
              <stop offset="1" stopColor="#29204e" stopOpacity=".2"/></radialGradient>
            <filter id="kBloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
          </defs>
          <circle cx="400" cy="360" r="326" fill="url(#kHalo)"/>
          {Array.from({ length: 18 }, (_, i) => <line key={i} x1="400" y1="42" x2="400" y2="54"
            transform={`rotate(${i * 20} 400 360)`} stroke="#b8bbd6" strokeOpacity=".38" strokeWidth="2"/>)}
          <circle cx="400" cy="360" r="302" fill="none" stroke="#8b86ba" strokeOpacity=".22" strokeDasharray="1 10"/>
          {state.rotors.map((rotor, i) => {
            const radius = RADII[i];
            const rotation = reducedMotion ? rotor.detent * 90 : degrees(rotor.angle);
            const accent = rotorColors[i];
            const onTarget = rotor.detent === TARGET_STEPS[i];
            return <g key={i} transform={`rotate(${rotation} 400 360)`}>
              <circle cx="400" cy="360" r={radius} fill="none" stroke="#aa9eea" strokeOpacity=".21" strokeWidth="34" filter="url(#kBloom)"/>
              <circle cx="400" cy="360" r={radius} fill="none" stroke="url(#kMetal)" strokeWidth="18"/>
              <circle cx="400" cy="360" r={radius} fill="none" stroke={accent} strokeOpacity={onTarget ? '.95' : '.43'} strokeWidth="3" strokeDasharray={i === 0 ? '79 18' : i === 1 ? '37 16' : '14 11'}/>
              <circle cx="400" cy="360" r={radius + 15} fill="none" stroke="#ffffff" strokeOpacity=".22" strokeWidth="1.3" strokeDasharray="2 9"/>
              <path d={`M400 ${360 - radius - 26} L391 ${360 - radius - 5} L409 ${360 - radius - 5} Z`}
                fill={accent} stroke="#fff" strokeWidth="1"/>
              {Array.from({ length: 8 + i * 4 }, (_, tooth) => <line key={tooth}
                x1="400" y1={360 - radius - 7} x2="400" y2={360 - radius + 7}
                transform={`rotate(${tooth * (360 / (8 + i * 4))} 400 360)`}
                stroke="#f2efff" strokeOpacity=".48" strokeWidth="3"/>)}
              <circle cx="400" cy="360" r={radius} fill="none" stroke="transparent" strokeWidth="42"
                style={{ cursor: 'grab', touchAction: 'none', pointerEvents: 'stroke' }} aria-hidden="true"
                onPointerDown={event => startDrag(event, i as RotorIndex)} onPointerUp={endDrag}
                onPointerCancel={() => { gesture.current = null; }}/>
            </g>;
          })}
          <circle cx="400" cy="360" r="83" fill="#0c1125" stroke="#ded2ff" strokeWidth="3"/>
          <circle cx="400" cy="360" r={75 + state.capacitor * .09} fill="url(#kCore)" opacity={state.completed ? '1' : '.64'} filter="url(#kBloom)"/>
          <circle cx="400" cy="360" r="63" fill="none" stroke={ready ? '#e0fda7' : '#beb3f2'} strokeWidth="2" strokeDasharray="4 9"/>
          <text x="400" y="357" textAnchor="middle" fill="#f7f7fa" fontFamily="monospace" fontSize="30" fontWeight="700">{Math.round(state.capacitor)}%</text>
          <text x="400" y="382" textAnchor="middle" fill="#dde4ee" fontFamily="monospace" fontSize="12">CORE CHARGE</text>
          <text x="400" y="687" textAnchor="middle" fill="#abbcd2" fontFamily="monospace" fontSize="14">DRAG RINGS / CONTROL BELOW / CONNECT THE TRAIN</text>
        </svg>
        <div className="kinetic-stage-footer">
          <div className="kinetic-meter"><span>PHASE LOCK</span><strong>{Math.round(Math.min(100, state.stableTicks / 45 * 100))}%</strong>
            <i><b style={{ width: Math.min(100, state.stableTicks / 45 * 100) + '%' }}/></i></div>
          <div className="kinetic-meter"><span>CORE CAPACITOR</span><strong>{state.capacitor}%</strong>
            <i><b style={{ width: state.capacitor + '%' }}/></i></div>
        </div>
      </div>
      <div className="kinetic-console">
        <div className="kinetic-heading"><span>OPERATOR CONSOLE / ACTIVE</span><h2>ONE MACHINE. MANY CONSEQUENCES.</h2>
          <p>Calibrate the gear train. Manage heat and stored energy. Find phase lock and charge the heart.</p></div>
        <div className={'kinetic-status ' + (state.completed ? 'kinetic-status-win' : '')} role="status" aria-live="polite">
          <span aria-hidden="true">{state.completed ? '◆' : '◉'}</span> {status}
        </div>
        <div className="kinetic-rotor-controls">
          {state.rotors.map((rotor, i) => <div className="kinetic-rotor" key={i}>
            <div className="kinetic-rotor-header"><span style={{ color: rotorColors[i] }}>{String(i + 1).padStart(2, '0')} / {ROTOR_NAMES[i]}</span>
              <strong>{rotor.detent * 90}° <small>/ TARGET {TARGET_STEPS[i] * 90}°</small></strong></div>
            <div className="kinetic-rotor-actions"><button type="button" onClick={() => command({ type: 'turn', rotor: i as RotorIndex, direction: -1 })}
              disabled={state.completed || state.temperature > 90} aria-label={`Turn ${ROTOR_NAMES[i]} counterclockwise`}>↶ CCW</button>
              <button type="button" onClick={() => command({ type: 'turn', rotor: i as RotorIndex, direction: 1 })}
                disabled={state.completed || state.temperature > 90} aria-label={`Turn ${ROTOR_NAMES[i]} clockwise`}>CW ↷</button></div>
          </div>)}
        </div>
        <div className="kinetic-couplers"><span>MECHANICAL LINKAGES</span>
          {state.couplers.map((linked, i) => <button type="button" key={i} aria-pressed={linked}
            disabled={state.completed} onClick={() => command({ type: 'coupler', link: i as 0 | 1 })}>
            <span>{i === 0 ? 'HALO ↔ ORBIT' : 'ORBIT ↔ HEART'}</span><strong>{linked ? '● ENGAGED' : '○ OPEN'}</strong>
          </button>)}
        </div>
        <div className="kinetic-resources">
          <div><span>TEMPERATURE</span><strong className={state.temperature > 70 ? 'kinetic-hot' : ''}>{Math.round(state.temperature)} °C</strong></div>
          <div><span>ENERGY RESERVE</span><strong>{Math.round(state.charge)}%</strong></div>
          <div><span>REJECTED PULSES</span><strong>{state.rejectedPulses}</strong></div>
          <div><span>SIMULATION TIME</span><strong>{(state.tick * FIXED_DT).toFixed(1)}s</strong></div>
        </div>
        <button className="kinetic-pulse" type="button" disabled={state.completed || state.commands.length >= 800}
          onClick={() => command({ type: 'pulse' })}>{state.completed ? 'CORE STABILIZED ◆' : ready ? 'INJECT POWER PULSE ✦' : 'ATTEMPT POWER PULSE ✦'}</button>
        <div className="kinetic-footer"><span>POWER TRANSFERS {state.pulses - state.rejectedPulses} / 4 · SCORE {machineScore(state)}</span>
          <button type="button" onClick={reset}>REINITIALIZE ↻</button></div>
        <p className="kinetic-disclaimer">An original simulated mechanism. Movement, thermal state and charge are modeled locally; no real hardware or accounts are controlled.</p>
      </div>
    </div>
  </section>;
}
