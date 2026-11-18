import { useEffect, useRef } from "react";
import { createTypeParticles, advanceTypeParticles, typeDisplacement, type TypeParticle, type TypeSample } from "./typeEngine";
import { type Pointer, type Pulse } from "./engine";
import type { FieldTelemetry } from "./telemetry";

interface Props {
  seed: number;
  paused: boolean;
  onTelemetry: (stats: FieldTelemetry) => void;
}

type Typeface = { size: number; y: number; text: string; tone: 0 | 1 };

function fontSize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxHeight: number): number {
  let size=Math.min(maxHeight,Math.max(18,maxWidth / text.length * 1.48));
  for(let i=0;i<10;i++){
    ctx.font="800 "+size+"px 'Space Grotesk', 'Arial Black', sans-serif";
    const measured=ctx.measureText(text).width;
    if(measured<=maxWidth || size<=16)break;
    size*=maxWidth/measured*.995;
  }
  return size;
}

/**
 * Rasterize real glyph outlines exactly once on resize / font-load / seed.
 * The physics engine receives only immutable target coordinates.
 */
function rasterize(width: number, height: number): { samples: TypeSample[]; faces: Typeface[] } {
  const buffer=document.createElement("canvas");
  buffer.width=Math.round(width);
  buffer.height=Math.round(height);
  const ctx=buffer.getContext("2d",{willReadFrequently:true});
  if(!ctx)return {samples:[],faces:[]};
  const wide=width>720;
  const words: Array<{text:string;tone:0|1;limit:number;y:number}>=[
    {text:"CHANDRAKANT",tone:0,limit:wide?height*.24:height*.22,y:height*(wide?.36:.38)},
    {text:"DUBEY",tone:1,limit:wide?height*.35:height*.31,y:height*(wide?.70:.68)},
  ];
  const faces:Typeface[]=[];
  ctx.fillStyle="#fff";
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  for(const word of words){
    const size=fontSize(ctx,word.text,width*.94,word.limit);
    ctx.font="800 "+size+"px 'Space Grotesk', 'Arial Black', sans-serif";
    ctx.fillText(word.text,width/2,word.y);
    faces.push({size,y:word.y,text:word.text,tone:word.tone});
  }
  const img=ctx.getImageData(0,0,buffer.width,buffer.height);
  const step=Math.max(3,Math.min(11,Math.round(width/145)));
  const samples:TypeSample[]=[];
  const separator=(faces[0].y+faces[1].y)/2;
  for(let y=Math.floor(step/2);y<height;y+=step){
    for(let x=Math.floor(step/2);x<width;x+=step){
      const a=img.data[(y*buffer.width+x)*4+3];
      if(a>150){
        samples.push({x,y,tone:y<separator?0:1});
      }
    }
  }
  return {samples,faces};
}

