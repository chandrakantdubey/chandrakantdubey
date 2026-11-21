/**
 * PACKET PANIC / SIEGE STRATEGY V2
 * Pure deterministic rules. Only solo `mode === 'siege'` uses this state;
 * never allow client tactical commands into the existing multiplayer API.
 */
export const SIEGE_STRATEGY_VERSION = 2;
export const SIEGE_ORDERS = Object.freeze(['balanced','priority','conserve','overclock','vent','firewall','shed-bulk']);
export const PACKET_CLASSES = Object.freeze(['standard','priority','bulk','unstable']);
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const HASH = (seed,id) => {
  let n = (seed ^ Math.imul(id+1,0x9e3779b1)) >>> 0;
  n ^= n>>>16; n = Math.imul(n,0x85ebca6b); n ^= n>>>13;
  return (n>>>0)/4294967296;
};
export function siegeClass(seed,id,wave=1){
  const roll = HASH(seed,id*37+wave*9);
  const threshold = wave<=2 ? [.45,.68,.87] : wave===3?[.28,.54,.77]:[.18,.44,.71];
  return roll<threshold[0]?'standard':roll<threshold[1]?'priority':roll<threshold[2]?'bulk':'unstable';
}
export function newSiegeStrategy(seed=2026){
  return {version:SIEGE_STRATEGY_VERSION,seed,policy:'balanced',energy:72,heat:16,
    bandwidth:5,bufferUsed:0,overclockTicks:0,firewallTicks:0,
    cooldowns:{overclock:0,vent:0,firewall:0,'shed-bulk':0},
    bulkShed:0,priorityDelivered:0,unstableDelivered:0,
    overloadedTicks:0,commands:[],lastTactic:'standby'};
}
export function packetWeight(kind){return kind==='bulk'?2:1;}
export function packetTTL(kind){return kind==='priority'?12:kind==='unstable'?13:kind==='bulk'?25:18;}
export function siegeBudget(strategy){
  return Math.max(2,strategy.bandwidth+(strategy.overclockTicks>0?3:0)-(strategy.firewallTicks>0?1:0)-(strategy.policy==='conserve'?2:0));
}
export function siegeProcessOrder(packets,strategy){
  if(strategy.policy!=='priority')return packets;
  const score=p=>p.kind==='priority'?0:p.kind==='unstable'?1:p.kind==='standard'?2:3;
  return packets.slice().sort((a,b)=>score(a)-score(b)||a.id-b.id);
}
export function siegeAdvanceResources(strategy,packets,wave=1){
  const next={...strategy,cooldowns:{...strategy.cooldowns}};
  const bulk=packets.filter(p=>p.kind==='bulk').length;
  const unstable=packets.filter(p=>p.kind==='unstable').length;
  const congestion=Math.max(0,packets.length-siegeBudget(next));
  next.bufferUsed=Math.min(16,packets.length);
  next.heat=clamp(next.heat + bulk*.38 + unstable*.47 + congestion*.7 + (next.overclockTicks>0?4.2:0)+wave*.12
    - (next.policy==='conserve'?2.8:1.15),0,100);
  next.energy=clamp(next.energy+(next.policy==='conserve'?2.5:1.4),0,100);
  if(next.overclockTicks>0)next.overclockTicks--;
  if(next.firewallTicks>0)next.firewallTicks--;
  for(const action of Object.keys(next.cooldowns))next.cooldowns[action]=Math.max(0,next.cooldowns[action]-1);
  if(next.heat>90)next.overloadedTicks++;
  return next;
}
export function siegeOrder(state,action){
  if(state.mode!=='siege'||state.players!==1||state.phase!=='playing'||!state.siege)return state;
  if(!SIEGE_ORDERS.includes(action))return state;
  const next={...state,packets:state.packets.map(p=>({...p})),siege:{...state.siege,
    cooldowns:{...state.siege.cooldowns},commands:[...state.siege.commands]}};
  const siege=next.siege;
  if(siege.commands.length>=100)return state;
  const costs={balanced:0,priority:0,conserve:0,overclock:24,vent:16,firewall:28,'shed-bulk':8};
  if((siege.cooldowns[action]??0)>0 || siege.energy<costs[action])return state;
  if(['balanced','priority','conserve'].includes(action)){
    if(siege.policy===action)return state;
    siege.policy=action;
  }else if(action==='overclock'){
    siege.overclockTicks=18;siege.cooldowns.overclock=45;
  }else if(action==='vent'){
    siege.heat=clamp(siege.heat-44,0,100);siege.cooldowns.vent=18;
  }else if(action==='firewall'){
    siege.firewallTicks=22;siege.cooldowns.firewall=48;
  }else if(action==='shed-bulk'){
    const before=next.packets.length;
    next.packets=next.packets.filter(p=>p.kind!=='bulk');
    const shed=before-next.packets.length;
    siege.bulkShed+=shed;next.score=Math.max(0,next.score-shed*75);
    siege.cooldowns['shed-bulk']=24;
  }
  siege.energy-=costs[action];siege.lastTactic=action;
  siege.commands.push({tick:state.tick,action});
  next.version=state.version+1;next.lastEvent='siege-order';next.eventId=state.eventId+1;
  return next;
}
export function siegeMissImpact(packet,strategy){
  const kind=packet?.kind??'standard';
  const base=kind==='priority'?13:kind==='unstable'?11:kind==='bulk'?3:6;
  return Math.max(1,Math.ceil(base*(strategy.firewallTicks>0?.4:1)));
}
export function siegeDeliveryBonus(packet){
  return packet?.kind==='priority'?170:packet?.kind==='unstable'?130:packet?.kind==='bulk'?30:0;
}
