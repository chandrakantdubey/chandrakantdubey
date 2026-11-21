import { useEffect, useRef, useState } from "react";
import { revealDiscovery } from "./discoveries";
import "./experience.css";

type AudioFactoryWindow={AudioContext?:typeof AudioContext;webkitAudioContext?:typeof AudioContext};
type Cue="tap"|"success"|"warning"|"discovery";
function getAudioContext():AudioContext|null {
  const W=window as unknown as AudioFactoryWindow;
  const Factory=W.AudioContext??W.webkitAudioContext;
  return Factory?new Factory():null;
}
/** Original procedurally synthesized sound. No samples, external audio, or autoplay. */
function playCue(ctx:AudioContext,cue:Cue) {
  if(ctx.state!=="running")return;
  const patterns:Record<Cue,number[]>={
    tap:[440,590],success:[330,495,660],warning:[190,160],discovery:[392,523,785]
  };
  const notes=patterns[cue],level=cue==="tap"?.014:.026;
  notes.forEach((frequency,i)=>{
    const start=ctx.currentTime+i*(cue==="tap"?.015:.075),duration=cue==="tap"?.075:.2;
    const oscillator=ctx.createOscillator(),gain=ctx.createGain();
    oscillator.type=cue==="warning"?"triangle":"sine";
    oscillator.frequency.setValueAtTime(frequency,start);
    oscillator.frequency.exponentialRampToValueAtTime(frequency*.96,start+duration);
    gain.gain.setValueAtTime(.0001,start);
    gain.gain.exponentialRampToValueAtTime(level,start+.015);
    gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);oscillator.stop(start+duration+.005);
  });
}
export default function Soundscape(){
  const [enabled,setEnabled]=useState(false);
  const [ambient,setAmbient]=useState(false);
  const audio=useRef<AudioContext|null>(null);
  useEffect(()=>()=>{void audio.current?.close()},[]);
  useEffect(()=>{
    const onResult=()=>revealDiscovery("network");
    window.addEventListener("cd:packet-result",onResult);
    return()=>window.removeEventListener("cd:packet-result",onResult);
  },[]);
  useEffect(()=>{
    if(!enabled)return;
    const click=(event:Event)=>{
      if(!(event.target instanceof Element) || !event.target.closest("button,a,[role='button']"))return;
      if(audio.current)playCue(audio.current,"tap");
    };
    const cue=(event:Event)=>{
      const value=(event as CustomEvent<{type?:Cue}>).detail?.type;
      if(value&&audio.current&&["tap","success","warning","discovery"].includes(value))
        playCue(audio.current,value);
    };
    document.addEventListener("click",click);
    window.addEventListener("cd:sound-cue",cue);
    return()=>{document.removeEventListener("click",click);window.removeEventListener("cd:sound-cue",cue)};
  },[enabled]);
  useEffect(()=>{
    const ctx=audio.current;
    if(!enabled||!ambient||!ctx||ctx.state!=="running")return;
    // Three very quiet original oscillators; no music samples, no melody.
    const mix=ctx.createGain(),filter=ctx.createBiquadFilter();
    mix.gain.setValueAtTime(0,ctx.currentTime);
    mix.gain.linearRampToValueAtTime(.006,ctx.currentTime+.8);
    filter.type="lowpass";filter.frequency.value=240;
    mix.connect(filter).connect(ctx.destination);
    const voices=[55,82.41,110].map((frequency,i)=>{
      const osc=ctx.createOscillator();osc.type=i===1?"triangle":"sine";
      osc.frequency.value=frequency;osc.detune.value=i*4-4;
      osc.connect(mix);osc.start();return osc;
    });
    return()=>{voices.forEach(osc=>{try{osc.stop();osc.disconnect()}catch{/* already stopped */}});mix.disconnect();filter.disconnect()};
  },[enabled,ambient]);
  const toggle=async()=>{
    if(enabled){setEnabled(false);setAmbient(false);await audio.current?.suspend();return}
    if(!audio.current)audio.current=getAudioContext();
    if(!audio.current)return;
    try{await audio.current.resume();setEnabled(true);playCue(audio.current,"success")}
    catch{setEnabled(false)}
  };
  return <div className="experience-audio-controls">
    <button className="experience-sound" onClick={()=>void toggle()} type="button"
      aria-label={enabled?"Mute all site audio":"Enable site audio"}
      aria-pressed={enabled} title="Optional, synthesized site sound">
      <span aria-hidden="true">{enabled?"♫":"♪"}</span><span>{enabled?"SOUND ON":"SOUND OFF"}</span>
    </button>
    {enabled&&<button className="experience-ambient" type="button"
      onClick={()=>setAmbient(v=>!v)} aria-pressed={ambient}
      aria-label={ambient?"Disable ambient soundscape":"Enable ambient soundscape"}>
      {ambient?"AMBIENCE ON":"AMBIENCE OFF"}
    </button>}
  </div>;
}