export default function TypeCanvas({seed,paused,onTelemetry}:Props) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const pausedRef=useRef(paused);
  const syncRef=useRef<(()=>void)|null>(null);
  useEffect(()=>{
    pausedRef.current=paused;
    syncRef.current?.();
  },[paused]);

  useEffect(()=>{
    const canvas=canvasRef.current;
    const ctx=canvas?.getContext("2d",{alpha:false,desynchronized:true});
    if(!canvas||!ctx)return;
    let alive=true,raf=0,width=1,height=1,dpr=1;
    let points:TypeParticle[]=[];
    let faces:Typeface[]=[];
    let visible=true,reduced=false,elapsed=0,lastFrame=0,lastReport=0,paintMs=0,interactions=0;
    const pointer:Pointer={x:0,y:0,active:false};
    const pulses:Pulse[]=[];
    const frameIntervals:number[]=[];
    const preference=window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced=preference.matches;

    const status=():FieldTelemetry["status"]=>reduced?"REDUCED MOTION":pausedRef.current?"PAUSED":!visible||document.hidden?"OFFSCREEN":"RUNNING";
    const report=()=>{
      if(!alive)return;
      const avg=frameIntervals.length?frameIntervals.reduce((a,b)=>a+b,0)/frameIntervals.length:0;
      onTelemetry({
        fps:status()==="RUNNING"&&avg?Math.min(240,1000/avg):0,
        paintMs,nodes:points.length,edges:0,dpr,width,height,
        pointer:pointer.active?Math.round(pointer.x)+", "+Math.round(pointer.y):"—",
        pulses:pulses.length,interactions,displacement:typeDisplacement(points),status:status(),
      });
    };

    const render=()=>{
      const started=performance.now();
      ctx.fillStyle="#090e11";
      ctx.fillRect(0,0,width,height);

      // Screen-space drafting grid.
      ctx.beginPath();
      ctx.strokeStyle="rgba(146,168,158,.095)";
      ctx.lineWidth=.7;
      for(let x=0;x<=width;x+=40){ctx.moveTo(x,0);ctx.lineTo(x,height);}
      for(let y=0;y<=height;y+=40){ctx.moveTo(0,y);ctx.lineTo(width,y);}
      ctx.stroke();

      // Ghost outlines stabilize legibility as the dots physically displace.
      ctx.textAlign="center";
      ctx.textBaseline="middle";
      ctx.lineJoin="round";
      for(const face of faces){
        ctx.font="800 "+face.size+"px 'Space Grotesk', 'Arial Black', sans-serif";
        ctx.strokeStyle=face.tone===0?"rgba(215,230,217,.12)":"rgba(231,164,129,.17)";
        ctx.lineWidth=1.2;
        ctx.strokeText(face.text,width/2,face.y);
      }

      // Low-density construction lines between nearby particles.
      ctx.beginPath();
      ctx.lineWidth=.65;
      ctx.strokeStyle="rgba(142,186,169,.13)";
      for(let i=8;i<points.length;i+=9){
        const p=points[i],n=points[i-1];
        if(p.tone!==n.tone)continue;
        if(Math.abs(p.homeX-n.homeX)<22&&Math.abs(p.homeY-n.homeY)<22){
          ctx.moveTo(p.x,p.y);ctx.lineTo(n.x,n.y);
        }
      }
      ctx.stroke();

      // Fill colors in two batches so the hot loop never creates a gradient.
      for(let tone=0;tone<=1;tone++){
        ctx.fillStyle=tone===0?"#e7f1e5":"#f2aa86";
        for(const p of points){
          if(p.tone!==tone)continue;
          const displacement=Math.hypot(p.x-p.homeX,p.y-p.homeY);
          const size=displacement>12?2.35:1.8;
          ctx.fillRect(p.x-size/2,p.y-size/2,size,size);
        }
      }

      // Disturbed points have an additional highlight, never fake telemetry.
      ctx.fillStyle="#d9ffbb";
      for(let i=0;i<points.length;i+=3){
        const p=points[i];
        if(Math.abs(p.x-p.homeX)+Math.abs(p.y-p.homeY)>22)ctx.fillRect(p.x-1.5,p.y-1.5,3,3);
      }
      for(const pulse of pulses){
        const age=elapsed-pulse.born;
        if(age<0||age>1.55)continue;
        ctx.beginPath();ctx.arc(pulse.x,pulse.y,age*360,0,Math.PI*2);
        ctx.lineWidth=1.4;
        ctx.strokeStyle="rgba(255,206,147,"+(.56*(1-age/1.55))+")";
        ctx.stroke();
      }

      ctx.lineWidth=1;
      ctx.strokeStyle="#a4c7b25c";
      const length=14;
      const marks:[[number,number,number,number],[number,number,number,number],[number,number,number,number],[number,number,number,number]]=[
        [16,16,1,1],[width-16,16,-1,1],[16,height-16,1,-1],[width-16,height-16,-1,-1],
      ];
      for(const [x,y,sx,sy] of marks){
        ctx.beginPath();ctx.moveTo(x,y+length*sy);ctx.lineTo(x,y);ctx.lineTo(x+length*sx,y);ctx.stroke();
      }
      paintMs=performance.now()-started;
    };

    const resize=()=>{
      if(!alive)return;
      const rect=canvas.getBoundingClientRect();
      width=Math.max(1,Math.round(rect.width));
      height=Math.max(1,Math.round(rect.height));
      dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1));
      canvas.width=Math.round(width*dpr);
      canvas.height=Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const result=rasterize(width,height);
      points=createTypeParticles(result.samples,seed);
      faces=result.faces;
      frameIntervals.length=0;
      lastFrame=0;
      render();report();
    };

    const schedule=()=>{
      if(alive&&!raf&&visible&&!document.hidden&&!reduced&&!pausedRef.current)raf=requestAnimationFrame(tick);
    };
    const tick=(now:number)=>{
      raf=0;
      if(!alive||!visible||document.hidden||reduced||pausedRef.current)return;
      if(lastFrame){
        const interval=Math.max(1,Math.min(60,now-lastFrame));
        frameIntervals.push(interval);
        if(frameIntervals.length>32)frameIntervals.shift();
        const dt=Math.min(.034,interval/1000);
        elapsed+=dt;
        advanceTypeParticles(points,{dt,time:elapsed,pointer,pulses});
      }
      lastFrame=now;
      while(pulses.length&&elapsed-pulses[0].born>1.55)pulses.shift();
      render();
      if(now-lastReport>430){lastReport=now;report();}
      schedule();
    };

    const coords=(e:PointerEvent):[number,number]=>{
      const rect=canvas.getBoundingClientRect();
      return [e.clientX-rect.left,e.clientY-rect.top];
    };
    const onMove=(e:PointerEvent)=>{
      const [x,y]=coords(e);
      pointer.x=x;pointer.y=y;
      pointer.active=e.pointerType==="mouse"||e.buttons>0;
    };
    const onDown=(e:PointerEvent)=>{
      const [x,y]=coords(e);
      pointer.x=x;pointer.y=y;pointer.active=true;
      interactions++;
      pulses.push({x,y,born:elapsed});
      if(pulses.length>6)pulses.shift();
      if(reduced||pausedRef.current){render();report();}
    };
    const onUp=(e:PointerEvent)=>{
      if(e.pointerType!=="mouse"){pointer.active=false;}
    };
    const onLeave=()=>{pointer.active=false;};
    const onVisibility=()=>{
      lastFrame=0;frameIntervals.length=0;
      if(!visible||document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}
      report();schedule();
    };
    const onMotion=(e:MediaQueryListEvent)=>{
      reduced=e.matches;
      if(reduced&&raf){cancelAnimationFrame(raf);raf=0;}
      lastFrame=0;frameIntervals.length=0;
      render();report();schedule();
    };

    syncRef.current=()=>{
      if(pausedRef.current&&raf){cancelAnimationFrame(raf);raf=0;}
      lastFrame=0;frameIntervals.length=0;
      render();report();schedule();
    };
    const ro=new ResizeObserver(resize);
    const io=new IntersectionObserver(entries=>{
      visible=Boolean(entries[0]?.isIntersecting);
      onVisibility();
    },{threshold:.01});
    ro.observe(canvas);io.observe(canvas);
    canvas.addEventListener("pointermove",onMove,{passive:true});
    canvas.addEventListener("pointerdown",onDown,{passive:true});
    canvas.addEventListener("pointerup",onUp);
    canvas.addEventListener("pointerleave",onLeave);
    canvas.addEventListener("pointercancel",onLeave);
    document.addEventListener("visibilitychange",onVisibility);
    preference.addEventListener("change",onMotion);
    resize();schedule();

    // Font loading alters glyph geometry; rebake once without animation churn.
    const afterFonts=()=>{
      if(alive)resize();
    };
    void document.fonts.ready.then(afterFonts);

    return()=>{
      alive=false;
      if(raf)cancelAnimationFrame(raf);
      ro.disconnect();io.disconnect();
      canvas.removeEventListener("pointermove",onMove);
      canvas.removeEventListener("pointerdown",onDown);
      canvas.removeEventListener("pointerup",onUp);
      canvas.removeEventListener("pointerleave",onLeave);
      canvas.removeEventListener("pointercancel",onLeave);
      document.removeEventListener("visibilitychange",onVisibility);
      preference.removeEventListener("change",onMotion);
      syncRef.current=null;
    };
  },[seed,onTelemetry]);

  return <canvas ref={canvasRef} className="kinetic-canvas" role="img" aria-label="Chandrakant Dubey rendered as thousands of interactive typographic particles. Move the pointer or tap to scatter and reform the letters."/>;
}
