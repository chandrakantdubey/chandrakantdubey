import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, Copy, Headphones, HeadphoneOff, Play, RotateCcw, ShieldPlus, Share2, Users } from "lucide-react";
import {
  COLS, ROWS, ROUND_MS, KINDS, newPacketGame, beginPacketGame,
  advancePacketGame, rotatePacketTile, patchPacketNetwork, timeRemaining, waveForTick,
  type PacketGameState,
} from "./packetEngine.js";
import { challengeSeed, resultShareText, utcChallengeDay } from "./dailyChallenge";

type Mode="solo"|"online";
type RoomResponse={
  enabled?:boolean;room?:string;token?:string;player?:1|2;players?:number;
  game?:PacketGameState;serverNow?:number;error?:string;
};
const ROOM_CODE=/^[A-Za-z0-9_-]{12}$/;
function roomFromLink():string {
  if(typeof window==="undefined")return "";
  const value=new URLSearchParams(window.location.search).get("room")??"";
  return ROOM_CODE.test(value)?value:"";
}
function savedToken(room:string):string {
  try{return window.localStorage.getItem("packet-room-"+room)??"";}catch{return "";}
}
function saveToken(room:string,token:string):void {
  try{window.localStorage.setItem("packet-room-"+room,token);}catch{/* private mode */}
}
function setLinkRoom(room:string|null):void {
  const url=new URL(window.location.href);
  if(room)url.searchParams.set("room",room);
  else url.searchParams.delete("room");
  window.history.replaceState(null,"",url);
}
async function requestPacket(payload:Record<string,unknown>):Promise<RoomResponse> {
  const result=await fetch("/api/packet",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload),cache:"no-store",signal:AbortSignal.timeout(11000),
  });
  const data=await result.json() as RoomResponse;
  if(!result.ok)throw Error(data.error||"The room service is having a moment.");
  return data;
}
function messageFrom(error:unknown):string {
  return error instanceof Error?error.message:"The signal dropped. Try again.";
}
const PORT_LINES=[
  {bit:1,d:"M50 50 V0"},{bit:2,d:"M50 50 H100"},
  {bit:4,d:"M50 50 V100"},{bit:8,d:"M50 50 H0"},
];

