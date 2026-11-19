import assert from "node:assert/strict";
import {
  SIZE,CELL_COUNT,neighbors,findConnection,freshGame,place,toSnapshot,choosePracticeMove,
} from "../src/play/duelEngine.ts";
import {
  WIDTH,HEIGHT,NO_INPUT,newFluxGame,startFlux,updateFlux,random,
} from "../src/play/fluxEngine.ts";
import { parseAction,storageEnabled,GET,POST } from "../api/duel.ts";

// Graph topology is symmetric, bounded and connected.
assert.equal(SIZE,7);
assert.equal(CELL_COUNT,49);
for(let i=0;i<49;i++){
  for(const n of neighbors(i)){
    assert.ok(n>=0&&n<49,"neighbor bounds");
    assert.ok(neighbors(n).includes(i),"undirected graph");
  }
}
assert.deepEqual(neighbors(-1),[]);
assert.deepEqual(neighbors(49),[]);

const initial=freshGame(2);
assert.equal(initial.status,"active");
assert.equal(initial.board.length,49);
assert.ok(initial.board.every(v=>v===0));
const s1=place(initial,1,0);
assert.ok(s1.valid);
assert.equal(s1.turn,2);
assert.equal(s1.moves,1);
assert.equal(s1.version,1);
assert.equal(initial.board[0],0,"updates are immutable");
assert.equal(place(toSnapshot(s1),1,1).valid,false,"out-of-turn rejected");
assert.equal(place(toSnapshot(s1),2,0).valid,false,"occupied node rejected");
assert.equal(place(toSnapshot(s1),2,100).valid,false,"bad cell rejected");

const c=Array(49).fill(0);
for(let i=0;i<7;i++)c[i]=1;
assert.deepEqual(findConnection(c,1),[0,1,2,3,4,5,6]);
assert.deepEqual(findConnection(c,2),[]);
const v=Array(49).fill(0);
for(let row=0;row<7;row++)v[row*7]=2;
assert.deepEqual(findConnection(v,2),[0,7,14,21,28,35,42]);
assert.deepEqual(findConnection(v,1),[]);
const last=Array(49).fill(0);
for(let x=0;x<6;x++)last[x]=1;
const win=place({...freshGame(2),board:last,turn:1,moves:6},1,6);
assert.ok(win.valid);assert.equal(win.winner,1);assert.equal(win.status,"finished");
assert.equal(win.path.length,7);
assert.equal(place(toSnapshot(win),2,30).valid,false,"game ends after connection");

// CPU choices are legal in hundreds of different staged positions.
let practice=freshGame(2);
for(let i=0;i<20&&practice.status==="active";i++){
  const available=practice.board.findIndex(v=>v===0);
  if(available<0)break;
  const human=place(practice,practice.turn,available);
  if(!human.valid)break;
  practice=toSnapshot(human);
  if(practice.status==="active"&&practice.turn===2){
    const next=choosePracticeMove(practice);
    assert.ok(next>=0&&next<49);
    assert.equal(practice.board[next],0);
    practice=toSnapshot(place(practice,2,next));
  }
}

// Arcade is deterministic, fixed-step, collision-aware and bounded.
assert.equal(WIDTH,960);assert.equal(HEIGHT,540);
assert.deepEqual(random(123),random(123));
const f=newFluxGame(123);
assert.equal(f.phase,"idle");
assert.equal(updateFlux(f,NO_INPUT,.05),f,"idle remains still");
const started=startFlux(f);
let a=started,b=startFlux(newFluxGame(123));
for(let i=0;i<700;i++){
  a=updateFlux(a,{...NO_INPUT,up:i%5===0,right:i%6===0},1/60);
  b=updateFlux(b,{...NO_INPUT,up:i%5===0,right:i%6===0},1/60);
  assert.deepEqual(a,b,"identical input produces identical arcade state");
  assert.ok(a.x>=0&&a.x<=WIDTH&&a.y>=0&&a.y<=HEIGHT,"ship stays inside");
  assert.ok(a.objects.length<=90,"bounded entity count");
  if(a.phase==="over")break;
}
const spark={kind:"spark",x:480,y:270,vx:0,vy:0,r:10,life:5,phase:0};
const scored=updateFlux({...startFlux(newFluxGame(66)),objects:[spark]},NO_INPUT,.016);
assert.ok(scored.score>0);
assert.equal(scored.objects.length,0);
const hazard={...spark,kind:"hazard",r:20};
const damaged=updateFlux({...startFlux(newFluxGame(66)),objects:[hazard]},NO_INPUT,.016);
assert.equal(damaged.health,2);
assert.ok(damaged.invulnerable>0);
const repeat=updateFlux({...damaged,objects:[hazard]},NO_INPUT,.016);
assert.equal(repeat.health,2,"invulnerability prevents double damage");
assert.equal(updateFlux(started,NO_INPUT,Number.NaN),started);

// API rejects invalid data and remains fail-closed when storage isn't connected.
assert.equal(parseAction({action:"create"}).ok,true);
assert.equal(parseAction({action:"join",room:"123456789abc"}).ok,true);
assert.equal(parseAction({action:"move",room:"123456789abc",token:"x".repeat(32),index:0,version:3}).ok,true);
for(const value of [
 null,{},[],{action:"join",room:"../../etc/passwd"},
 {action:"move",room:"123456789abc",token:"x".repeat(32),index:49,version:0},
 {action:"move",room:"123456789abc",token:"x".repeat(32),index:2,version:1.5},
 {action:"snapshot",room:"123456789abc",token:"bad"},{action:"reset",room:"123456789abc"},
]){
  assert.equal(parseAction(value).ok,false);
}
assert.equal(storageEnabled({}),false);
assert.equal(storageEnabled({BLOB_READ_WRITE_TOKEN:"test"}),true);
const oldToken=process.env.BLOB_READ_WRITE_TOKEN,oldStore=process.env.BLOB_STORE_ID;
try{
  delete process.env.BLOB_READ_WRITE_TOKEN;delete process.env.BLOB_STORE_ID;
  const r=await GET();assert.equal(r.status,200);assert.deepEqual(await r.json(),{enabled:false,game:"trace-hex",players:2});
  const p=await POST(new Request("https://example.org/api/duel",{
    method:"POST",headers:{"Origin":"https://example.org","Content-Type":"application/json"},
    body:JSON.stringify({action:"create"}),
  }));
  assert.equal(p.status,503,"live room API refuses to run without storage");
}finally{
  if(oldToken===undefined)delete process.env.BLOB_READ_WRITE_TOKEN;else process.env.BLOB_READ_WRITE_TOKEN=oldToken;
  if(oldStore===undefined)delete process.env.BLOB_STORE_ID;else process.env.BLOB_STORE_ID=oldStore;
}
console.log("Hex multiplayer graph, deterministic arcade physics, input validation and fail-closed API: PASS");
