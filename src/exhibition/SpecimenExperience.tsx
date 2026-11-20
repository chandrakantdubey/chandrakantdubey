import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, FlaskConical, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { shouldComment, specimenLine, type SpecimenMoment } from "./specimenCharacter";
import "./specimen.css";

type Props={awakened:boolean;onChange:(next:boolean)=>void};
const KEY="cd-specimen-voice";

function GlassVial({large=false}:{large?:boolean}) {
  const id=large?"specimen-hero-glass":"specimen-small-glass";
  return <svg className={large?"specimen-glass specimen-glass-large":"specimen-glass"}
    viewBox="0 0 120 174" role="img" aria-label="Small glass vial with an iridescent violet specimen">
    <defs>
      <linearGradient id={id+"-body"} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f9ffff" stopOpacity=".86"/>
        <stop offset=".23" stopColor="#bfd4e7" stopOpacity=".16"/>
        <stop offset=".68" stopColor="#c7d9ff" stopOpacity=".1"/>
        <stop offset="1" stopColor="#f9f4ff" stopOpacity=".65"/>
      </linearGradient>
      <linearGradient id={id+"-liquid"} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#d6f6b4"/>
        <stop offset=".38" stopColor="#bba5ed"/>
        <stop offset=".72" stopColor="#7965d3"/>
        <stop offset="1" stopColor="#d9a2c9"/>
      </linearGradient>
      <linearGradient id={id+"-cork"} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#e9e2cf"/>
        <stop offset=".47" stopColor="#9e9181"/>
        <stop offset="1" stopColor="#3f4347"/>
      </linearGradient>
      <clipPath id={id+"-interior"}><path d="M49 45V65C49 72 30 84 30 98V139Q30 151 60 151Q90 151 90 139V98C90 84 71 72 71 65V45Z"/></clipPath>
    </defs>
    <ellipse cx="60" cy="157" rx="38" ry="7" fill="#060c27" opacity=".34"/>
    <rect x="45" y="9" width="30" height="37" rx="5" fill={"url(#"+id+"-cork)"} stroke="#f2ecda" strokeWidth="1.4"/>
    <path d="M44 32H76" stroke="#40464d" strokeWidth="2" opacity=".5"/>
    <path d="M39 46H81V62C81 72 97 82 97 96V141Q97 161 60 162Q23 161 23 141V96C23 82 39 72 39 62Z"
      fill={"url(#"+id+"-body)"} stroke="#f3fcff" strokeOpacity=".91" strokeWidth="2.2"/>
    <g clipPath={"url(#"+id+"-interior)"}>
      <path className="specimen-fluid" d="M20 101Q37 95 56 104T100 102V169H20Z"
        fill={"url(#"+id+"-liquid)"} opacity=".94"/>
      <path d="M24 108Q60 98 96 109" fill="none" stroke="#e4ffee" strokeOpacity=".7" strokeWidth="2"/>
      <circle className="specimen-bubble specimen-bubble-one" cx="45" cy="127" r="3.2" fill="#f0ffda" opacity=".87"/>
      <circle className="specimen-bubble specimen-bubble-two" cx="73" cy="135" r="2.3" fill="#ffffff" opacity=".74"/>
      <circle cx="67" cy="115" r="1.5" fill="#f6fff3" opacity=".85"/>
    </g>
    <path d="M41 54V68C41 79 30 86 30 100V137" stroke="#ffffff" strokeWidth="5"
      strokeLinecap="round" fill="none" opacity=".56"/>
    <path d="M88 99V140Q88 149 77 152" stroke="#effaff" strokeWidth="3"
      strokeLinecap="round" fill="none" opacity=".5"/>
    <path d="M47 48H73" stroke="#eaf2fb" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>;
}

function speak(text:string) {
  if(typeof window==="undefined"||!("speechSynthesis" in window))return;
  const engine=window.speechSynthesis;
  engine.cancel();
  const line=new SpeechSynthesisUtterance(text);
  line.lang="en-GB";
  line.pitch=1.27;
  line.rate=1.06;
  line.volume=.58;
  // Voice options differ across browsers; never claim a guaranteed gender.
  const voices=engine.getVoices().filter(v=>v.lang.toLowerCase().startsWith("en"));
  const preferred=voices.find(v=>/samantha|serena|sonia|zira|female|hazel|victoria/i.test(v.name))
    ??voices.find(v=>v.lang.toLowerCase().startsWith("en-gb"))
    ??voices[0];
  if(preferred)line.voice=preferred;
  engine.speak(line);
}

