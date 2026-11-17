import type { Scenario } from "./simulate";

export type ScenarioPreset = {
  id: string;
  label: string;
  description: string;
  configuration: Scenario;
};

export const SCENARIO_PRESETS: readonly ScenarioPreset[] = [
  {
    id: "baseline",
    label: "Steady state",
    description: "Moderate traffic with healthy replicas",
    configuration: {
      requestsPerSecond: 1800,
      cacheHitRate: 42,
      replicas: 3,
      failure: false,
      retries: true,
    },
  },
  {
    id: "cache-bypass",
    label: "Cache bypass",
    description: "Origin saturation without cache offload",
    configuration: {
      requestsPerSecond: 4200,
      cacheHitRate: 0,
      replicas: 3,
      failure: false,
      retries: true,
    },
  },
  {
    id: "node-outage",
    label: "Node outage",
    description: "One failed replica, retries disabled",
    configuration: {
      requestsPerSecond: 2100,
      cacheHitRate: 20,
      replicas: 2,
      failure: true,
      retries: false,
    },
  },
  {
    id: "scale-out",
    label: "Scale out",
    description: "High traffic with extra capacity",
    configuration: {
      requestsPerSecond: 5000,
      cacheHitRate: 55,
      replicas: 5,
      failure: true,
      retries: true,
    },
  },
];

export function matchingPreset(scenario: Scenario): string | null {
  const preset = SCENARIO_PRESETS.find(({ configuration }) =>
    configuration.requestsPerSecond === scenario.requestsPerSecond &&
    configuration.cacheHitRate === scenario.cacheHitRate &&
    configuration.replicas === scenario.replicas &&
    configuration.failure === scenario.failure &&
    configuration.retries === scenario.retries
  );
  return preset?.id ?? null;
}
