/**
 * A deterministic teaching model for a replicated API behind a cache.
 * The simulator is intentionally synthetic; it never reports live production metrics.
 */
export type Scenario = {
  requestsPerSecond: number;
  cacheHitRate: number;
  replicas: number;
  failure: boolean;
  retries: boolean;
};

export type ModelResult = {
  incoming: number;
  cacheHits: number;
  originDemand: number;
  healthyReplicas: number;
  capacity: number;
  initialSuccess: number;
  recovered: number;
  rejected: number;
  served: number;
  successRate: number;
  utilization: number;
  failoverRequests: number;
};

export const DEFAULT_SCENARIO: Scenario = {
  requestsPerSecond: 1800,
  cacheHitRate: 42,
  replicas: 3,
  failure: false,
  retries: true,
};

const REPLICA_CAPACITY = 700; // hypothetical requests/sec
const bound = (value: number, low: number, high: number) =>
  Math.min(high, Math.max(low, Number.isFinite(value) ? value : low));

export function simulateScenario(input: Scenario): ModelResult {
  const incoming = Math.round(bound(input.requestsPerSecond, 0, 12000));
  const hitRate = bound(input.cacheHitRate, 0, 100) / 100;
  const replicas = Math.round(bound(input.replicas, 1, 8));
  const cacheHits = Math.round(incoming * hitRate);
  const originDemand = incoming - cacheHits;

  // During a short failure-detection window, the load balancer can still
  // send requests to a dead replica. They only retry once if enabled.
  const healthyReplicas = input.failure ? replicas - 1 : replicas;
  const failoverRequests = input.failure
    ? Math.round(originDemand / replicas)
    : 0;
  const capacity = healthyReplicas * REPLICA_CAPACITY;
  const initiallyRouted = originDemand - failoverRequests;
  const initialSuccess = Math.min(initiallyRouted, capacity);
  const remainingCapacity = Math.max(0, capacity - initialSuccess);
  const recovered = input.failure && input.retries
    ? Math.min(failoverRequests, remainingCapacity)
    : 0;
  const servedByOrigin = initialSuccess + recovered;
  const rejected = Math.max(0, originDemand - servedByOrigin);
  const served = cacheHits + servedByOrigin;

  return {
    incoming,
    cacheHits,
    originDemand,
    healthyReplicas,
    capacity,
    initialSuccess,
    recovered,
    rejected,
    served,
    failoverRequests,
    successRate: incoming ? (served / incoming) * 100 : 100,
    utilization: capacity ? Math.min(100, (servedByOrigin / capacity) * 100) : 0,
  };
}

export type TraceStep = {
  label: string;
  detail: string;
  tone: "neutral" | "positive" | "warning";
};

export function explainTrace(input: Scenario, model: ModelResult): TraceStep[] {
  const steps: TraceStep[] = [
    { label: "EDGE / INGRESS", detail: model.incoming.toLocaleString() + " synthetic requests/s accepted for routing", tone: "neutral" },
    { label: "CACHE / LOOKUP", detail: model.cacheHits.toLocaleString() + " requests answered without touching the origin", tone: "positive" },
  ];
  if (input.failure) {
    steps.push({
      label: "HEALTH / DETECTION",
      detail: "One application replica is unavailable; " + model.failoverRequests.toLocaleString() + " requests initially routed there",
      tone: "warning",
    });
    steps.push({
      label: "RETRY / POLICY",
      detail: input.retries
        ? model.recovered.toLocaleString() + " requests recovered within remaining healthy capacity"
        : "Retries disabled; requests to the failed replica cannot be recovered",
      tone: input.retries ? "positive" : "warning",
    });
  }
  steps.push({
    label: "ORIGIN / CAPACITY",
    detail: model.healthyReplicas + " healthy replicas × 700 req/s = " + model.capacity.toLocaleString() + " req/s available",
    tone: "neutral",
  });
  steps.push({
    label: "RESPONSE / RESULT",
    detail: model.served.toLocaleString() + " delivered · " + model.rejected.toLocaleString() + " unavailable",
    tone: model.rejected ? "warning" : "positive",
  });
  return steps;
}
