/**
 * Server-authoritative Packet Panic rooms.
 * Vercel Private Blob + ETag CAS: two clients can rotate at once without
 * overwriting each other's edits, even on separate Function instances.
 * Snapshot polling (~900 ms) intentionally avoids a Redis dependency.
 */
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import {
  newPacketGame, beginPacketGame, rotatePacketTile, patchPacketNetwork,
  advancePacketGame, TILE_COUNT,
} from "../src/play/packetEngine.js";
import type { PacketGameState } from "../src/play/packetEngine.js";

type Action = "create"|"join"|"snapshot"|"start"|"rotate"|"patch"|"restart";
interface Input {
  action:Action;
  room?:string;
  token?:string;
  index?:number;
  commandId?:string;
}
interface StoredRoom {
  id:string;
  hostHash:string;
  guestHash:string|null;
  game:PacketGameState;
  createdAt:number;
  expiresAt:number;
  commands:string[];
}
const CODE=/^[a-zA-Z0-9_-]{12}$/;
const TOKEN=/^[a-zA-Z0-9_-]{32}$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SESSION_MS=8*60*60*1000;
const HEADERS={
  "Content-Type":"application/json; charset=utf-8",
  "Cache-Control":"private, no-store, max-age=0",
  "X-Content-Type-Options":"nosniff",
  "Referrer-Policy":"no-referrer",
};
const RATE_WINDOW=60*60*1000,MAX_ROOMS_PER_HOUR=6;
const buckets=new Map<string,{until:number,count:number}>();
function json(value:Record<string,unknown>,status=200):Response {
  return new Response(JSON.stringify(value),{status,headers:HEADERS});
}
export function packetStorageEnabled(env=process.env):boolean {
  return Boolean(env.BLOB_READ_WRITE_TOKEN || env.BLOB_STORE_ID);
}
export function parsePacketAction(value:unknown):{ok:true;data:Input}|{ok:false;error:string} {
  if(!value||typeof value!=="object"||Array.isArray(value))return {ok:false,error:"Invalid request."};
  const a=value as Record<string,unknown>,action=a.action;
  if(!["create","join","snapshot","start","rotate","patch","restart"].includes(String(action)))
    return {ok:false,error:"Unknown room action."};
  if(action!=="create"&&(typeof a.room!=="string"||!CODE.test(a.room)))
    return {ok:false,error:"Invalid room code."};
  if(!["create","join"].includes(String(action))&&(typeof a.token!=="string"||!TOKEN.test(a.token)))
    return {ok:false,error:"Invalid player token."};
  if(action==="rotate"&&(!Number.isInteger(a.index)||Number(a.index)<0||Number(a.index)>=TILE_COUNT))
    return {ok:false,error:"Invalid node."};
  if(["start","rotate","patch","restart"].includes(String(action))&&(typeof a.commandId!=="string"||!UUID.test(a.commandId)))
    return {ok:false,error:"Invalid action identifier."};
  return {ok:true,data:{action:action as Action,room:a.room as string|undefined,
    token:a.token as string|undefined,index:a.index as number|undefined,
    commandId:a.commandId as string|undefined}};
}
function newCode():string {return randomBytes(9).toString("base64url");}
function newToken():string {return randomBytes(24).toString("base64url");}
function hash(value:string):string {return createHash("sha256").update(value).digest("hex");}
function matches(expected:string,candidate:string):boolean {
  const x=Buffer.from(expected,"hex"),y=Buffer.from(hash(candidate),"hex");
  return x.length===y.length&&timingSafeEqual(x,y);
}
function side(room:StoredRoom,token:string):1|2|null {
  if(matches(room.hostHash,token))return 1;
  if(room.guestHash&&matches(room.guestHash,token))return 2;
  return null;
}
const storagePath=(code:string)=>"packet/v1/"+code+".json";
async function load(code:string):Promise<{room:StoredRoom;etag:string}|null> {
  const result=await get(storagePath(code),{access:"private",useCache:false});
  if(!result||result.statusCode!==200)return null;
  if(result.blob.size>16_384)throw Error("Room exceeded expected size.");
  const data=JSON.parse(await new Response(result.stream).text()) as StoredRoom;
  if(data.id!==code||data.expiresAt<Date.now())return null;
  return {room:data,etag:result.blob.etag};
}
async function save(room:StoredRoom,etag?:string):Promise<void> {
  await put(storagePath(room.id),JSON.stringify(room),{
    access:"private",contentType:"application/json",addRandomSuffix:false,
    ...(etag?{ifMatch:etag,allowOverwrite:true}:{allowOverwrite:false}),ttlDays:1,
  });
}
function exposed(room:StoredRoom,player:1|2):Record<string,unknown> {
  return {room:room.id,player,players:room.guestHash?2:1,
    game:room.game,expiresAt:room.expiresAt,serverNow:Date.now()};
}
function originAllowed(request:Request):boolean {
  try{return request.headers.get("origin")===new URL(request.url).origin;}
  catch{return false;}
}
function allowCreate(request:Request):boolean {
  const ip=request.headers.get("x-vercel-forwarded-for")?.slice(0,64)||"unattributed";
  const now=Date.now();let existing=buckets.get(ip);
  if(!existing||existing.until<=now){
    if(buckets.size>1024) {
      for(const [key,entry] of buckets)if(entry.until<=now)buckets.delete(key);
      if(buckets.size>1024)buckets.delete(buckets.keys().next().value!);
    }
    existing={until:now+RATE_WINDOW,count:0};buckets.set(ip,existing);
  }
  if(existing.count>=MAX_ROOMS_PER_HOUR)return false;
  existing.count++;
  return true;
}
export async function GET():Promise<Response> {
  return json({enabled:packetStorageEnabled(),game:"packet-panic",players:2,roundSeconds:90});
}
export async function POST(request:Request):Promise<Response> {
  if(!packetStorageEnabled())return json({error:"Online rooms are unavailable. Solo mode still works."},503);
  if(!originAllowed(request))return json({error:"Origin not allowed."},403);
  if(!(request.headers.get("content-type")||"").startsWith("application/json"))
    return json({error:"Expected JSON."},415);
  if(Number(request.headers.get("content-length")||0)>2048)return json({error:"Request too large."},413);
  let raw:string;
  try{raw=await request.text();}catch{return json({error:"Request unreadable."},400);}
  if(raw.length>2048)return json({error:"Request too large."},413);
  let decoded:unknown;
  try{decoded=JSON.parse(raw);}catch{return json({error:"Malformed JSON."},400);}
  const parsed=parsePacketAction(decoded);
  if("error" in parsed)return json({error:parsed.error},400);
  const {action,room:code,token,index,commandId}=parsed.data;

  try{
    if(action==="create"){
      if(!allowCreate(request))return json({error:"Room limit reached. Try again later."},429);
      const id=newCode(),secret=newToken(),createdAt=Date.now();
      const room:StoredRoom={
        id,hostHash:hash(secret),guestHash:null,
        game:newPacketGame(randomBytes(4).readUInt32BE(0),1),
        createdAt,expiresAt:createdAt+SESSION_MS,commands:[],
      };
      await save(room);
      return json({...exposed(room,1),token:secret},201);
    }
    if(action==="join"){
      const loaded=await load(code!);
      if(!loaded)return json({error:"Room not found or expired."},404);
      if(loaded.room.guestHash)return json({error:"Room already has two operators."},409);
      if(loaded.room.game.phase!=="ready")return json({error:"This round has already started."},409);
      const secret=newToken();
      const room:StoredRoom={...loaded.room,guestHash:hash(secret),
        game:{...loaded.room.game,players:2,version:loaded.room.game.version+1}};
      await save(room,loaded.etag);
      return json({...exposed(room,2),token:secret});
    }
    // CAS retries are necessary because advancing time competes with other
    // snapshots and node rotations on different serverless instances.
    for(let attempt=0;attempt<5;attempt++){
      const loaded=await load(code!);
      if(!loaded)return json({error:"Room not found or expired."},404);
      const player=side(loaded.room,token!);
      if(!player)return json({error:"Invalid player credentials."},403);
      const current=loaded.room;
      let game=advancePacketGame(current.game,Date.now());
      const command=commandId ? player+":"+commandId : "";
      if(command && current.commands.includes(command)){
        return json(exposed(current,player));
      }
      let error:string|null=null;
      if(action==="start"){
        if(player!==1)error="Only the host can start the round.";
        else if(!current.guestHash)error="Waiting for your second operator.";
        else if(game.phase!=="ready")error="This round has already started.";
        else game=beginPacketGame(game);
      }else if(action==="rotate"){
        if(game.phase!=="playing")error="Start the game first.";
        else if(player===1&&index!%7>=4)error="Operator 1 controls the ingress side (columns 1–4).";
        else if(player===2&&index!%7<4)error="Operator 2 controls the egress side (columns 5–7).";
        else game=rotatePacketTile(game,index!);
      }else if(action==="patch"){
        if(game.phase!=="playing"||game.patches<=0||game.integrity>=100)
          error="No repair charge needed or available.";
        else game=patchPacketNetwork(game);
      }else if(action==="restart"){
        if(player!==1)error="Only the host can restart.";
        else if(!["won","lost"].includes(game.phase))error="Finish the round before restarting.";
        else game={...newPacketGame((game.seed+101)>>>0,2),version:game.version+1};
      }
      if(error)return json({error,game},409);
      if(game===current.game)return json(exposed(current,player));
      const updated:StoredRoom={...current,game,
        commands:command?[...current.commands.slice(-39),command]:current.commands};
      try{
        await save(updated,loaded.etag);
        return json(exposed(updated,player));
      }catch(err){
        if(!(err instanceof BlobPreconditionFailedError))throw err;
        if(attempt===4)return json({error:"Room changed; retry the action."},409);
      }
    }
    return json({error:"Room temporarily busy."},409);
  }catch(err){
    if(err instanceof BlobPreconditionFailedError)
      return json({error:"Room changed; retry the action."},409);
    console.error("Packet room operation failed",err instanceof Error?err.name:"UnknownError");
    return json({error:"Multiplayer temporarily unavailable. Solo mode is ready."},503);
  }
}