function Apparition() {
  return <div className="specimen-apparition" aria-hidden="true">
    <div className="specimen-apparition-glow"/>
    <svg viewBox="0 0 620 570" className="specimen-creature">
      <defs>
        <radialGradient id="specimen-creature-core">
          <stop offset="0%" stopColor="#34264d"/>
          <stop offset="68%" stopColor="#100f21"/>
          <stop offset="100%" stopColor="#090e1b"/>
        </radialGradient>
        <linearGradient id="specimen-horns" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8c74d5"/>
          <stop offset="44%" stopColor="#27233e"/>
          <stop offset="100%" stopColor="#070e1b"/>
        </linearGradient>
      </defs>
      <circle cx="310" cy="280" r="265" fill="none" stroke="#bd9aff" strokeOpacity=".24" strokeWidth="1"/>
      <circle cx="310" cy="280" r="226" fill="none" stroke="#d9ffac" strokeOpacity=".27" strokeDasharray="9 18"/>
      <path d="M218 195C142 156 121 70 139 21C161 91 210 98 257 116
        L310 139L363 116C411 98 458 91 481 21C500 72 478 158 402 195
        C469 235 489 327 465 400C431 499 375 532 310 543
        C242 532 189 499 155 400C132 327 153 235 218 195Z"
        fill="url(#specimen-horns)" stroke="#b49cfa" strokeWidth="2" strokeOpacity=".63"/>
      <path d="M236 184C270 162 350 162 383 184C420 228 441 291 420 375
        C407 428 363 471 310 491C259 472 215 428 201 374C180 290 200 228 236 184Z"
        fill="url(#specimen-creature-core)"/>
      <path d="M201 275Q244 250 275 284L260 305Q224 304 201 275ZM419 275Q375 250 345 284L360 305Q394 304 419 275Z"
        fill="#e8ffaf" stroke="#e5ffd5" strokeWidth="3" className="specimen-creature-eyes"/>
      <path d="M271 399Q310 421 349 399" fill="none" stroke="#bd8ff7" strokeOpacity=".6" strokeWidth="3"/>
      <path d="M310 313L296 360L320 360" fill="none" stroke="#9274c8" strokeOpacity=".4" strokeWidth="3"/>
    </svg>
  </div>;
}

