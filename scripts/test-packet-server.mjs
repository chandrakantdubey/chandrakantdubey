import assert from "node:assert/strict";
import { registerHooks } from "node:module";

// Exercise the production Vercel Function against a strict CAS-aware in-memory
// Blob adapter, without contacting or mutating the real private store.
const records=new Map();let nextEtag=1;
globalThis.__packetTestStore={records,newEtag:()=>'"packet-'+nextEtag+++'"'};
const replacement=String.raw`
export class BlobPreconditionFailedError extends Error {
  constructor(){super("Concurrent room write");this.name="BlobPreconditionFailedError";}
}
export async function get(path){
  const entry=globalThis.__packetTestStore.records.get(path);
  if(!entry)return null;
  return {statusCode:200,blob:{etag:entry.etag,size:Buffer.byteLength(entry.body)},
    stream:new Blob([entry.body]).stream()};
}
export async function put(path,body,opts){
  const previous=globalThis.__packetTestStore.records.get(path);
  if((previous&&!opts.allowOverwrite)||
     (opts.ifMatch&&(!previous||previous.etag!==opts.ifMatch)))
    throw new BlobPreconditionFailedError();
  const etag=globalThis.__packetTestStore.newEtag();
  globalThis.__packetTestStore.records.set(path,{body,etag});
  return {pathname:path,etag};
}
`;
registerHooks({resolve(specifier,context,nextResolve){
  if(specifier==="@vercel/blob")return {
    url:"data:text/javascript,"+encodeURIComponent(replacement),shortCircuit:true,
  };
  return nextResolve(specifier,context);
}});
process.env.BLOB_READ_WRITE_TOKEN="packet-test-store-local";
const {GET,POST,parsePacketAction,packetStorageEnabled}=await import("../api/packet.ts");
const base="https://portfolio.example";
const uuid=(n)=>"123e4567-e89b-42d3-a456-"+String(n).padStart(12,"0");
async function post(action,body={},origin=base){
  const response=await POST(new Request(base+"/api/packet",{
    method:"POST",headers:{origin,"content-type":"application/json","x-vercel-forwarded-for":"198.51.100.2"},
    body:JSON.stringify({action,...body}),
  }));
  return {status:response.status,...await response.json()};
}
assert.equal(packetStorageEnabled({}),false);
assert.equal(packetStorageEnabled({BLOB_READ_WRITE_TOKEN:"fake"}),true);
assert.equal((await (await GET()).json()).game,"packet-panic");
for(const input of [
  null,{},[],{action:"join",room:"../secrets"},
  {action:"rotate",room:"a".repeat(12),token:"x".repeat(32),index:-1,commandId:uuid(1)},
  {action:"rotate",room:"a".repeat(12),token:"x".repeat(32),index:35,commandId:uuid(1)},
  {action:"rotate",room:"a".repeat(12),token:"x".repeat(32),index:0,commandId:"nope"},
  {action:"snapshot",room:"a".repeat(12),token:"wrong"},
  {action:"unknown"},
])assert.equal(parsePacketAction(input).ok,false);
assert.equal(parsePacketAction({action:"create"}).ok,true);

const forged=await post("create",{},"https://evil.example");
assert.equal(forged.status,403);
const host=await post("create");
assert.equal(host.status,201);
assert.match(host.room,/^[A-Za-z0-9_-]{12}$/);
assert.match(host.token,/^[A-Za-z0-9_-]{32}$/);
assert.equal(host.game.phase,"ready");
assert.equal(host.players,1);
const h={room:host.room,token:host.token};
assert.equal((await post("start",{...h,commandId:uuid(1)})).status,409,"host can't start alone");
const guest=await post("join",{room:host.room});
assert.equal(guest.status,200);
assert.equal(guest.player,2);
assert.equal(guest.players,2);
assert.equal(guest.game.players,2);
assert.notEqual(guest.token,host.token);
const g={room:guest.room,token:guest.token};
assert.equal((await post("join",{room:h.room})).status,409);
assert.equal((await post("snapshot",{room:h.room,token:"x".repeat(32)})).status,403);
assert.equal((await post("start",{...g,commandId:uuid(2)})).status,409,"guest can't start");
const start=await post("start",{...h,commandId:uuid(3)});
assert.equal(start.status,200);
assert.equal(start.game.phase,"playing");
assert.equal((await post("start",{...h,commandId:uuid(4)})).status,409);
const code=h.room,path="packet/v1/"+code+".json";
const before=JSON.parse(records.get(path).body);
const a=await post("rotate",{...h,index:1,commandId:uuid(5)});
assert.equal(a.status,200);
const b=await post("rotate",{...g,index:2,commandId:uuid(6)});
assert.equal(b.status,200);
assert.equal(b.game.tiles[1].rotation,(before.game.tiles[1].rotation+1)&3);
assert.equal(b.game.tiles[2].rotation,(before.game.tiles[2].rotation+1)&3);
const concurrentBefore=JSON.parse(records.get(path).body).game;
const concurrent=await Promise.all([
  post("rotate",{...h,index:3,commandId:uuid(20)}),
  post("rotate",{...g,index:4,commandId:uuid(21)}),
]);
assert.deepEqual(concurrent.map(x=>x.status),[200,200],"simultaneous player actions must both commit");
const concurrentFinal=await post("snapshot",h);
assert.equal(concurrentFinal.game.tiles[3].rotation,(concurrentBefore.tiles[3].rotation+1)&3);
assert.equal(concurrentFinal.game.tiles[4].rotation,(concurrentBefore.tiles[4].rotation+1)&3,
  "CAS retries must preserve both concurrent rotations");

const duplicate=await post("rotate",{...h,index:1,commandId:uuid(5)});
assert.equal(duplicate.status,200);
assert.equal(duplicate.game.tiles[1].rotation,b.game.tiles[1].rotation,"retry is idempotent");

const patchRecord=records.get(path);
const changed=JSON.parse(patchRecord.body);
changed.game.integrity=40;
records.set(path,{...patchRecord,body:JSON.stringify(changed)});
const repair=await post("patch",{...g,commandId:uuid(7)});
assert.equal(repair.status,200);
assert.equal(repair.game.integrity,62);
assert.equal(repair.game.patches,2);
assert.equal((await post("patch",{...g,commandId:uuid(7)})).game.patches,2,"patch retries don't consume extra charge");

const expiredTick=records.get(path),elapsed=JSON.parse(expiredTick.body);
elapsed.game.startedAt=Date.now()-92_000;
elapsed.game.integrity=100;
records.set(path,{...expiredTick,body:JSON.stringify(elapsed)});
const completed=await post("snapshot",h);
assert.equal(completed.status,200);
assert.ok(["won","lost"].includes(completed.game.phase));
assert.equal((await post("rotate",{...h,index:3,commandId:uuid(8)})).status,409);
assert.equal((await post("restart",{...g,commandId:uuid(9)})).status,409);
const restart=await post("restart",{...h,commandId:uuid(10)});
assert.equal(restart.status,200);
assert.equal(restart.game.phase,"ready");
assert.equal(restart.game.players,2);
assert.equal(restart.game.patches,3);
assert.equal((await post("snapshot",g)).game.phase,"ready");

const snapshot=records.get(path);
const stale=JSON.parse(snapshot.body);stale.expiresAt=Date.now()-1;
records.set(path,{...snapshot,body:JSON.stringify(stale)});
assert.equal((await post("snapshot",h)).status,404,"expired rooms are rejected");
console.log("Packet Panic API: create/join, host auth, CAS writes, both operators, command replay, repair, restart and expiry — PASS");
