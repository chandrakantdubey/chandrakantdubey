import { useEffect, useRef } from "react";
import {
  advanceMesh, averageDisplacement, createMesh, type Mesh, type Pointer, type Pulse,
} from "./engine";

import type { FieldTelemetry } from "./telemetry";

interface Props {
  seed: number;
  paused: boolean;
  onTelemetry: (stats: FieldTelemetry) => void;
}

export default function FieldCanvas({ seed, paused, onTelemetry }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false, desynchronized: true });
    if (!canvas || !ctx) return;
    let alive = true;
    let raf = 0;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let mesh: Mesh = createMesh(1, 1, seed);
    let visible = true;
    let lastFrame = 0;
    let lastReport = 0;
    let elapsed = 0;
    let interactions = 0;
    let paintMs = 0;
    const pointer: Pointer = { x: 0, y: 0, active: false };
    const pulses: Pulse[] = [];
    const frameIntervals: number[] = [];
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionPreference.matches;

    const status = (): FieldTelemetry["status"] =>
      reduced ? "REDUCED MOTION" :
      paused ? "PAUSED" :
      !visible || document.hidden ? "OFFSCREEN" : "RUNNING";

    function report() {
      const sum = frameIntervals.reduce((a, b) => a + b, 0);
      const avg = frameIntervals.length ? sum / frameIntervals.length : 0;
      onTelemetry({
        fps: status() === "RUNNING" && avg ? Math.min(240, 1000 / avg) : 0,
        paintMs, nodes: mesh.nodes.length, edges: mesh.edges.length,
        width, height, dpr,
        pointer: pointer.active ? Math.round(pointer.x) + ", " + Math.round(pointer.y) : "—",
        pulses: pulses.length, interactions,
        displacement: averageDisplacement(mesh), status: status(),
      });
    }

    function render() {
      const paintStart = performance.now();
      ctx!.fillStyle = "#0a1516";
      ctx!.fillRect(0, 0, width, height);

      // Soft light stays under the geometry; no WebGL or external texture.
      const light = ctx!.createRadialGradient(
        width * 0.58, height * 0.47, 0,
        width * 0.58, height * 0.47, Math.max(width, height) * 0.7,
      );
      light.addColorStop(0, "#1a3332");
      light.addColorStop(0.52, "#0e2325");
      light.addColorStop(1, "#0a1516");
      ctx!.fillStyle = light;
      ctx!.fillRect(0, 0, width, height);

      ctx!.lineWidth = 0.8;
      ctx!.strokeStyle = "rgba(119, 184, 170, 0.24)";
      ctx!.beginPath();
      for (const edge of mesh.edges) {
        const a = mesh.nodes[edge.a];
        const b = mesh.nodes[edge.b];
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
      }
      ctx!.stroke();

      // Every second row forms a continuous interpolated contour.
      for (let row = 1; row < mesh.rows; row += 2) {
        ctx!.beginPath();
        for (let col = 0; col < mesh.columns; col++) {
          const p = mesh.nodes[row * mesh.columns + col];
          if (col === 0) ctx!.moveTo(p.x, p.y);
          else {
            const prev = mesh.nodes[row * mesh.columns + col - 1];
            const mx = (prev.x + p.x) / 2;
            const my = (prev.y + p.y) / 2;
            ctx!.quadraticCurveTo(prev.x, prev.y, mx, my);
            if (col === mesh.columns - 1) ctx!.lineTo(p.x, p.y);
          }
        }
        ctx!.strokeStyle = row % 4 === 1 ? "rgba(194, 229, 211, 0.32)" : "rgba(111, 170, 157, 0.23)";
        ctx!.lineWidth = row % 4 === 1 ? 1.25 : 0.9;
        ctx!.stroke();
      }

      for (const node of mesh.nodes) {
        const displacement = Math.hypot(node.x - node.homeX, node.y - node.homeY);
        const bright = displacement > 6;
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, bright ? 1.75 : 1.1, 0, Math.PI * 2);
        ctx!.fillStyle = bright ? "#f2aa85" : "rgba(214, 237, 219, 0.58)";
        ctx!.fill();
      }

      for (const pulse of pulses) {
        const age = elapsed - pulse.born;
        if (age < 0 || age > 1.35) continue;
        ctx!.beginPath();
        ctx!.arc(pulse.x, pulse.y, age * 420, 0, Math.PI * 2);
        ctx!.strokeStyle = "rgba(245, 160, 119, " + (0.48 * (1 - age / 1.35)) + ")";
        ctx!.lineWidth = 1.7;
        ctx!.stroke();
      }

      // Architectural registration marks: coordinates derive from actual size.
      ctx!.strokeStyle = "rgba(196, 220, 202, 0.24)";
      ctx!.lineWidth = 1;
      const marks: Array<[number, number, number, number]> = [
        [21, 21, 1, 1], [width - 21, 21, -1, 1],
        [21, height - 21, 1, -1], [width - 21, height - 21, -1, -1],
      ];
      for (const [x, y, sx, sy] of marks) {
        ctx!.beginPath();
        ctx!.moveTo(x, y + sy * 12);
        ctx!.lineTo(x, y);
        ctx!.lineTo(x + sx * 12, y);
        ctx!.stroke();
      }
      paintMs = performance.now() - paintStart;
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      mesh = createMesh(width, height, seed);
      frameIntervals.length = 0;
      lastFrame = 0;
      render();
      report();
    }

    function schedule() {
      if (alive && raf === 0 && visible && !document.hidden && !reduced && !paused) {
        raf = window.requestAnimationFrame(tick);
      }
    }

    function tick(now: number) {
      raf = 0;
      if (!alive || !visible || document.hidden || reduced || paused) return;
      if (lastFrame) {
        const interval = Math.min(60, now - lastFrame);
        frameIntervals.push(interval);
        if (frameIntervals.length > 30) frameIntervals.shift();
        const dt = Math.min(0.034, interval / 1000);
        elapsed += dt;
        advanceMesh(mesh, { dt, time: elapsed, pointer, pulses });
      }
      lastFrame = now;
      while (pulses.length && elapsed - pulses[0].born > 1.35) pulses.shift();
      render();
      if (now - lastReport > 380) {
        lastReport = now;
        report();
      }
      schedule();
    }

    function coordinates(e: PointerEvent): [number, number] {
      const rect = canvas!.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    }
    function onMove(e: PointerEvent) {
      const [x, y] = coordinates(e);
      pointer.x = x;
      pointer.y = y;
      pointer.active = e.pointerType !== "touch" || e.buttons > 0;
      if (reduced || paused) { render(); report(); }
    }
    function onDown(e: PointerEvent) {
      const [x, y] = coordinates(e);
      pointer.x = x; pointer.y = y; pointer.active = true;
      interactions += 1;
      pulses.push({ x, y, born: elapsed });
      if (pulses.length > 5) pulses.shift();
      if (reduced || paused) { render(); report(); }
    }
    function onLeave() {
      pointer.active = false;
      if (reduced || paused) { render(); report(); }
    }
    function onVisibility() {
      lastFrame = 0;
      frameIntervals.length = 0;
      report();
      schedule();
    }
    function onMotionChange(e: MediaQueryListEvent) {
      reduced = e.matches;
      if (reduced && raf) { cancelAnimationFrame(raf); raf = 0; render(); }
      lastFrame = 0;
      report();
      schedule();
    }

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(canvas);
    const intersectionObserver = new IntersectionObserver(entries => {
      visible = entries[0]?.isIntersecting ?? false;
      if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
      onVisibility();
    }, { threshold: 0.01 });
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerdown", onDown, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointercancel", onLeave);
    motionPreference.addEventListener("change", onMotionChange);
    resize();
    schedule();

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      sizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
      motionPreference.removeEventListener("change", onMotionChange);
    };
  }, [seed, paused, onTelemetry]);

  return <canvas
    ref={canvasRef}
    className="field-canvas"
    role="img"
    aria-label="Interactive spring mesh: move a mouse over the field or tap it to send a ripple through the geometry."
  />;
}