/** A small optional discovery on the hero; all real content stays available. */
export default function SpecimenExperience({awakened,onChange}:Props) {
  const [open,setOpen]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const [surge,setSurge]=useState(false);
  const [voice,setVoice]=useState(false);
  const [line,setLine]=useState("");
  const [voiceAvailable,setVoiceAvailable]=useState(false);
  const count=useRef<Record<SpecimenMoment,number>>({awakened:0,restored:0,victory:0,defeat:0});
  const lastComment=useRef(0);
  const closeRef=useRef<HTMLButtonElement>(null);
  const dialogRef=useRef<HTMLDivElement>(null);
  const previousFocus=useRef<HTMLElement|null>(null);
  const surgeTimer=useRef<number|null>(null);

  useEffect(()=>{
    setVoiceAvailable(typeof window!=="undefined"&&"speechSynthesis" in window);
    try{setVoice(window.sessionStorage.getItem(KEY)==="on");}catch{/* optional */}
    return()=>{
      window.speechSynthesis?.cancel();
      if(surgeTimer.current!==null)window.clearTimeout(surgeTimer.current);
    };
  },[]);

  useEffect(()=>{
    if(!open)return;
    previousFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    closeRef.current?.focus();
    const onEscape=(event:globalThis.KeyboardEvent)=>{
      if(event.key==="Escape"){event.preventDefault();setOpen(false);}
    };
    window.addEventListener("keydown",onEscape);
    return()=>{
      document.body.style.overflow=previousOverflow;
      window.removeEventListener("keydown",onEscape);
      previousFocus.current?.focus();
    };
  },[open]);

  useEffect(()=>{
    if(!awakened||!expanded||open)return;
    // Commentary should never become a permanent screen obstruction.
    const timer=window.setTimeout(()=>setExpanded(false),7200);
    const onScroll=()=>setExpanded(false);
    // Unlocking body scroll after modal dismissal can produce a synthetic
    // scroll event. Give the UI a moment before treating scroll as intent.
    const register=window.setTimeout(()=>{
      window.addEventListener("scroll",onScroll,{passive:true});
    },650);
    return()=>{
      window.clearTimeout(timer);
      window.clearTimeout(register);
      window.removeEventListener("scroll",onScroll);
    };
  },[awakened,expanded,open]);

  useEffect(()=>{
    if(!awakened)return;
    const onResult=(event:Event)=>{
      const detail=(event as CustomEvent<{won?:boolean}>).detail;
      if(typeof detail?.won!=="boolean")return;
      const now=Date.now();
      if(!shouldComment(lastComment.current,now))return;
      lastComment.current=now;
      const moment:SpecimenMoment=detail.won?"victory":"defeat";
      const phrase=specimenLine(moment,count.current[moment]++);
      setLine(phrase);
      setExpanded(true);
      if(voice)speak(phrase);
    };
    window.addEventListener("cd:packet-result",onResult);
    return()=>window.removeEventListener("cd:packet-result",onResult);
  },[awakened,voice]);

  const setMoment=(moment:SpecimenMoment)=>{
    const phrase=specimenLine(moment,count.current[moment]++);
    setLine(phrase);
    lastComment.current=Date.now();
    if(voice)speak(phrase);
  };
  const awaken=()=>{
    onChange(true);
    setOpen(false);
    setExpanded(true);
    setMoment("awakened");
    if(surgeTimer.current!==null)window.clearTimeout(surgeTimer.current);
    if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      setSurge(true);
      surgeTimer.current=window.setTimeout(()=>setSurge(false),1650);
    }
  };
  const restore=()=>{
    onChange(false);
    setExpanded(false);
    setOpen(false);
    setSurge(false);
    if(surgeTimer.current!==null)window.clearTimeout(surgeTimer.current);
    window.speechSynthesis?.cancel();
  };
  const toggleVoice=()=>{
    const next=!voice;
    setVoice(next);
    try{window.sessionStorage.setItem(KEY,next?"on":"off");}catch{/* optional */}
    if(next)speak("Voice enabled. A questionable but defensible choice.");
    else window.speechSynthesis?.cancel();
  };
  const trapFocus=(event:KeyboardEvent<HTMLDivElement>)=>{
    if(event.key!=="Tab")return;
    const controls=dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled),a[href],input:not(:disabled)");
    if(!controls?.length)return;
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };

  return <>
    <button type="button" className="specimen-discovery" onClick={()=>setOpen(true)}
      aria-haspopup="dialog" aria-label={awakened?"Inspect activated specimen":"Inspect sealed glass specimen"}
      title="Inspect the specimen">
      <span className="specimen-vial-halo" aria-hidden="true"/>
      <GlassVial/>
      <span className="specimen-discovery-caption">SPECIMEN <span>001</span></span>
    </button>
    {createPortal(<>
      {surge&&<Apparition/>}
      {open&&<div className="specimen-shade" onMouseDown={event=>{
        if(event.target===event.currentTarget)setOpen(false);
      }}>
        <div ref={dialogRef} className="specimen-inspection" role="dialog" aria-modal="true"
          aria-labelledby="specimen-heading" onKeyDown={trapFocus}>
          <button ref={closeRef} type="button" className="specimen-close"
            aria-label="Close specimen inspection" onClick={()=>setOpen(false)}><X size={22}/></button>
          <div className="specimen-inspection-visual" aria-hidden="true">
            <div className="specimen-inspection-orbit"/>
            <GlassVial large/>
            <span>NO. 001 / CD</span>
          </div>
          <div className="specimen-inspection-copy">
            <span className="specimen-index">EXPERIMENT / 001</span>
            <h2 id="specimen-heading">{awakened?"Still active.":"Still sealed."}</h2>
            <p>{awakened
              ?"There is a reason this was kept separate from the production controls."
              :"An optional alteration to the environment. The actual work remains untouched."}</p>
            <div className="specimen-inspection-actions">
              {awakened?
                <button className="specimen-primary" type="button" onClick={restore}>RESTORE <RotateCcw size={17}/></button>:
                <button className="specimen-primary" type="button" onClick={awaken}>UNSEAL <ArrowUpRight size={18}/></button>}
              <button type="button" className="specimen-secondary" onClick={()=>setOpen(false)}>
                {awakened?"KEEP IT":"LEAVE IT"}
              </button>
            </div>
            {voiceAvailable&&<button type="button" className="specimen-voice-option"
              aria-pressed={voice} onClick={toggleVoice}>
              {voice?<Volume2 size={17}/>:<VolumeX size={17}/>}
              CHARACTER VOICE {voice?"ON":"OFF"} <span>· OPTIONAL</span>
            </button>}
          </div>
        </div>
      </div>}
      {awakened&&<aside className="specimen-dock" aria-label="Specimen experience controls">
        {expanded&&<div className="specimen-dock-panel">
          <div className="specimen-dock-heading"><FlaskConical size={15}/> EXPERIMENT 001 <span>ACTIVE</span></div>
          <p aria-live="polite">{line}</p>
          <div className="specimen-dock-links">
            <a href="#incident" onClick={()=>setExpanded(false)}>LAB <ArrowUpRight size={13}/></a>
            <a href="#final-boss" onClick={()=>setExpanded(false)}>ARCADE <ArrowUpRight size={13}/></a>
            {voiceAvailable&&<button type="button" onClick={toggleVoice}
              aria-label={voice?"Mute character":"Enable character voice"}>
              {voice?<Volume2 size={16}/>:<VolumeX size={16}/>}
            </button>}
            <button type="button" onClick={restore} aria-label="Restore original experience"><RotateCcw size={16}/></button>
          </div>
        </div>}
        <button className="specimen-dock-toggle" type="button" onClick={()=>setExpanded(v=>!v)}
          aria-expanded={expanded} aria-label={expanded?"Collapse specimen controls":"Open specimen controls"}>
          <span className="specimen-dock-led"/><span>001 / ACTIVE</span><span>{expanded?"−":"+"}</span>
        </button>
      </aside>}
    </>,document.body)}
  </>;
}
