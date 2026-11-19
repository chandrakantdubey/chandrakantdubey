import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowUpRight, Check, Copy, ExternalLink, Link2, RotateCcw, Users } from "lucide-react";
import {
  SIZE,choosePracticeMove,freshGame,neighbors,place,toSnapshot,
  type Side,type DuelSnapshot,
} from "./duelEngine.ts";

type Mode="practice"|"online";
interface ServerPayload {
  room?:string;token?:string;side?:Side;game?:DuelSnapshot;
  expiresAt?:number;error?:string;enabled?:boolean;
}
function key(room:string){return "cd-hex-room-"+room;}
function roomFromUrl():string|null {
  if(typeof window==="undefined")return null;
  const raw=new URLSearchParams(window.location.search).get("room");
  return raw&&/^[a-zA-Z0-9_-]{12}$/.test(raw)?raw:null;
}
async function api(body:Record<string,unknown>):Promise<ServerPayload> {
  const response=await fetch("/api/duel",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body),signal:AbortSignal.timeout(10000),cache:"no-store",
  });
  const data=await response.json() as ServerPayload;
  if(!response.ok)throw Error(data.error||"Room service temporarily unavailable.");
  return data;
}
function errorMessage(error:unknown):string {
  return error instanceof Error?error.message:"The room request failed.";
}
function readSavedToken(room:string):string|null {
  try{return window.localStorage.getItem(key(room));}catch{return null;}
}
function storeToken(room:string,token:string) {
  try{window.localStorage.setItem(key(room),token);}catch{/* memory-only fallback */}
}
function useOnlineGame(startRoom:string|null) {
  const [mode,setMode]=useState<Mode>("practice");
  const [ready,setReady]=useState<boolean|null>(null);
  const [room,setRoom]=useState<string|null>(startRoom);
  const [token,setToken]=useState<string|null>(null);
  const [side,setSide]=useState<Side>(1);
  const [game,setGame]=useState<DuelSnapshot>(freshGame(2));
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  const requestNo=useRef(0);
  const online=mode==="online"&&room&&token;

  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/duel",{signal:controller.signal,cache:"no-store"})
      .then(r=>r.json()).then((data:{enabled?:boolean})=>{
        if(!controller.signal.aborted)setReady(data.enabled===true);
      }).catch(()=>{if(!controller.signal.aborted)setReady(false);});
    return()=>controller.abort();
  },[]);

  const sync=useCallback(async(r:string,t:string,quiet=false)=>{
    const number=++requestNo.current;
    try{
      const result=await api({action:"snapshot",room:r,token:t});
      if(number!==requestNo.current)return;
      if(result.game)setGame(result.game);
      if(result.side)setSide(result.side);
      setError("");
    }catch(err){
      if(number!==requestNo.current)return;
      if(!quiet)setError(errorMessage(err));
    }
  },[]);

  useEffect(()=>{
    if(!startRoom)return;
    const saved=readSavedToken(startRoom);
    if(!saved)return;
    setRoom(startRoom);setToken(saved);setMode("online");
    void sync(startRoom,saved);
  },[startRoom,sync]);

  useEffect(()=>{
    if(!online)return;
    const r=room,t=token;
    const timer=window.setInterval(()=>{if(!document.hidden)void sync(r,t,true);},3000);
    const visibility=()=>{if(!document.hidden)void sync(r,t,true);};
    document.addEventListener("visibilitychange",visibility);
    return()=>{window.clearInterval(timer);document.removeEventListener("visibilitychange",visibility);};
  },[online,room,token,sync]);

  const create=async()=>{
    setBusy(true);setError("");
    try{
      const result=await api({action:"create"});
      if(!result.room||!result.token||!result.game)throw Error("Incomplete room response.");
      setRoom(result.room);setToken(result.token);
      setSide(1);setGame(result.game);setMode("online");
      storeToken(result.room,result.token);
      const url=new URL(window.location.href);
      url.searchParams.set("room",result.room);
      window.history.replaceState(null,"",url);
    }catch(err){setError(errorMessage(err));}
    finally{setBusy(false);}
  };
  const join=async(code:string)=>{
    setBusy(true);setError("");
    try{
      const result=await api({action:"join",room:code});
      if(!result.room||!result.token||!result.game)throw Error("Incomplete join response.");
      setRoom(result.room);setToken(result.token);
      setSide(2);setGame(result.game);setMode("online");
      storeToken(result.room,result.token);
      const url=new URL(window.location.href);
      url.searchParams.set("room",result.room);
      window.history.replaceState(null,"",url);
    }catch(err){setError(errorMessage(err));}
    finally{setBusy(false);}
  };
  const play=async(index:number)=>{
    if(!online||busy||game.status!=="active"||game.turn!==side)return;
    setBusy(true);setError("");
    try{
      const response=await api({action:"move",room,token,index,version:game.version});
      if(response.game)setGame(response.game);
    }catch(err){
      setError(errorMessage(err));
      await sync(room,token,true);
    }finally{setBusy(false);}
  };
  const rematch=async()=>{
    if(!online||busy)return;
    setBusy(true);setError("");
    try{const response=await api({action:"rematch",room,token});if(response.game)setGame(response.game);}
    catch(err){setError(errorMessage(err));}
    finally{setBusy(false);}
  };
  const practice=()=>{
    setMode("practice");setRoom(null);setToken(null);setSide(1);setGame(freshGame(2));setError("");
    const url=new URL(window.location.href);
    url.searchParams.delete("room");
    window.history.replaceState(null,"",url);
  };
  return {mode,ready,room,side,token,game,setGame,error,busy,create,join,play,rematch,practice};
}

