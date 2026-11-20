/**
 * Packet Panic — deterministic, runtime-neutral routing simulation.
 * Server and browser share these rules; no client-reported scores or packet states.
 * Simulation advances on fixed wall-clock ticks, not on render frames.
 */
export const COLS = 7;
export const ROWS = 5;
export const TILE_COUNT = COLS * ROWS;
export const TICK_MS = 520;
export const ROUND_MS = 90_000;
export const MAX_TICKS = Math.ceil(ROUND_MS / TICK_MS);
export const PORT = Object.freeze({ N: 1, E: 2, S: 4, W: 8 });
export const KINDS = Object.freeze({ line: 10, corner: 3, tee: 11, cross: 15 });
const REVERSE = { 1: 4, 2: 8, 4: 1, 8: 2 };
const DELTA = { 1: [0,-1], 2: [1,0], 4: [0,1], 8: [-1,0] };

export function hashRandom(seed, step) {
  let z = (seed ^ Math.imul(step + 1, 0x9e3779b1)) >>> 0;
  z ^= z >>> 16;
  z = Math.imul(z, 0x7feb352d);
  z ^= z >>> 15;
  z = Math.imul(z, 0x846ca68b);
  return ((z ^ (z >>> 16)) >>> 0) / 4294967296;
}
export function tilePorts(tile) {
  const base = KINDS[tile.kind] ?? 10;
  const rotation = tile.rotation & 3;
  return ((base << rotation) | (base >> (4-rotation))) & 15;
}
export function makeTiles(seed) {
  return Array.from({length:TILE_COUNT}, (_,index) => {
    const row=Math.floor(index/COLS), col=index%COLS;
    const roll=hashRandom(seed,index*3);
    // The two horizontal routes are guaranteed to be buildable.
    const kind=row===1||row===3
      ? (roll<.18?"cross":roll<.46?"tee":"line")
      : (roll<.14?"cross":roll<.47?"tee":roll<.74?"corner":"line");
    const rotation=Math.floor(hashRandom(seed,index*3+1)*4);
    return {kind,rotation,col,row};
  });
}
export function newPacketGame(seed=2026, players=1) {
  const safeSeed=Number.isSafeInteger(seed)?seed>>>0:2026;
  return {
    seed:safeSeed,phase:"ready",players:players===2?2:1,
    tiles:makeTiles(safeSeed),packets:[],
    startedAt:null,tick:0,version:0,
    integrity:100,score:0,delivered:0,missed:0,streak:0,bestStreak:0,
    spawned:0,patches:3,incidents:0,lastFault:null,faultAtTick:-99,
    lastEvent:"ready",eventId:0,
  };
}
export function beginPacketGame(state, now=Date.now()) {
  if(state.phase!=="ready" || !Number.isFinite(now))return state;
  return {...state,phase:"playing",startedAt:Math.floor(now),tick:0,version:state.version+1,
    lastEvent:"launch",eventId:state.eventId+1};
}
export function rotatePacketTile(state,index) {
  if(state.phase!=="playing"||!Number.isInteger(index)||index<0||index>=TILE_COUNT)return state;
  const tiles=state.tiles.slice(),tile=tiles[index];
  tiles[index]={...tile,rotation:(tile.rotation+1)&3};
  return {...state,tiles,version:state.version+1,lastEvent:"rotate",eventId:state.eventId+1};
}
export function patchPacketNetwork(state) {
  if(state.phase!=="playing"||state.patches<=0||state.integrity>=100)return state;
  return {...state,integrity:Math.min(100,state.integrity+22),patches:state.patches-1,
    score:state.score+40,version:state.version+1,lastEvent:"patch",eventId:state.eventId+1};
}
export function waveForTick(tick) {
  return Math.min(3,1+Math.floor(tick*TICK_MS/30_000));
}
export function elapsedMs(state,now=Date.now()){
  if(state.startedAt===null)return 0;
  return Math.max(0,Math.min(ROUND_MS,now-state.startedAt));
}
export function timeRemaining(state,now=Date.now()) {
  return state.phase==="ready"?ROUND_MS:Math.max(0,ROUND_MS-elapsedMs(state,now));
}
function recordMiss(s) {
  s.missed++;
  s.integrity=Math.max(0,s.integrity-6);
  s.streak=0;s.lastEvent="dropped";s.eventId++;
}
function recordDelivery(s) {
  s.delivered++;s.streak++;s.bestStreak=Math.max(s.bestStreak,s.streak);
  s.score+=120+Math.min(s.streak-1,8)*30;
  s.integrity=Math.min(100,s.integrity+2);
  s.lastEvent="delivered";s.eventId++;
}
function exitPort(mask,entry,color,row) {
  // Keep straight when possible, then gently steer toward the destination lane.
  const order = [2,row>(color===0?1:3)?1:4,row<(color===0?1:3)?4:1,8];
  for(const direction of order)if(direction!==entry&&(mask&direction))return direction;
  return 0;
}
function nextTick(s) {
  s.tick++;
  const wave=waveForTick(s.tick);
  const every=wave===1?9:wave===2?7:5;
  // A pulse starts at the edge; the player sees its full trip through the network.
  if(s.tick%every===1 && s.packets.length<16) {
    const color=s.spawned%2, row=color===0?1:3;
    s.packets.push({id:s.spawned+1,col:0,row,enter:8,color,age:0});
    s.spawned++;
  }
  const next=[];
  for(const p of s.packets) {
    const index=p.row*COLS+p.col;
    const mask=tilePorts(s.tiles[index]);
    const output=(mask&p.enter)?exitPort(mask,p.enter,p.color,p.row):0;
    if(!output||p.age>=17){recordMiss(s);continue;}
    const [dx,dy]=DELTA[output],col=p.col+dx,row=p.row+dy;
    if(col===COLS && output===2 && row===(p.color===0?1:3)){
      recordDelivery(s);continue;
    }
    if(col<0||col>=COLS||row<0||row>=ROWS){recordMiss(s);continue;}
    const enter=REVERSE[output];
    if(!(tilePorts(s.tiles[row*COLS+col])&enter)){recordMiss(s);continue;}
    next.push({...p,col,row,enter,age:p.age+1});
  }
  s.packets=next;
  if(wave>=2 && s.tick%32===0){
    const index=Math.floor(hashRandom(s.seed,s.tick*13)*TILE_COUNT);
    const tile=s.tiles[index];
    s.tiles[index]={...tile,rotation:(tile.rotation+1)&3};
    s.lastFault=index;s.faultAtTick=s.tick;s.incidents++;
    s.lastEvent="incident";s.eventId++;
  }
  if(s.integrity<=0){
    s.integrity=0;s.phase="lost";s.packets=[];
    s.lastEvent="outage";s.eventId++;
  }
  if(s.tick>=MAX_TICKS && s.phase==="playing"){
    s.phase="won";s.packets=[];
    s.score+=Math.round(s.integrity*10);
    s.lastEvent="survived";s.eventId++;
  }
}
/**
 * Idempotent with respect to absolute time. Clients may animate between snapshots
 * but only the server decides which packets were delivered.
 */
export function advancePacketGame(state,now=Date.now()){
  if(state.phase!=="playing"||state.startedAt===null||!Number.isFinite(now))return state;
  const target=Math.min(MAX_TICKS,Math.floor(Math.max(0,now-state.startedAt)/TICK_MS));
  if(target<=state.tick)return state;
  const next={...state,tiles:state.tiles.slice(),packets:state.packets.map(p=>({...p}))};
  while(next.tick<target&&next.phase==="playing")nextTick(next);
  next.version=state.version+1;
  return next;
}
