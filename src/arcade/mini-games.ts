export type EncounterMove = "attack" | "guard";
export type EncounterState = {
  hero: number;
  enemy: number;
  turn: number;
  log: string;
};

export const INITIAL_ENCOUNTER: EncounterState = {
  hero: 100,
  enemy: 100,
  turn: 0,
  log: "A wild rival approaches. Choose your move.",
};

const ATTACK_DAMAGE = [21, 16, 27, 18] as const;
const COUNTER_DAMAGE = [9, 13, 7, 11] as const;

export function encounterFinished(state: EncounterState): boolean {
  return state.enemy <= 0 || state.hero <= 0;
}

/** Deterministic, original mini-game. No remote services or real account state. */
export function resolveTurn(current: EncounterState, move: EncounterMove): EncounterState {
  if (encounterFinished(current)) return current;
  const nextTurn = current.turn + 1;
  const guarding = move === "guard";
  const dealt = guarding ? 6 : ATTACK_DAMAGE[current.turn % ATTACK_DAMAGE.length];
  const enemy = Math.max(0, current.enemy - dealt);
  const incoming = enemy === 0 ? 0 : guarding ? 4 : COUNTER_DAMAGE[current.turn % COUNTER_DAMAGE.length];
  const hero = Math.max(0, current.hero - incoming);
  return {
    hero,
    enemy,
    turn: nextTurn,
    log:
      enemy === 0 ? "VICTORY! Rival defeated." :
      hero === 0 ? "OUT OF ENERGY — restart to play again." :
      guarding ? "You guarded. Countered for " + dealt + " damage." :
      "Hit for " + dealt + ". Rival countered for " + incoming + ".",
  };
}

export const advanceRoute = (progress: number): number => {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(100, Math.max(0, progress + 2));
};
