export type SiegePacketClass='standard'|'priority'|'bulk'|'unstable';
export type SiegePolicy='balanced'|'priority'|'conserve';
export type SiegeAction=SiegePolicy|'overclock'|'vent'|'firewall'|'shed-bulk';
export interface SiegeTactics {
  version:number;seed:number;policy:SiegePolicy;energy:number;heat:number;
  bandwidth:number;bufferUsed:number;overclockTicks:number;firewallTicks:number;
  cooldowns:Record<'overclock'|'vent'|'firewall'|'shed-bulk',number>;
  bulkShed:number;priorityDelivered:number;unstableDelivered:number;
  overloadedTicks:number;commands:Array<{tick:number;action:SiegeAction}>;lastTactic:string;
}
export interface SiegePacket {id:number;kind?:SiegePacketClass;age:number;col:number;row:number;enter:number;color:number;}
export interface SiegeCompatibleState {
  mode?:string;players:number;phase:string;version:number;eventId:number;lastEvent:string;score:number;
  tick:number;packets:SiegePacket[];siege?:SiegeTactics;
}
export declare const SIEGE_STRATEGY_VERSION:2;
export declare const SIEGE_ORDERS:readonly SiegeAction[];
export declare const PACKET_CLASSES:readonly SiegePacketClass[];
export declare function siegeClass(seed:number,id:number,wave?:number):SiegePacketClass;
export declare function newSiegeStrategy(seed?:number):SiegeTactics;
export declare function siegeBudget(strategy:SiegeTactics):number;
export declare function packetWeight(kind?:SiegePacketClass):number;
export declare function packetTTL(kind?:SiegePacketClass):number;
export declare function siegeProcessOrder<T extends SiegePacket>(packets:T[],strategy:SiegeTactics):T[];
export declare function siegeAdvanceResources(strategy:SiegeTactics,packets:SiegePacket[],wave?:number):SiegeTactics;
export declare function siegeOrder<T extends SiegeCompatibleState>(state:T,action:SiegeAction):T;
export declare function siegeMissImpact(packet:SiegePacket|undefined,strategy:SiegeTactics):number;
export declare function siegeDeliveryBonus(packet:SiegePacket|undefined):number;