export default function DuelGame({standalone=false}:{standalone?:boolean}) {
  const initialRoom=useRef(roomFromUrl()).current;
  const online=useOnlineGame(initialRoom);
  const setGame=online.setGame;
  const [copied,setCopied]=useState(false);
  const [entry,setEntry]=useState(initialRoom||"");
  const [cpuThinking,setCpuThinking]=useState(false);
  const cpuTimer=useRef<number|undefined>(undefined);
  const url=online.room?window.location.origin+"/play/duel?room="+online.room:null;
  const game=online.game;
  const practiceMode=online.mode==="practice";
  const yourTurn=practiceMode?game.turn===1:game.turn===online.side;
  const matchDone=game.status==="finished";
  const waiting=online.mode==="online"&&game.status==="waiting";

  useEffect(()=>{
    if(!practiceMode||game.status!=="active"||game.turn!==2)return;
    setCpuThinking(true);
    cpuTimer.current=window.setTimeout(()=>{
      setGame(current=>{
        if(current.status!=="active"||current.turn!==2)return current;
        const index=choosePracticeMove(current);
        return index<0?current:toSnapshot(place(current,2,index));
      });
      setCpuThinking(false);
    },560);
    return()=>window.clearTimeout(cpuTimer.current);
  },[practiceMode,game.turn,game.status,game.version,setGame]);

  const select=async(index:number)=>{
    if(game.status!=="active"||!yourTurn||online.busy||cpuThinking)return;
    if(practiceMode)online.setGame(current=>toSnapshot(place(current,1,index)));
    else await online.play(index);
  };
  const restart=()=>{
    if(practiceMode)online.setGame(freshGame(2));
    else void online.rematch();
  };
  const share=async()=>{
    if(!url)return;
    try{await navigator.clipboard.writeText(url);setCopied(true);}
    catch{setCopied(false);}
  };
  const winner=game.winner===1?"WEST → EAST":"NORTH → SOUTH";
  const label=waiting?"WAITING FOR CHALLENGER":matchDone?winner+" CONNECTED":cpuThinking?"CPU THINKING":yourTurn?"YOUR TURN":"OPPONENT TURN";

  return <div className={standalone?"duel-experience duel-fullpage":"duel-experience"} data-mode={online.mode}>
    <div className="duel-topline"><span>GAME 002 <i>◈</i> TRACE / HEX</span><span>{online.mode==="online"?"● LIVE ROOM":"LOCAL / PRACTICE"}</span></div>
    <div className="duel-stage">
      <div className="duel-backdrop" aria-hidden="true"><span>HEX</span><span>7×7</span></div>
      <div className="duel-board-wrap">
        <div className="duel-edge duel-edge-top">NORTH / LIME</div>
        <div className="duel-board" role="group" aria-label="7 by 7 hex connection board">
          {Array.from({length:SIZE},(_,r)=><div className="duel-board-row" key={r} style={{"--row":r} as CSSProperties}>
            {Array.from({length:SIZE},(_,q)=>{
              const index=r*SIZE+q,cell=game.board[index];
              const linked=game.path.includes(index),recent=game.lastMove===index;
              const adjacent=cell!==0?neighbors(index).filter(n=>game.board[n]===cell).length:0;
              const classes="duel-hex "+(cell===1?"owned-one":cell===2?"owned-two":"")+
                (linked?" linked":"")+(recent?" recent":"");
              const description="Row "+(r+1)+", column "+(q+1)+", "+
                (cell===0?"empty":cell===1?"coral":"lime")+
                (recent?", last move":"")+(linked?", winning connection":"");
              return <button type="button" className={classes} key={index}
                disabled={game.status!=="active"||!yourTurn||cell!==0||online.busy||cpuThinking}
                onClick={()=>void select(index)}
                aria-label={description} data-cell={index} data-neighbors={adjacent}>
                <span className="duel-hex-core">{cell===1?"◆":cell===2?"✳":""}</span>
              </button>;
            })}
          </div>)}
        </div>
        <div className="duel-edge duel-edge-bottom">SOUTH / LIME</div>
      </div>
      <div className="duel-edge-left" aria-hidden="true">WEST / CORAL</div>
      <div className="duel-edge-right" aria-hidden="true">EAST / CORAL</div>
      <div className="duel-stage-gloss" aria-hidden="true"/>
    </div>
    <div className="duel-controls">
      <div className="duel-player-indicator"><span className={game.turn===1?"duel-mark coral active":"duel-mark coral"}>◆</span>
        <div><strong>{practiceMode||online.side===1?"YOU / CORAL":"OPPONENT / CORAL"}</strong><small>CONNECT WEST ↔ EAST</small></div>
      </div>
      <div className="duel-status" role="status"><span>{label}</span><small>{game.moves} MOVES / VERSION {game.version}</small></div>
      <div className="duel-player-indicator right"><div><strong>{practiceMode?"CPU / LIME":online.side===2?"YOU / LIME":"OPPONENT / LIME"}</strong><small>CONNECT NORTH ↕ SOUTH</small></div>
        <span className={game.turn===2?"duel-mark lime active":"duel-mark lime"}>✳</span></div>
    </div>
    <div className="duel-lobby">
      <div className="duel-lobby-intro"><span>HOW TO PLAY</span><p>Claim adjacent hex nodes. Coral connects left to right; lime connects top to bottom. First complete circuit wins.</p></div>
      <div className="duel-room">
        {practiceMode?<>
          <span className="duel-room-caption">PRACTICE AGAINST THE LOCAL CPU</span>
          <div className="duel-commands">
            <button type="button" className="duel-button primary" onClick={restart}><RotateCcw size={17}/> NEW ROUND</button>
            {online.ready===true&&<button type="button" className="duel-button secondary" onClick={()=>void online.create()} disabled={online.busy}><Users size={17}/> CREATE ONLINE ROOM</button>}
            {online.ready===false&&<small className="duel-online-unavailable">Online rooms are not configured. Solo play works without a server.</small>}
            {online.ready===null&&<small>CHECKING ONLINE AVAILABILITY…</small>}
          </div>
          {online.ready===true&&<div className="duel-join-line">
            <label htmlFor={standalone?"duel-room-standalone":"duel-room-embedded"}>HAVE A ROOM CODE?</label>
            <input id={standalone?"duel-room-standalone":"duel-room-embedded"} placeholder="ROOM CODE" value={entry} maxLength={12} onChange={e=>setEntry(e.target.value.trim())}/>
            <button type="button" disabled={entry.length!==12||online.busy} onClick={()=>void online.join(entry)}>JOIN <ArrowUpRight size={15}/></button>
          </div>}
          {initialRoom&&!online.token&&<div className="duel-invite"><span>INVITED TO ROOM {initialRoom}</span><button type="button" disabled={online.busy||online.ready!==true} onClick={()=>void online.join(initialRoom)}>ACCEPT INVITE <ArrowUpRight size={14}/></button></div>}
        </>:<>
          <span className="duel-room-caption">{online.room?"ROOM "+online.room:"CONNECTING…"}</span>
          <div className="duel-commands">
            {url&&<button type="button" className="duel-button primary" onClick={()=>void share()}><Copy size={17}/>{copied?"LINK COPIED":"COPY INVITE LINK"} {copied&&<Check size={15}/>}</button>}
            {matchDone&&<button type="button" className="duel-button secondary" disabled={online.busy} onClick={restart}><RotateCcw size={16}/> REMATCH</button>}
            <button type="button" className="duel-button tertiary" onClick={online.practice}>LEAVE ROOM</button>
          </div>
          <small className="duel-sync-info">SYNC ~3S · TURN-BASED · ROOM EXPIRES IN 8 HOURS</small>
        </>}
        {online.error&&<p className="duel-error" role="alert">{online.error}</p>}
        {!standalone&&<a href={url||"/play/duel"} className="duel-open-full" target="_blank" rel="noopener noreferrer">OPEN DEDICATED ARENA <ExternalLink size={17}/></a>}
        {standalone&&<a className="duel-open-full" href="/#play">BACK TO EXHIBITION <ArrowLeft size={17}/></a>}
      </div>
    </div>
    <div className="duel-tail"><span>CONNECTIONS ARE COMPUTED WITH GRAPH SEARCH</span><span><Link2 size={13}/> TWO PLAYERS / ONE BOARD</span></div>
  </div>;
}
