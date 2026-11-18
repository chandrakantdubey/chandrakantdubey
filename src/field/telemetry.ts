/** Live measurements produced by the browser renderer; no fake infrastructure data. */
export interface FieldTelemetry {
  fps: number;
  paintMs: number;
  nodes: number;
  edges: number;
  dpr: number;
  width: number;
  height: number;
  pointer: string;
  pulses: number;
  interactions: number;
  displacement: number;
  status: "RUNNING" | "PAUSED" | "OFFSCREEN" | "REDUCED MOTION";
}

export const EMPTY_TELEMETRY: FieldTelemetry = {
  fps: 0, paintMs: 0, nodes: 0, edges: 0, dpr: 1,
  width: 0, height: 0, pointer: "—", pulses: 0, interactions: 0,
  displacement: 0, status: "PAUSED",
};
