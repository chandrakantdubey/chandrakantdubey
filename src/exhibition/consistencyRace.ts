/**
 * A deterministic classroom-sized model of compare-and-swap (CAS).
 * This never calls a real room, nor does it represent a production recording.
 */
export type Racer="ingress"|"egress";
export const CAS_START_VERSION=12;

export interface CasRace {
  winner:Racer;
  loser:Racer;
  startVersion:number;
  winnerVersion:number;
  finalVersion:number;
  losingExpected:number;
  conflictActual:number;
  orderedEvents:readonly string[];
}
export function simulateCasRace(winner:Racer):CasRace {
  const loser:Racer=winner==="ingress"?"egress":"ingress";
  const startVersion=CAS_START_VERSION;
  return {
    winner,loser,startVersion,winnerVersion:startVersion+1,
    finalVersion:startVersion+2,losingExpected:startVersion,conflictActual:startVersion+1,
    orderedEvents:[
      "Both operators read room state at v"+startVersion+".",
      winner.toUpperCase()+" writes against v"+startVersion+" and commits v"+(startVersion+1)+".",
      loser.toUpperCase()+" attempts v"+startVersion+"; conditional write rejected (version mismatch).",
      loser.toUpperCase()+" reloads v"+(startVersion+1)+", reapplies its independent action, and commits v"+(startVersion+2)+".",
      "Both valid actions survive; the room ends at v"+(startVersion+2)+".",
    ],
  };
}
