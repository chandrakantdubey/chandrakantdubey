import type {PacketGameState} from './packetEngine.js';
export declare function validateCoopAction(action:'pair'|'shield',player:1|2,game:PacketGameState,index?:number):string|null;
