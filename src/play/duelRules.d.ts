import type {Side,Cell,DuelSnapshot,DuelMove} from "./duelEngine";
export declare const SIZE:7;
export declare const CELL_COUNT:49;
export declare function neighbors(index:number):number[];
export declare function findConnection(board:readonly Cell[],side:Side):number[];
export declare function freshGame(players?:number):DuelSnapshot;
export declare function place(snapshot:DuelSnapshot,side:Side,index:number):DuelMove;
export declare function toSnapshot(move:DuelMove):DuelSnapshot;
export declare function choosePracticeMove(snapshot:DuelSnapshot):number;
