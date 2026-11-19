import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play, RotateCcw, Zap } from "lucide-react";
import {
  HEIGHT,WIDTH,NO_INPUT,newFluxGame,startFlux,updateFlux,
  type FluxControls,type FluxState,
} from "./fluxEngine.ts";

function draw(ctx:CanvasRenderingContext2D,s:FluxState,now:number,reduced:boolean){
  const w=WIDTH,h=HEIGHT;
  ctx.fillStyle="#081018";ctx.fillRect(0,0,w,h);
  const glow=ctx.createRadialGradient(w*.55,h*.6,24,w*.55,h*.6,w*.75);
  glow.addColorStop(0,"#182b46");
  glow.addColorStop(.53,"#0c1629");
  glow.addColorStop(1,"#060a16");
  ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);

  const scroll=reduced?0:now*.011;
  ctx.strokeStyle="#507b9130";ctx.lineWidth=1;
  ctx.beginPath();
  for(let i=-2;i<24;i++){
    const x=i*48+(scroll%48);
    ctx.moveTo(x,0);ctx.lineTo(x,h);
  }
  for(let i=-1;i<15;i++){
    const y=i*48+((scroll*.45)%48);
    ctx.moveTo(0,y);ctx.lineTo(w,y);
  }
  ctx.stroke();
  ctx.save();
  ctx.strokeStyle="#b4ebff27";ctx.lineWidth=2;
  ctx.strokeRect(19,19,w-38,h-38);
  for(const [x,y,sx,sy] of [[25,25,1,1],[w-25,25,-1,1],[25,h-25,1,-1],[w-25,h-25,-1,-1]]){
    ctx.beginPath();ctx.moveTo(x+sx*21,y);ctx.lineTo(x,y);ctx.lineTo(x,y+sy*21);ctx.stroke();
  }
  ctx.restore();

  for(const entity of s.objects){
    ctx.save();ctx.translate(entity.x,entity.y);
    if(entity.kind==="spark"){
      const spin=reduced?0:now*.0014+entity.phase;
      ctx.rotate(spin);ctx.shadowColor="#dafa84";ctx.shadowBlur=24;
      ctx.fillStyle="#dafe8e";ctx.beginPath();
      ctx.moveTo(0,-entity.r-5);ctx.lineTo(entity.r+5,0);
      ctx.lineTo(0,entity.r+5);ctx.lineTo(-entity.r-5,0);
      ctx.closePath();ctx.fill();
      ctx.shadowBlur=0;ctx.strokeStyle="#1d5150";ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle="#ecfff3";ctx.fillRect(-3,-3,6,6);
    }else{
      const rot=reduced?0:now*.0018+entity.phase;
      ctx.rotate(rot);
      ctx.shadowColor="#ff705d";ctx.shadowBlur=15;
      ctx.fillStyle="#ff634f";ctx.strokeStyle="#ffd8b0";ctx.lineWidth=1.3;
      ctx.beginPath();
      for(let k=0;k<7;k++){
        const t=Math.PI*2*k/7;
        const r=entity.r*(k%2===0?1:.87);
        if(k===0)ctx.moveTo(Math.cos(t)*r,Math.sin(t)*r);
        else ctx.lineTo(Math.cos(t)*r,Math.sin(t)*r);
      }
      ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.stroke();
      ctx.fillStyle="#5e1931";ctx.beginPath();ctx.arc(0,0,entity.r*.39,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  ctx.save();ctx.translate(s.x,s.y);
  if(s.phase==="playing"&&s.invulnerable>0){
    ctx.beginPath();ctx.arc(0,0,34+(1.6-s.invulnerable)*12,0,Math.PI*2);
    ctx.strokeStyle="rgba(126,247,255,"+(s.invulnerable/1.6*.56)+")";
    ctx.lineWidth=2;ctx.stroke();
  }
  const heading=Math.atan2(s.vy,s.vx);
  ctx.rotate(Math.hypot(s.vx,s.vy)>3?heading+Math.PI/2:0);
  ctx.shadowBlur=30;ctx.shadowColor="#91ebfa";
  ctx.fillStyle="#d8faff";ctx.beginPath();
  ctx.moveTo(0,-21);ctx.lineTo(15,16);ctx.lineTo(0,9);ctx.lineTo(-15,16);ctx.closePath();ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle="#1b5d91";ctx.beginPath();
  ctx.moveTo(0,-11);ctx.lineTo(7,10);ctx.lineTo(0,6);ctx.lineTo(-7,10);ctx.closePath();ctx.fill();
  if(Math.hypot(s.vx,s.vy)>20){
    ctx.fillStyle="#e7fb8a";ctx.beginPath();ctx.moveTo(-5,13);ctx.lineTo(0,24+Math.sin(now*.035)*7);ctx.lineTo(5,13);ctx.fill();
  }
  ctx.restore();

  const track=ctx.createLinearGradient(0,0,w,0);
  track.addColorStop(0,"#d7fc88");track.addColorStop(1,"#59d6fe");
  ctx.fillStyle=track;ctx.fillRect(19,h-20,(w-38)*Math.min(s.streak/20,1),3);
}

function useStoredBest():[number,(score:number)=>void]{
  const [best,setBest]=useState(()=>{
    try{return Math.max(0,Number(window.localStorage.getItem("cd-signal-shift-best")||0)||0);}catch{return 0;}
  });
  const update=(score:number)=>{
    if(score<=best)return;
    setBest(score);
    try{window.localStorage.setItem("cd-signal-shift-best",String(score));}catch{/* storage disabled */}
  };
  return [best,update];
}

export default function FluxGame() {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const stageRef=useRef<HTMLDivElement>(null);
  const stateRef=useRef<FluxState>(newFluxGame());
  const inputRef=useRef<FluxControls>({...NO_INPUT});
  const frameRef=useRef(0);
  const [ui,setUi]=useState({phase:"idle" as FluxState["phase"],score:0,streak:0,health:3,wave:1});
  const [best,updateBest]=useStoredBest();
  const bestRef=useRef(updateBest);
  bestRef.current=updateBest;

  const sync=useCallback(()=>{
    const s=stateRef.current;
    setUi({phase:s.phase,score:s.score,streak:s.streak,health:s.health,wave:s.wave});
    bestRef.current(s.score);
  },[]);
  const start=()=>{
    const next=stateRef.current.phase==="over"?newFluxGame(Date.now()>>>0):stateRef.current;
    stateRef.current=startFlux({...next,phase:"idle"});
    stageRef.current?.focus({preventScroll:true});
    sync();
  };
  const pause=()=>{
    const s=stateRef.current;
    stateRef.current={...s,phase:s.phase==="paused"?"playing":s.phase==="playing"?"paused":s.phase};
    sync();
  };
  const reset=()=>{
    stateRef.current=newFluxGame(Date.now()>>>0);
    inputRef.current={...NO_INPUT};
    sync();
  };

  useEffect(()=>{
    const canvas=canvasRef.current,stage=stageRef.current;
    if(!canvas||!stage)return;
    const ctx=canvas.getContext("2d",{alpha:false});
    if(!ctx)return;
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible=true,reduced=motion.matches,alive=true,last=0,lastStats=0;
    let pointerHeld=false;
    const render=(now:number)=>{
      frameRef.current=0;
      if(!alive||!visible||document.hidden)return;
      const dt=last?Math.min(.047,(now-last)/1000):0;
      last=now;
      let s=stateRef.current;
      if(s.phase==="playing"&&dt>0){
        const count=Math.min(3,Math.ceil(dt/(1/60)));
        for(let i=0;i<count;i++)s=updateFlux(s,inputRef.current,dt/count);
        stateRef.current=s;
      }
      draw(ctx,s,now,reduced);
      if(now-lastStats>145){
        lastStats=now;
        setUi(old=>{
          if(old.phase===s.phase&&old.score===s.score&&old.health===s.health&&old.streak===s.streak&&old.wave===s.wave)return old;
          return {phase:s.phase,score:s.score,health:s.health,streak:s.streak,wave:s.wave};
        });
        if(s.phase==="over")bestRef.current(s.score);
      }
      frameRef.current=requestAnimationFrame(render);
    };
    const schedule=()=>{
      if(!alive||!visible||document.hidden)return;
      last=0;
      if(!frameRef.current)frameRef.current=requestAnimationFrame(render);
    };
    const stop=()=>{
      if(frameRef.current)cancelAnimationFrame(frameRef.current);
      frameRef.current=0;last=0;
    };
    const keyboard=(e:KeyboardEvent)=>{
      if(!stage.contains(document.activeElement))return;
      const key=e.key.toLowerCase();
      const map:{[key:string]:keyof FluxControls}={
        "arrowup":"up","arrowdown":"down","arrowleft":"left","arrowright":"right",
        "w":"up","s":"down","a":"left","d":"right",
      };
      const property=map[key];
      if(property){
        e.preventDefault();
        if(e.type==="keydown")inputRef.current[property]=true as never;
        else inputRef.current[property]=false as never;
      }
      if(e.type==="keydown"&&key===" "){
        e.preventDefault();
        const s=stateRef.current;
        stateRef.current={...s,phase:s.phase==="playing"?"paused":s.phase==="paused"?"playing":s.phase};
        sync();
      }
    };
    const position=(e:PointerEvent)=>{
      const r=canvas.getBoundingClientRect();
      // Mobile uses object-fit:cover. Map pointer through the center crop,
      // not the element's stretched CSS rectangle.
      const scale=Math.max(r.width/WIDTH,r.height/HEIGHT);
      const cropX=(WIDTH*scale-r.width)/2;
      const cropY=(HEIGHT*scale-r.height)/2;
      const x=(e.clientX-r.left+cropX)/scale;
      const y=(e.clientY-r.top+cropY)/scale;
      inputRef.current.x=Math.max(0,Math.min(WIDTH,x));
      inputRef.current.y=Math.max(0,Math.min(HEIGHT,y));
    };
    const down=(e:PointerEvent)=>{
      pointerHeld=true;inputRef.current.aiming=true;
      position(e);
      try{canvas.setPointerCapture(e.pointerId);}catch{/* pointer capture optional */}
    };
    const move=(e:PointerEvent)=>{if(pointerHeld)position(e);};
    const up=()=>{pointerHeld=false;inputRef.current.aiming=false;};
    const visibility=()=>{
      const s=stateRef.current;
      if(document.hidden&&s.phase==="playing"){
        stateRef.current={...s,phase:"paused"};
        sync();
      }
      if(document.hidden)stop();else schedule();
    };
    const io=new IntersectionObserver(entries=>{
      visible=Boolean(entries[0]?.isIntersecting);
      if(!visible){
        const s=stateRef.current;
        if(s.phase==="playing"){stateRef.current={...s,phase:"paused"};sync();}
        stop();
      }else schedule();
    },{threshold:.01});
    const onMotion=(e:MediaQueryListEvent)=>{reduced=e.matches;};
    io.observe(canvas);
    canvas.addEventListener("pointerdown",down);
    canvas.addEventListener("pointermove",move);
    canvas.addEventListener("pointerup",up);
    canvas.addEventListener("pointercancel",up);
    window.addEventListener("keydown",keyboard);
    window.addEventListener("keyup",keyboard);
    document.addEventListener("visibilitychange",visibility);
    motion.addEventListener("change",onMotion);
    schedule();
    return()=>{
      alive=false;stop();io.disconnect();
      canvas.removeEventListener("pointerdown",down);
      canvas.removeEventListener("pointermove",move);
      canvas.removeEventListener("pointerup",up);
      canvas.removeEventListener("pointercancel",up);
      window.removeEventListener("keydown",keyboard);
      window.removeEventListener("keyup",keyboard);
      document.removeEventListener("visibilitychange",visibility);
      motion.removeEventListener("change",onMotion);
    };
  },[sync]);

  return <div className="flux-experience" ref={stageRef} tabIndex={-1} aria-label="Signal Shift arcade game">
    <div className="flux-topline"><span>GAME 001 <i>•</i> SIGNAL SHIFT</span><span><Zap size={14}/> LIVE SIMULATION</span></div>
    <div className="flux-stage">
      <canvas width={WIDTH} height={HEIGHT} ref={canvasRef} className="flux-canvas"
        role="img" aria-label="Navigate the glowing ship, collect diamond sparks, and avoid red hazards. Arrow keys, WASD or touch drag."/>
      {ui.phase!=="playing"&&<div className="flux-overlay">
        <span className="flux-overlay-eyebrow">{ui.phase==="over"?"RUN COMPLETE":ui.phase==="paused"?"SIGNAL HELD":"ARCADE / SINGLE PLAYER"}</span>
        <h3>{ui.phase==="over"?"GAME OVER":ui.phase==="paused"?"PAUSED":"SIGNAL SHIFT"}</h3>
        <p>{ui.phase==="over"?"Collect more sparks and beat your best run.":ui.phase==="paused"?"Your position is saved. Resume whenever you're ready.":"Collect the yellow sparks. Dodge red interference. Survive the waves."}</p>
        <button type="button" className="flux-play" onClick={start}><Play size={17}/>{ui.phase==="paused"?"RESUME":ui.phase==="over"?"RUN AGAIN":"START RUN"} <ArrowUpRight size={18}/></button>
      </div>}
    </div>
    <div className="flux-hud">
      <div className="flux-score"><small>SCORE</small><strong>{String(ui.score).padStart(5,"0")}</strong></div>
      <div className="flux-stat"><small>BEST</small><strong>{String(best).padStart(5,"0")}</strong></div>
      <div className="flux-stat"><small>SHIELD</small><strong>{"◆".repeat(Math.max(0,ui.health))+"◇".repeat(Math.max(0,3-ui.health))}</strong></div>
      <div className="flux-stat"><small>WAVE</small><strong>{String(ui.wave).padStart(2,"0")}</strong></div>
      <div className="flux-actions">
        <button type="button" onClick={pause} disabled={!["playing","paused"].includes(ui.phase)} aria-label={ui.phase==="paused"?"Resume game":"Pause game"}>{ui.phase==="paused"?<Play size={17}/>:<Pause size={17}/>}</button>
        <button type="button" onClick={reset} aria-label="Reset Signal Shift"><RotateCcw size={17}/></button>
      </div>
    </div>
    <div className="flux-instructions"><span>MOVE / WASD + ARROWS + DRAG</span><span>COLLECT ◈ <b>AVOID ◆</b></span><span>SPACE TO PAUSE</span></div>
  </div>;
}
