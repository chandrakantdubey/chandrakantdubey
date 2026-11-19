import assert from "node:assert/strict";

const base=(process.env.DUEL_BASE_URL||"https://chandrakantdubey.vercel.app").replace(/\/+$/,"");
const origin=new URL(base).origin;
const pollUntil=Date.now()+8*60*1000;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function request(method,body){
  const res=await fetch(base+"/api/duel",{
    method,headers:{
      "Origin":origin,
      ...(body?{"Content-Type":"application/json"}:{}),
    },body:body?JSON.stringify(body):undefined,
    cache:"no-store",signal:AbortSignal.timeout(12000),
  });
  const text=await res.text();
  let data={};
  try{data=JSON.parse(text);}catch{throw Error("Non-JSON Duel response "+res.status+": "+text.slice(0,120));}
  return {status:res.status,...data};
}

let ready=false;
while(Date.now()<pollUntil){
  try{
    const status=await request("GET");
    if(status.status===200&&status.enabled===true){ready=true;break;}
  }catch{ /* newly deployed production may not yet route the function */ }
  await sleep(5000);
}
assert.ok(ready,"Production did not expose configured Duel Function within 8 minutes.");
const send=async(action,body={})=>await request("POST",{action,...body});
const host=await send("create");
assert.equal(host.status,201,JSON.stringify({code:host.status,error:host.error}));
assert.match(host.room,/^[A-Za-z0-9_-]{12}$/);
assert.match(host.token,/^[A-Za-z0-9_-]{32}$/);
assert.equal(host.game.status,"waiting");
const h={room:host.room,token:host.token};
const guest=await send("join",{room:h.room});
assert.equal(guest.status,200,JSON.stringify({code:guest.status,error:guest.error}));
assert.equal(guest.side,2);
const g={room:h.room,token:guest.token};
assert.equal(guest.game.status,"active");
assert.equal(guest.game.players,2);
assert.notEqual(h.token,g.token);
const initial=await send("snapshot",h);
assert.equal(initial.status,200);
assert.equal(initial.game.version,guest.game.version);
assert.equal(initial.game.turn,1);
assert.ok(!JSON.stringify(initial).includes(h.token),"raw player credential must not leak");
assert.ok(!JSON.stringify(initial).includes(g.token),"raw guest credential must not leak");
const unauth=await send("snapshot",{room:h.room,token:"x".repeat(32)});
assert.equal(unauth.status,403);
let v=initial.game.version;
const guestMoves=[14,15,16,17,18,19];
for(let i=0;i<7;i++){
  const my=await send("move",{...h,index:i,version:v});
  assert.equal(my.status,200,"Host move "+i+": "+JSON.stringify(my).slice(0,250));
  v=my.game.version;
  const otherView=await send("snapshot",g);
  assert.equal(otherView.game.version,v,"Guest must see host move");
  if(i===6){
    assert.equal(my.game.status,"finished");
    assert.equal(my.game.winner,1);
    assert.equal(my.game.path.length,7);
    break;
  }
  const wrongTurn=await send("move",{...h,index:40,version:v});
  assert.equal(wrongTurn.status,409,"Wrong-turn host must be rejected");
  const other=await send("move",{...g,index:guestMoves[i],version:v});
  assert.equal(other.status,200,"Guest move "+i);
  const stale=await send("move",{...h,index:45,version:v});
  assert.equal(stale.status,409,"Stale move version must be rejected");
  v=other.game.version;
}
const result=await send("snapshot",h);
assert.equal(result.game.winner,1);
assert.equal(result.game.moves,13);
const replay=await send("rematch",g);
assert.equal(replay.status,200);
assert.equal(replay.game.moves,0);
assert.equal(replay.game.status,"active");
assert.ok(replay.game.version>v);
const hostAgain=await send("snapshot",h);
assert.equal(hostAgain.game.version,replay.game.version);
console.log("LIVE HEX MULTIPLAYER PASS: two independent credentials, secure join, alternating turns, shared snapshots, illegal/stale moves, win and rematch.");