function tone(ref:React.RefObject<AudioContext|null>,frequency:number,duration=.085):void {
  try{
    const ctx=ref.current??new AudioContext();ref.current=ctx;
    if(ctx.state==="suspended")void ctx.resume();
    const oscillator=ctx.createOscillator(),gain=ctx.createGain();
    oscillator.type="sine";
    oscillator.frequency.setValueAtTime(frequency,ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency*.7,ctx.currentTime+duration);
    gain.gain.setValueAtTime(.065,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
    oscillator.connect(gain);gain.connect(ctx.destination);
    oscillator.start();oscillator.stop(ctx.currentTime+duration);
  }catch{/* sound is an enhancement, never a dependency */}
}
export default function PacketPanic({standalone=false}:{standalone?:boolean}) {
  const initialRoom=useRef(roomFromLink()).current;
  const [mode,setMode]=useState<Mode>(initialRoom&&savedToken(initialRoom)?"online":"solo");
  const [game,setGame]=useState<PacketGameState>(()=>newPacketGame(Date.now(),1));
  const [room,setRoom]=useState(initialRoom&&savedToken(initialRoom)?initialRoom:"");
  const [token,setToken]=useState(initialRoom?savedToken(initialRoom):"");
  const [invite,setInvite]=useState(initialRoom);
  const [roomEntry,setRoomEntry]=useState(initialRoom);
  const [player,setPlayer]=useState<1|2>(1);
  const [onlineAvailable,setOnlineAvailable]=useState<boolean|null>(null);
  const [busy,setBusy]=useState(false);
  const [copied,setCopied]=useState(false);
  const [notice,setNotice]=useState("");
  const [now,setNow]=useState(()=>Date.now());
  const [soundOn,setSoundOn]=useState(false);
  const challengeDay=useRef(utcChallengeDay()).current;
  const [daily,setDaily]=useState(false);
  const [dailyBest,setDailyBest]=useState(()=>{
    try{return Number(localStorage.getItem("cd-packet-daily-"+utcChallengeDay())||0)||0;}
    catch{return 0;}
  });
  const reported=useRef("");
  const audio=useRef<AudioContext|null>(null);
  const lastEventId=useRef(-1);
  const pollBusy=useRef(false);
  const mounted=useRef(true);
  const connected=mode==="online"&&!!room&&!!token;
  const playing=game.phase==="playing";
  const finished=game.phase==="won"||game.phase==="lost";
  const remaining=Math.ceil(timeRemaining(game,now)/1000);
  const progress=game.phase==="ready"?0:(ROUND_MS-timeRemaining(game,now))/ROUND_MS;
  const wave=waveForTick(game.tick);
  const canPlay=playing&&!busy;
  const inviteLink=room?window.location.origin+"/play/packet?room="+encodeURIComponent(room):"";
  const activePlayers=connected?game.players:1;
  const myColumns=player===1?"01–04":"05–07";
  const challengeId=challengeDay.replaceAll("-","");

  useEffect(()=>{
    mounted.current=true;
    const controller=new AbortController();
    void fetch("/api/packet",{signal:controller.signal,cache:"no-store"})
      .then(response=>response.json()).then((data:{enabled?:boolean})=>{
        if(!controller.signal.aborted)setOnlineAvailable(data.enabled===true);
      }).catch(()=>{if(!controller.signal.aborted)setOnlineAvailable(false);});
    return()=>{mounted.current=false;controller.abort();};
  },[]);

  const applyServer=useCallback((response:RoomResponse)=>{
    if(response.game)setGame(previous=>
      mode==="online"&&previous.version>response.game!.version?previous:response.game!);
  },[mode]);
  const sync=useCallback(async()=>{
    if(!connected||pollBusy.current||document.hidden)return;
    pollBusy.current=true;
    try{
      const response=await requestPacket({action:"snapshot",room,token});
      if(mounted.current)applyServer(response);
    }catch(error){
      if(mounted.current)setNotice(messageFrom(error));
    }finally{pollBusy.current=false;}
  },[applyServer,connected,room,token]);

  useEffect(()=>{
    if(!connected)return;
    void sync();
    const timer=window.setInterval(()=>void sync(),1050);
    const wake=()=>{if(!document.hidden)void sync();};
    document.addEventListener("visibilitychange",wake);
    return()=>{window.clearInterval(timer);document.removeEventListener("visibilitychange",wake);};
  },[connected,sync]);

  useEffect(()=>{
    const timer=window.setInterval(()=>{
      const time=Date.now();setNow(time);
      if(mode==="solo")setGame(previous=>advancePacketGame(previous,time));
    },120);
    return()=>window.clearInterval(timer);
  },[mode]);

  useEffect(()=>{
    if(!soundOn||game.eventId===lastEventId.current)return;
    lastEventId.current=game.eventId;
    if(game.lastEvent==="delivered")tone(audio,880,.13);
    else if(game.lastEvent==="dropped"||game.lastEvent==="outage")tone(audio,180,.18);
    else if(game.lastEvent==="incident")tone(audio,420,.15);
    else if(game.lastEvent==="survived")tone(audio,1100,.3);
  },[game.eventId,game.lastEvent,soundOn]);

  useEffect(()=>()=>{if(audio.current)void audio.current.close();},[]);

  useEffect(()=>{
    if(!finished||game.startedAt===null)return;
    const key=[mode,room,game.seed,game.startedAt].join(":");
    if(reported.current===key)return;
    reported.current=key;
    window.dispatchEvent(new CustomEvent("cd:packet-result",{
      detail:{won:game.phase==="won",score:game.score,integrity:game.integrity,
        delivered:game.delivered,cooperative:mode==="online"},
    }));
    if(mode==="solo"&&daily&&game.score>dailyBest){
      setDailyBest(game.score);
      try{localStorage.setItem("cd-packet-daily-"+challengeDay,String(game.score));}
      catch{/* local personal best is optional */}
    }
  },[finished,game.phase,game.startedAt,game.seed,game.score,game.integrity,game.delivered,mode,room,daily,dailyBest,challengeDay]);

  const solo=()=>{
    setMode("solo");setGame(newPacketGame(Date.now(),1));setRoom("");setToken("");
    setInvite("");setNotice("");setCopied(false);setLinkRoom(null);setDaily(false);
  };
  const startDaily=()=>{
    setMode("solo");setDaily(true);setRoom("");setToken("");setInvite("");
    setNotice("");setLinkRoom(null);
    setGame(beginPacketGame(newPacketGame(challengeSeed(challengeDay),1),Date.now()));
    if(soundOn)tone(audio,670,.14);
  };
  const playSolo=()=>{
    setMode("solo");setNotice("");setGame(previous=>beginPacketGame(previous,Date.now()));
    if(soundOn)tone(audio,520,.16);
  };
  const create=async()=>{
    setBusy(true);setNotice("");
    try{
      const response=await requestPacket({action:"create"});
      if(!response.room||!response.token||!response.game)throw Error("Incomplete room response.");
      saveToken(response.room,response.token);
      setRoom(response.room);setToken(response.token);setPlayer(1);
      setMode("online");setDaily(false);setGame(response.game);setInvite("");setRoomEntry(response.room);
      setLinkRoom(response.room);
    }catch(error){setNotice(messageFrom(error));}
    finally{setBusy(false);}
  };
  const join=async(value:string)=>{
    if(!ROOM_CODE.test(value)){setNotice("That invite code doesn't look right.");return;}
    setBusy(true);setNotice("");
    try{
      const existing=savedToken(value);
      const response=await requestPacket(existing
        ?{action:"snapshot",room:value,token:existing}
        :{action:"join",room:value});
      if(!response.game||(!response.token&&!existing))throw Error("Incomplete room response.");
      const secret=response.token||existing;
      saveToken(value,secret);
      setRoom(value);setToken(secret);setMode("online");setDaily(false);
      setPlayer(response.player||2);setGame(response.game);
      setInvite("");setRoomEntry(value);setLinkRoom(value);
    }catch(error){setNotice(messageFrom(error));}
    finally{setBusy(false);}
  };
  const send=async(action:"start"|"rotate"|"patch"|"restart",index?:number)=>{
    if(!connected||busy)return;
    const commandId=crypto.randomUUID();
    setBusy(true);setNotice("");
    try{
      const response=await requestPacket({action,room,token,commandId,...(index===undefined?{}:{index})});
      applyServer(response);
      if(soundOn&&action==="rotate")tone(audio,320,.06);
    }catch(error){setNotice(messageFrom(error));await sync();}
    finally{setBusy(false);}
  };
  const rotate=(index:number)=>{
    if(!canPlay)return;
    if(mode==="solo"){
      setGame(previous=>rotatePacketTile(previous,index));
      if(soundOn)tone(audio,300+index*6,.06);
    }else void send("rotate",index);
  };
  const patch=()=>{
    if(!canPlay||game.patches<=0||game.integrity>=100)return;
    if(mode==="solo"){
      setGame(previous=>patchPacketNetwork(previous));
      if(soundOn)tone(audio,660,.14);
    }else void send("patch");
  };
  const restart=()=>{
    if(mode==="solo"){if(daily)startDaily();else solo();}
    else void send("restart");
  };
  const share=async()=>{
    if(!inviteLink)return;
    try{await navigator.clipboard.writeText(inviteLink);setCopied(true);setNotice("Invite link copied. Find a competent co-pilot.");}
    catch{setNotice("Copy the room link from your address bar.");}
  };
  const shareScore=async()=>{
    const message=resultShareText(challengeDay,game.score,game.delivered,game.integrity,game.phase==="won");
    try{await navigator.clipboard.writeText(message);setNotice("Result copied. Go humble somebody.");}
    catch{setNotice("Clipboard unavailable. The score is still visible above.");}
  };
  const toggleSound=()=>{
    setSoundOn(enabled=>!enabled);
    if(!soundOn)tone(audio,600,.07);
  };
  const headline=game.phase==="won"?"SYSTEM SAVED.":game.phase==="lost"?"TOTAL OUTAGE.":playing?"KEEP IT FLOWING.":"THE NETWORK IS YOURS.";
  const status=game.phase==="won"
    ?"90 seconds. Internet intact. Absolutely no one noticed."
    :game.phase==="lost"
      ?"The packets have unionized. Try a different route."
      :playing?"Tap a router to rotate it. Match the incoming and outgoing ports."
        :connected&&activePlayers===1?"Waiting for operator two. Send that invite."
          :"Two inputs. Many terrible routing decisions.";
  return <div className={standalone?"packet-experience packet-fullpage":"packet-experience"} data-mode={mode} data-phase={game.phase}>
    <div className="packet-atmosphere" aria-hidden="true"/>
    <div className="packet-topline">
      <div className="packet-brand"><span className="packet-live-dot"/> PACKET PANIC <span className="packet-brand-icon">✳</span></div>
      <div className="packet-top-actions">
        <span className="packet-connectivity">{connected?activePlayers+"/2 OPERATORS ONLINE":"SOLO / LOCAL ENGINE"}</span>
        <button type="button" className="packet-icon-button" onClick={toggleSound}
          aria-label={soundOn?"Mute arcade sounds":"Enable arcade sounds"}>
          {soundOn?<Headphones size={18}/>:<HeadphoneOff size={18}/>}
        </button>
      </div>
    </div>

    <div className="packet-masthead">
      <div><span className="packet-masthead-kicker">SOMEONE UNPLUGGED SOMETHING. AGAIN.</span>
        <h3>DON'T <em>DROP</em><br/>THE PACKET<span>.</span></h3>
      </div>
      <div className="packet-masthead-side"><span>001 / SYSTEM IN DISTRESS</span><p>Rotate the routers. Connect the paths. Deliver the signals. Your entire network has 90 seconds to stop embarrassing you.</p></div>
    </div>

    <div className="packet-hud" aria-label="Current network status">
      <div className="packet-hud-main"><span>NETWORK INTEGRITY</span>
        <strong className={game.integrity<30?"packet-danger":""}>{game.integrity}<small>%</small></strong>
        <div className="packet-integrity-bar"><i style={{width:game.integrity+"%"}}/></div>
      </div>
      <div className="packet-hud-item"><span>TIME LEFT</span><strong className="packet-time">{String(Math.floor(remaining/60)).padStart(2,"0")}:{String(remaining%60).padStart(2,"0")}</strong></div>
      <div className="packet-hud-item"><span>DELIVERED</span><strong>{String(game.delivered).padStart(2,"0")}</strong></div>
      <div className="packet-hud-item"><span>LOST</span><strong className="packet-danger">{String(game.missed).padStart(2,"0")}</strong></div>
      <div className="packet-hud-item"><span>SCORE</span><strong>{game.score.toLocaleString()}</strong></div>
    </div>
    <div className="packet-round-progress"><span style={{width:(progress*100)+"%"}}/></div>

    <div className="packet-arena">
      <div className="packet-orbit orbit-one" aria-hidden="true"/>
      <div className="packet-orbit orbit-two" aria-hidden="true"/>
      <div className="packet-arena-heading">
        <span><i/> {playing?"LIVE NETWORK":"NETWORK STANDBY"}</span>
        <span>WAVE {wave}/3 <b>·</b> {game.packets.length} SIGNALS IN FLIGHT</span>
      </div>
      <div className="packet-board-frame">
        <div className="packet-board" role="group" aria-label="Seven column by five row routing network">
          {game.tiles.map((tile,index)=>{
            const endpoint=tile.col===0&&(tile.row===1||tile.row===3);
            const sink=tile.col===COLS-1&&(tile.row===1||tile.row===3);
            const isFault=game.lastFault===index&&game.tick-game.faultAtTick<8;
            const mask=KINDS[tile.kind];
            return <button key={index} type="button" data-node={index}
              className={"packet-node"+(endpoint?" packet-entry":"")+(sink?" packet-exit":"")+(isFault?" packet-fault":"")}
              disabled={!canPlay}
              onClick={()=>rotate(index)}
              aria-label={"Router row "+(tile.row+1)+", column "+(tile.col+1)+", "+tile.kind+", rotate clockwise"}
              title="Rotate 90° clockwise">
              <span className="packet-node-index">{String(index+1).padStart(2,"0")}</span>
              <svg className="packet-wires" viewBox="0 0 100 100" aria-hidden="true"
                style={{transform:"rotate("+(tile.rotation*90)+"deg)"}}>
                {PORT_LINES.filter(p=>mask&p.bit).map(p=><g key={p.bit}>
                  <path d={p.d} className="packet-wire-glow"/>
                  <path d={p.d} className="packet-wire-core"/>
                </g>)}
                <circle cx="50" cy="50" r="10" className="packet-router-centre"/>
                <circle cx="50" cy="50" r="4" className="packet-router-pin"/>
              </svg>
              {endpoint&&<span className={"packet-endpoint packet-endpoint-in packet-color-"+(tile.row===1?0:1)}>IN</span>}
              {sink&&<span className={"packet-endpoint packet-endpoint-out packet-color-"+(tile.row===1?0:1)}>OUT</span>}
              <span className="packet-rotate-hint" aria-hidden="true">↻</span>
            </button>;
          })}
          <div className="packet-particle-layer" aria-hidden="true">
            {game.packets.map(packet=><span key={packet.id}
              className={"packet-particle packet-particle-"+packet.color}
              style={{left:((packet.col+.5)/COLS*100)+"%",top:((packet.row+.5)/ROWS*100)+"%"}}/>)}
          </div>
        </div>
        <div className="packet-edge-marker packet-edge-left">DATA IN <span>◆</span></div>
        <div className="packet-edge-marker packet-edge-right">DATA OUT <span>✦</span></div>
      </div>
      {game.phase==="ready"&&<div className="packet-screen">
        <div className="packet-screen-noise" aria-hidden="true"/>
        <div className="packet-screen-content">
          <span className="packet-eyebrow">{connected?"CO-OP SESSION CONNECTED":invite?"YOU'VE BEEN SUMMONED":"SYSTEM READY / NO PRESSURE"}</span>
          <strong>{connected&&activePlayers===1?"NEED ONE\nMORE HUMAN.":connected?"TWO BRAINS.\nONE NETWORK.":invite?"YOUR FRIEND\nNEEDS HELP.":"SAVE THE\nINTERNET."}</strong>
          <p>{connected&&activePlayers===1?"Send your partner the invite. Both of you can rotate every router.":
            connected?"Operator one starts the round. Both players share the same damage, score and repair charges.":
            invite?"Join their room and collaboratively reroute packets before everything breaks.":
            "Rotate circuit tiles to build paths from IN to OUT. Cyan and lime packets each have their own destination. Survive three waves."}</p>
          {connected ? (activePlayers===1?
            <button type="button" className="packet-start" onClick={()=>void share()}>{copied?"LINK COPIED":"COPY INVITE LINK"} <Copy size={18}/></button> :
            player===1?<button className="packet-start" type="button" disabled={busy} onClick={()=>void send("start")}>START CO-OP <Play size={18}/></button>:
            <span className="packet-wait">WAITING FOR YOUR HOST TO PANIC…</span>)
            :invite&&onlineAvailable===true?
              <button className="packet-start" type="button" onClick={()=>void join(invite)} disabled={busy}>JOIN THEIR NETWORK <Users size={19}/></button>:
              <button className="packet-start" type="button" onClick={playSolo}>PLAY SOLO <Play size={18}/></button>}
        </div>
      </div>}
      {finished&&<div className="packet-screen packet-results">
        <div className="packet-screen-content">
          <span className="packet-eyebrow">{game.phase==="won"?"INCIDENT RESOLVED":"INCIDENT REPORT: ABSOLUTELY NOT"}</span>
          <strong>{headline}</strong>
          <p>{status}</p>
          <div className="packet-result-stats"><span>{game.score.toLocaleString()} PTS</span><span>{game.delivered} DELIVERED</span><span>{game.integrity}% HEALTH</span></div>
          {mode==="solo"?<button type="button" className="packet-start" onClick={restart}>RUN IT BACK <RotateCcw size={18}/></button>:
            player===1?<button type="button" className="packet-start" disabled={busy} onClick={restart}>NEW CO-OP ROUND <RotateCcw size={18}/></button>:
            <span className="packet-wait">HOST CAN START A REMATCH</span>}
        </div>
      </div>}
    </div>

    <div className="packet-commandbar">
      <div className="packet-command-status" role="status" aria-live="polite">
        <span className={playing?"packet-command-flash":""}>{playing?"●":"○"} {playing?"NETWORK UNDER LOAD":finished?"ROUND COMPLETE":"READY TO ROUTE"}</span>
        <strong>{status}</strong>
      </div>
      <div className="packet-tools">
        <div className="packet-wave-stamp">SURVIVE 90 SECONDS <span>·</span> WAVE {wave} / 3</div>
        <button className="packet-repair" type="button" disabled={!canPlay||game.patches===0||game.integrity>=100}
          onClick={patch}><ShieldPlus size={18}/> PATCH NETWORK <b>{game.patches} LEFT</b></button>
      </div>
    </div>
    <div className="packet-bottom">
      <div className="packet-mode-toolbar">
        {mode==="solo"?<>
          <button type="button" className="packet-toolbar-primary" disabled={busy||onlineAvailable!==true}
            onClick={()=>void create()}><Users size={17}/> PLAY WITH A FRIEND <ArrowUpRight size={16}/></button>
          <div className="packet-room-entry"><label htmlFor={standalone?"packet-join-full":"packet-join-home"}>HAVE AN INVITE?</label>
            <input id={standalone?"packet-join-full":"packet-join-home"} type="text" maxLength={12}
              value={roomEntry} onChange={event=>setRoomEntry(event.target.value.trim())}
              placeholder="ROOM CODE" autoComplete="off" spellCheck={false}/>
            <button type="button" disabled={busy||onlineAvailable!==true||!ROOM_CODE.test(roomEntry)}
              onClick={()=>void join(roomEntry)}>JOIN <ArrowUpRight size={15}/></button>
          </div>
          {onlineAvailable===false&&<span className="packet-offline">ONLINE OFFLINE. SOLO NEVER IS.</span>}
        </>:<>
          <div className="packet-share"><span>ROOM {room}</span>
            <button type="button" onClick={()=>void share()}>{copied?<Check size={17}/>:<Copy size={17}/>} {copied?"COPIED":"COPY INVITE"}</button>
          </div>
          <button type="button" className="packet-leave" onClick={solo}><ArrowLeft size={17}/> BACK TO SOLO</button>
        </>}
      </div>
      <div className="packet-bottom-note">
        <span>CLICK / TAP = ROTATE 90°</span><span>CYAN ↗ TOP ROUTE <b>✳</b> LIME ↘ BOTTOM ROUTE</span>
        <span>{connected?"SHARED STATE · SYNC ~1S":"ZERO LOGINS · ALL YOUR MISTAKES"}</span>
      </div>
      {notice&&<p className="packet-notice" role="alert">{notice}</p>}
    </div>
  </div>;
}
