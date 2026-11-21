import type {SiegeTactics,SiegePacketClass} from "./siegeStrategy.js";
export type PacketKind = "line" | "corner" | "tee" | "cross";
export type PacketPhase = "ready" | "playing" | "won" | "lost";
export interface PacketTile {kind:PacketKind;rotation:number;col:number;row:number;}
export interface PacketEntity {id:number;col:number;row:number;enter:number;color:number;age:number;kind?:SiegePacketClass;}
export interface CoopResources {pairCharges:number;shieldCharges:number;pendingShields:number;blockedFaults:number;}
export interface PacketGameState {
  seed:number;phase:PacketPhase;players:number;tiles:PacketTile[];packets:PacketEntity[];
  mode?:"quick"|"siege";roundMs?:number;siege?:SiegeTactics;coop?:CoopResources;
  startedAt:number|null;tick:number;version:number;integrity:number;score:number;delivered:number;
  missed:number;streak:number;bestStreak:number;spawned:number;patches:number;
  incidents:number;lastFault:number|null;faultAtTick:number;lastEvent:string;eventId:number;
}
export declare const COLS:7;
export declare const ROWS:5;
export declare const TILE_COUNT:35;
export declare const TICK_MS:520;
export declare const ROUND_MS:90000;
export declare const SIEGE_MS:240000;
export declare const MAX_TICKS:number;
export declare const PORT:Readonly<{N:1;E:2;S:4;W:8}>;
export declare const KINDS:Readonly<{line:10;corner:3;tee:11;cross:15}>;
export declare function hashRandom(seed:number,step:number):number;
export declare function tilePorts(tile:PacketTile):number;
export declare function makeTiles(seed:number):PacketTile[];
export declare function newPacketGame(seed?:number,players?:number):PacketGameState;
export declare function newSiegeGame(seed?:number):PacketGameState;
export declare function newCoopGame(seed?:number,players?:number):PacketGameState;
export declare function pairRotateCoop(state:PacketGameState,index:number):PacketGameState;
export declare function shieldCoopFault(state:PacketGameState):PacketGameState;
export declare function beginPacketGame(state:PacketGameState,now?:number):PacketGameState;
export declare function rotatePacketTile(state:PacketGameState,index:number):PacketGameState;
export declare function patchPacketNetwork(state:PacketGameState):PacketGameState;
export declare function waveForTick(tick:number,mode?:"quick"|"siege"):number;
export declare function elapsedMs(state:PacketGameState,now?:number):number;
export declare function timeRemaining(state:PacketGameState,now?:number):number;
export declare function advancePacketGame(state:PacketGameState,now?:number):PacketGameState;
