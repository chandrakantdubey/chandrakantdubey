import assert from "node:assert/strict";
import {
  COLS,ROWS,TILE_COUNT,TICK_MS,ROUND_MS,MAX_TICKS,
  hashRandom,makeTiles,tilePorts,newPacketGame,beginPacketGame,rotatePacketTile,
  patchPacketNetwork,advancePacketGame,elapsedMs,timeRemaining,waveForTick,
} from "../src/play/packetEngine.js";

assert.equal(COLS,7);assert.equal(ROWS,5);assert.equal(TILE_COUNT,35);
assert.equal(TICK_MS,520);assert.equal(ROUND_MS,90_000);
assert.equal(MAX_TICKS,Math.ceil(ROUND_MS/TICK_MS));
assert.equal(waveForTick(0),1);
assert.equal(waveForTick(Math.ceil(32_000/TICK_MS)),2);
assert.equal(waveForTick(Math.ceil(61_000/TICK_MS)),3);
assert.equal(hashRandom(17,9),hashRandom(17,9));
assert.notEqual(hashRandom(17,9),hashRandom(17,10));
for(let seed=0;seed<100;seed++){
  const a=makeTiles(seed),b=makeTiles(seed);
  assert.deepEqual(a,b);
  assert.equal(a.length,TILE_COUNT);
  for(const [i,tile] of a.entries()){
    assert.equal(tile.col,i%COLS);
    assert.equal(tile.row,Math.floor(i/COLS));
    assert.ok(tile.rotation>=0&&tile.rotation<4);
    assert.ok([2,3,4].includes(tilePorts(tile).toString(2).replace(/0/g,"").length));
  }
  const game=newPacketGame(seed);
  assert.equal(game.phase,"ready");assert.equal(game.patches,3);
  assert.equal(advancePacketGame(game,9999),game);
  assert.equal(rotatePacketTile(game,2),game,"cannot rotate before start");
}
const started=beginPacketGame(newPacketGame(55),100000);
assert.equal(started.phase,"playing");assert.equal(started.startedAt,100000);
assert.equal(beginPacketGame(started,100001),started);
assert.equal(advancePacketGame(started,100000+TICK_MS-1),started);
const oneTick=advancePacketGame(started,100000+TICK_MS);
assert.equal(oneTick.tick,1);
assert.equal(oneTick.packets.length,1);
assert.equal(started.tick,0,"simulation must be immutable");
assert.equal(advancePacketGame(oneTick,100000+TICK_MS),oneTick,"advance idempotently");
assert.equal(timeRemaining(started,100000+1250),ROUND_MS-1250);
assert.equal(elapsedMs(started,99000),0);
assert.equal(timeRemaining(newPacketGame(55),100000),ROUND_MS);

const rotated=rotatePacketTile(started,8);
assert.equal(rotated.tiles[8].rotation,(started.tiles[8].rotation+1)%4);
assert.equal(started.tiles[8].rotation,makeTiles(55)[8].rotation);
assert.equal(rotatePacketTile(started,50),started);
assert.equal(rotatePacketTile(started,3.2),started);
const broken={...started,integrity:57};
const repaired=patchPacketNetwork(broken);
assert.equal(repaired.integrity,79);
assert.equal(repaired.patches,2);
assert.deepEqual(patchPacketNetwork({...started,integrity:100}),started);
assert.equal(patchPacketNetwork({...started,integrity:30,patches:0}).patches,0);

// Two dedicated horizontal lanes are always solvable, in every seed.
function alignLane(game,row){
  for(let col=0;col<COLS;col++){
    const index=row*COLS+col;
    let rotations=0;
    while((tilePorts(game.tiles[index])&10)!==10&&rotations<4){
      game=rotatePacketTile(game,index);rotations++;
    }
    assert.equal(tilePorts(game.tiles[index])&10,10,
      "lane tile must be able to connect west-east "+JSON.stringify({row,col}));
  }
  return game;
}
let aligned=alignLane(alignLane(beginPacketGame(newPacketGame(2026),500000),1),3);
const first=advancePacketGame(aligned,500000+24_000);
assert.ok(first.delivered>=2,"healthy correctly aligned lanes deliver multiple packets");
assert.equal(first.missed,0,"straight lanes should not drop packets before glitches");
assert.ok(first.score>0);
assert.ok(first.integrity>=95);
const repeat=advancePacketGame(aligned,500000+24_000);
assert.deepEqual(first,repeat,"identical timestamps and commands yield identical simulation");
const late=advancePacketGame(first,500000+62_000);
assert.ok(late.tick>=first.tick);
assert.ok(late.incidents>0,"later waves rotate routers as faults");
assert.ok(late.packets.length<=16,"packet array stays bounded");
const finish=advancePacketGame(aligned,500000+95_000);
assert.ok(["won","lost"].includes(finish.phase),"round ends by the 90 second mark or exhaustion");
assert.ok(finish.integrity>=0&&finish.integrity<=100);
assert.ok(finish.score>=0);
assert.equal(advancePacketGame(finish,999999),finish,"finished rounds never advance");
for(const seed of [0,1,7,999,2026,0xffffffff]){
  const run=beginPacketGame(newPacketGame(seed),900000);
  let a=run,b=run;
  for(let i=1;i<=MAX_TICKS;i+=7){
    a=advancePacketGame(a,900000+i*TICK_MS);
    b=advancePacketGame(b,900000+i*TICK_MS);
    assert.deepEqual(a,b,"fixed clock simulation is reproducible");
    assert.ok(a.packets.length<=16);
    assert.ok(a.integrity>=0&&a.integrity<=100);
  }
}
console.log("Packet Panic engine: deterministic routing, valid rotations, winnable lanes, three waves, bounded packets and 90s ending — PASS");
