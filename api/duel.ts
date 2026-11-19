/**
 * One Vercel Function + Vercel Private Blob store. No socket server or
 * separate application backend. ETag compare-and-swap prevents lost moves
 * when different stateless Function instances race for the same room.
 *
 * GET /api/duel -> whether a private Blob store is connected.
 * POST { action:"create" | "join" | "snapshot" | "move" | "rematch", ... }
 */
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { BlobPreconditionFailedError, get, put } from "@vercel/blob";
import { freshGame, place, toSnapshot } from "../src/play/duelRules.js";
import type { Side, DuelSnapshot } from "../src/play/duelEngine.ts";

interface StoredRoom {
  id:string;
  hostHash:string;
  guestHash:string|null;
  state:DuelSnapshot;
  createdAt:number;
  expiresAt:number;
}
interface ActionBody {
  action:"create"|"join"|"snapshot"|"move"|"rematch";
  room?:string;
  token?:string;
  index?:number;
  version?:number;
}
const PATTERN=/^[a-zA-Z0-9_-]{12}$/;
const TOKEN=/^[a-zA-Z0-9_-]{32}$/;
const SESSION_MS=1000*60*60*8;
const CORS_HEADERS={
  "Content-Type":"application/json; charset=utf-8",
  "Cache-Control":"private, no-store, max-age=0",
  "X-Content-Type-Options":"nosniff",
  "Referrer-Policy":"no-referrer",
};
function json(payload:Record<string,unknown>,status=200):Response {
  return new Response(JSON.stringify(payload),{status,headers:CORS_HEADERS});
}
export function storageEnabled(env=process.env):boolean {
  return Boolean(env.BLOB_READ_WRITE_TOKEN||env.BLOB_STORE_ID);
}
export function parseAction(input:unknown):{ok:true;data:ActionBody}|{ok:false;message:string} {
  if(!input||typeof input!=="object"||Array.isArray(input))return {ok:false,message:"Invalid input."};
  const o=input as Record<string,unknown>;
  if(!["create","join","snapshot","move","rematch"].includes(String(o.action)))return {ok:false,message:"Unknown action."};
  const action=o.action as ActionBody["action"];
  if(action!=="create"&& (typeof o.room!=="string"||!PATTERN.test(o.room)))return {ok:false,message:"Invalid room code."};
  if(["snapshot","move","rematch"].includes(action) && (typeof o.token!=="string"||!TOKEN.test(o.token)))return {ok:false,message:"Invalid player token."};
  if(action==="move" && (!Number.isInteger(o.index)||!(Number(o.index)>=0&&Number(o.index)<49) || !Number.isSafeInteger(o.version)||Number(o.version)<0))return {ok:false,message:"Invalid move."};
  return {ok:true,data:{action,room:o.room as string|undefined,token:o.token as string|undefined,index:o.index as number|undefined,version:o.version as number|undefined}};
}
function secureId():string {return randomBytes(9).toString("base64url");}
function secureToken():string {return randomBytes(24).toString("base64url");}
function hash(token:string):string {return createHash("sha256").update(token).digest("hex");}
function equals(secret:string,token:string):boolean {
  const a=Buffer.from(secret,"hex"),b=Buffer.from(hash(token),"hex");
  return a.length===b.length&&timingSafeEqual(a,b);
}
function role(room:StoredRoom,token:string):Side|null {
  if(equals(room.hostHash,token))return 1;
  if(room.guestHash&&equals(room.guestHash,token))return 2;
  return null;
}
const pathname=(room:string)=>"duel/v1/"+room+".json";
async function load(roomId:string):Promise<{room:StoredRoom;etag:string}|null> {
  const result=await get(pathname(roomId),{access:"private",useCache:false});
  if(!result||result.statusCode!==200)return null;
  if(result.blob.size>8192)throw Error("Room storage exceeded expected limit.");
  const text=await new Response(result.stream).text();
  const stored=JSON.parse(text) as StoredRoom;
  if(stored.id!==roomId||stored.expiresAt<=Date.now())return null;
  return {room:stored,etag:result.blob.etag};
}
async function save(room:StoredRoom,etag?:string):Promise<void> {
  await put(pathname(room.id),JSON.stringify(room),{
    access:"private",
    contentType:"application/json",
    addRandomSuffix:false,
    ...(etag?{ifMatch:etag,allowOverwrite:true}:{allowOverwrite:false}),
    ttlDays:1,
  });
}
function publicState(room:StoredRoom,side:Side):Record<string,unknown> {
  return {room:room.id,side,game:room.state,expiresAt:room.expiresAt};
}
function inputOriginAllowed(request:Request):boolean {
  try {
    const origin=request.headers.get("origin");
    return origin===new URL(request.url).origin;
  }catch{return false;}
}
export async function GET():Promise<Response> {
  return json({enabled:storageEnabled(),game:"trace-hex",players:2});
}
export async function POST(request:Request):Promise<Response> {
  if(!storageEnabled())return json({error:"Online rooms are not configured. Practice mode is available."},503);
  if(!inputOriginAllowed(request))return json({error:"Origin not allowed."},403);
  if(!(request.headers.get("content-type")||"").startsWith("application/json"))return json({error:"Expected JSON."},415);
  if(Number(request.headers.get("content-length")||0)>3072)return json({error:"Request too large."},413);
  let raw="";
  try{raw=await request.text();}catch{return json({error:"Cannot read request."},400);}
  if(raw.length>3072)return json({error:"Request too large."},413);
  let decoded:unknown;
  try{decoded=JSON.parse(raw);}catch{return json({error:"Malformed request."},400);}
  const input=parseAction(decoded);
  if(!input.ok)return json({error:input.message},400);
  const {action,room:roomId,token,index,version}=input.data;

  try{
    if(action==="create"){
      const id=secureId(),secret=secureToken();
      const createdAt=Date.now();
      const room:StoredRoom={
        id,hostHash:hash(secret),guestHash:null,
        state:freshGame(1),createdAt,expiresAt:createdAt+SESSION_MS,
      };
      await save(room);
      return json({...publicState(room,1),token:secret},201);
    }
    const loaded=await load(roomId!);
    if(!loaded)return json({error:"This room doesn't exist or has expired."},404);
    const {room,etag}=loaded;
    if(action==="join"){
      if(room.guestHash)return json({error:"This match already has two players."},409);
      const secret=secureToken();
      const updated:StoredRoom={...room,guestHash:hash(secret),state:{...room.state,status:"active",players:2,version:room.state.version+1}};
      await save(updated,etag);
      return json({...publicState(updated,2),token:secret},200);
    }
    const current=role(room,token!);
    if(!current)return json({error:"Invalid player credentials."},403);
    if(action==="snapshot")return json(publicState(room,current));
    if(action==="rematch"){
      if(room.state.status!=="finished")return json({error:"Finish the current match before a rematch."},409);
      const updated={...room,state:{...freshGame(2),version:room.state.version+1}};
      await save(updated,etag);
      return json(publicState(updated,current));
    }
    if(action==="move"){
      if(room.state.version!==version)return json({error:"The match changed. Refresh the board.",game:room.state},409);
      const moved=place(room.state,current,index!);
      if(!moved.valid)return json({error:moved.reason||"Illegal move.",game:room.state},409);
      const updated={...room,state:toSnapshot(moved)};
      await save(updated,etag);
      return json(publicState(updated,current));
    }
    return json({error:"Action not supported."},400);
  }catch(error){
    if(error instanceof BlobPreconditionFailedError){
      return json({error:"Another player moved first. Your board will refresh."},409);
    }
    console.error("Duel storage operation failed",error instanceof Error?error.name:"UnknownError");
    return json({error:"Multiplayer service is temporarily unavailable."},503);
  }
}
