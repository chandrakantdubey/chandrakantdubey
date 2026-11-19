import assert from "node:assert/strict";
import { registerHooks } from "node:module";

// Inject a deterministic in-memory private Blob adapter at the ESM boundary.
// The real Vercel Function and its concurrency, auth, and validation logic run unchanged.
const records=new Map();
let index=1;
globalThis.__duelTestBlob={records,etag:()=>'"v'+index+++'"'};
const source=String.raw`
export class BlobPreconditionFailedError extends Error {
  constructor(){super("ETag mismatch");this.name="BlobPreconditionFailedError";}
}
export async function get(path){
  const entry=globalThis.__duelTestBlob.records.get(path);
  if(!entry)return null;
  return {statusCode:200,blob:{etag:entry.etag,size:Buffer.byteLength(entry.body)},stream:new Blob([entry.body]).stream()};
}
export async function put(path,body,options){
  const previous=globalThis.__duelTestBlob.records.get(path);
  if((previous&&!options.allowOverwrite)||(options.ifMatch&&(!previous||previous.etag!==options.ifMatch)))
    throw new BlobPreconditionFailedError();
  const etag=globalThis.__duelTestBlob.etag();
  globalThis.__duelTestBlob.records.set(path,{etag,body});
  return {pathname:path,etag};
}
`;
registerHooks({resolve(specifier,context,nextResolve){
  if(specifier==="@vercel/blob")return {url:"data:text/javascript,"+encodeURIComponent(source),shortCircuit:true};
  return nextResolve(specifier,context);
}});
process.env.BLOB_READ_WRITE_TOKEN="local-test-token-not-a-secret";
const {GET,POST}=await import("../api/duel.ts");
const base="https://portfolio.example";
async function post(action,body={},origin=base){
  const res=await POST(new Request(base+"/api/duel",{
    method:"POST",headers:{origin,"content-type":"application/json"},
    body:JSON.stringify({action,...body})
  }));
  return {status:res.status,...await res.json()};
}
assert.equal((await (await GET()).json()).enabled,true);
const host=await post("create");
assert.equal(host.status,201);
assert.match(host.room,/^[A-Za-z0-9_-]{12}$/);
assert.match(host.token,/^[A-Za-z0-9_-]{32}$/);
assert.equal(host.game.status,"waiting");
const h={room:host.room,token:host.token};
const guest=await post("join",{room:h.room});
assert.equal(guest.status,200);
assert.equal(guest.game.players,2);
assert.equal(guest.game.status,"active");
assert.equal(guest.side,2);
const g={room:h.room,token:guest.token};
assert.notEqual(g.token,h.token);
assert.equal((await post("join",{room:h.room})).status,409);
assert.equal((await post("snapshot",{room:h.room,token:"x".repeat(32)})).status,403);
assert.equal((await post("create",{},"https://evil.example")).status,403);
const concurrent=await Promise.all([
  post("move",{...h,index:0,version:guest.game.version}),
  post("move",{...h,index:1,version:guest.game.version}),
]);
assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,409],"only one concurrent turn may commit");
const winning=concurrent.find(r=>r.status===200);
assert.equal(winning.game.moves,1);
assert.equal((await post("move",{...h,index:3,version:winning.game.version})).status,409,"out-of-turn host action");
let version=winning.game.version;
const others=[0,1,2,3,4,5,6].filter(i=>i!==winning.game.lastMove);
const limeMoves=[8,15,22,29,36,43];
for(let i=0;i<others.length;i++){
  const response=await post("move",{...g,index:limeMoves[i],version});
  assert.equal(response.status,200);version=response.game.version;
  const reply=await post("move",{...h,index:others[i],version});
  assert.equal(reply.status,200);version=reply.game.version;
  if(reply.game.status==="finished")break;
}
const finished=await post("snapshot",g);
assert.equal(finished.game.status,"finished");
assert.equal(finished.game.winner,1);
assert.equal(finished.game.path.length,7);
const rematch=await post("rematch",h);
assert.equal(rematch.status,200);
assert.equal(rematch.game.status,"active");
assert.equal(rematch.game.moves,0);
assert.ok(rematch.game.version>finished.game.version);
assert.equal((await post("snapshot",g)).game.version,rematch.game.version);
const pathname="duel/v1/"+h.room+".json";
const record=records.get(pathname);
const expired=JSON.parse(record.body);
expired.expiresAt=Date.now()-1000;
records.set(pathname,{etag:record.etag,body:JSON.stringify(expired)});
assert.equal((await post("snapshot",h)).status,404);
console.log("Vercel Duel API integration: create, join, auth, CAS race, win, rematch and expiry PASS");
