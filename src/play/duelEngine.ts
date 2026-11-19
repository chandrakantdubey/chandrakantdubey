/** Stable TypeScript contract for the shared, runtime-neutral Hex engine. */
export type Side=1|2;
export type Cell=0|Side;
export type DuelBoard=Cell[];
export type DuelStatus="waiting"|"active"|"finished";
export interface DuelSnapshot {
  board:DuelBoard;
  turn:Side;
  version:number;
  moves:number;
  status:DuelStatus;
  winner:Side|null;
  path:number[];
  players:number;
  lastMove:number|null;
}
export interface DuelMove extends DuelSnapshot {
  valid:boolean;
  reason?:string;
}
export { SIZE,CELL_COUNT,neighbors,findConnection,freshGame,place,toSnapshot,choosePracticeMove } from "./duelRules.js";
