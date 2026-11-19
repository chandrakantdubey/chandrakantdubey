import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ArrowRight, MoveUpRight, RotateCcw } from "lucide-react";
import { technologyGroups } from "../atelier/content";

/**
 * A connected, responsive 3D technology installation.
 * Nodes represent actual technologies in the portfolio; there are no fake
 * skill percentages, system statistics, or unrelated dashboard widgets.
 */
const positions=[
  {x:20,y:25,z:94},
  {x:76,y:24,z:42},
  {x:12,y:54,z:6},
  {x:82,y:58,z:85},
  {x:42,y:12,z:24},
  {x:37,y:82,z:58},
  {x:66,y:84,z:8},
] as const;
const accents=["#ddff76","#ffab88","#a9b5ff","#8af2e6"];
const codes=["FE","API","OPS","SYS"];
const symbols=["{ }","↳","⌘","∴"];

export default function SkillOrbit() {
  const [active,setActive]=useState(0);
  const [focused,setFocused]=useState(0);
  const [interacting,setInteracting]=useState(false);
  const view=useRef<HTMLDivElement>(null);
  const pointer=useRef<{x:number;y:number;id:number}|null>(null);
  const reduced=useRef(false);
  const current=technologyGroups[active];

  useEffect(()=>{
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current=media.matches;
    const change=(event:MediaQueryListEvent)=>{reduced.current=event.matches;};
    media.addEventListener("change",change);
    return()=>media.removeEventListener("change",change);
  },[]);

  const chooseGroup=useCallback((index:number)=>{
    setActive((index+technologyGroups.length)%technologyGroups.length);
    setFocused(0);
  },[]);

  const setPerspective=(x:number,y:number)=>{
    if(!view.current||reduced.current)return;
    view.current.style.setProperty("--camera-x",Math.max(-8,Math.min(8,-y*12))+"deg");
    view.current.style.setProperty("--camera-y",Math.max(-10,Math.min(10,x*17))+"deg");
    view.current.style.setProperty("--light-x",(50+x*28)+"%");
    view.current.style.setProperty("--light-y",(49+y*28)+"%");
  };
  const onMove=(event:PointerEvent<HTMLDivElement>)=>{
    if(event.pointerType==="touch"&&!pointer.current)return;
    const rect=event.currentTarget.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width-.5;
    const y=(event.clientY-rect.top)/rect.height-.5;
    setPerspective(x,y);
    if(pointer.current){
      const dx=event.clientX-pointer.current.x;
      if(Math.abs(dx)>68){
        chooseGroup(active+(dx<0?1:-1));
        pointer.current={...pointer.current,x:event.clientX};
      }
    }
  };
  const onLeave=()=>{
    if(!view.current)return;
    if(!reduced.current){
      view.current.style.setProperty("--camera-x","-5deg");
      view.current.style.setProperty("--camera-y","7deg");
    }
  };
  const selectedTool=current.tools[Math.min(focused,current.tools.length-1)];
  return <div className="stack-reactor" style={{"--reactor-accent":accents[active]} as CSSProperties}>
    <div className="reactor-intro">
      <div className="reactor-intro-title">
        <span className="reactor-eyebrow"><span className="reactor-led"/> INTERACTIVE STACK / 04 LAYERS</span>
        <p>Choose a discipline. Explore the tools.</p>
      </div>
      <span className="reactor-intro-hint">MOVE CURSOR / DRAG / SELECT <MoveUpRight size={18}/></span>
    </div>

    <div className="reactor-layout">
      <div className="reactor-rail" role="tablist" aria-label="Technology disciplines">
        {technologyGroups.map((group,index)=><button
          type="button" role="tab" id={"stack-tab-"+index} aria-controls="stack-details"
          aria-selected={active===index} tabIndex={active===index?0:-1}
          key={group.title} onClick={()=>chooseGroup(index)}
          onKeyDown={event=>{
            if(!["ArrowDown","ArrowUp","ArrowRight","ArrowLeft","Home","End"].includes(event.key))return;
            event.preventDefault();
            const next=event.key==="Home"?0:event.key==="End"?technologyGroups.length-1:
              (index+(["ArrowDown","ArrowRight"].includes(event.key)?1:-1)+technologyGroups.length)%technologyGroups.length;
            chooseGroup(next);
            document.getElementById("stack-tab-"+next)?.focus();
          }}>
          <span className="reactor-rail-number">0{index+1}</span>
          <span className="reactor-rail-label">{group.title}</span>
          <span className="reactor-rail-code">{codes[index]}</span>
          <ArrowRight className="reactor-rail-arrow" size={21}/>
        </button>)}
        <div className="reactor-rail-bottom" aria-hidden="true">
          <span>EXPLORE<br/>THE<br/>SYSTEM</span><span className="reactor-rail-asterisk">✳</span>
        </div>
      </div>

      <div className="reactor-view" ref={view}
        role="group" aria-label={current.title+" technology installation"}
        onPointerMove={onMove}
        onPointerEnter={()=>setInteracting(true)}
        onPointerLeave={()=>{setInteracting(false);pointer.current=null;onLeave();}}
        onPointerDown={event=>{
          if(event.pointerType!=="touch"||!(event.target instanceof HTMLElement)||event.target.closest("button"))return;
          pointer.current={x:event.clientX,y:event.clientY,id:event.pointerId};
        }}
        onPointerUp={()=>{pointer.current=null;}}>
        <div className="reactor-stars" aria-hidden="true"/>
        <div className="reactor-crosshair reactor-crosshair-a" aria-hidden="true"/>
        <div className="reactor-crosshair reactor-crosshair-b" aria-hidden="true"/>
        <div className="reactor-top">
          <span><span className="reactor-blink"/> {current.title.toUpperCase()}</span>
          <span>0{active+1} / 04 <span className="reactor-divider">·</span> {String(current.tools.length).padStart(2,"0")} TOOLS</span>
        </div>

        <div className="reactor-world" data-discipline={active} key={"world-"+active}>
          <svg className="reactor-connections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="reactor-link" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={accents[active]} stopOpacity=".15"/>
                <stop offset=".6" stopColor={accents[active]} stopOpacity=".78"/>
                <stop offset="1" stopColor="#a2a8ff" stopOpacity=".24"/>
              </linearGradient>
            </defs>
            {current.tools.map((tool,index)=>{
              const point=positions[index];
              return <g key={tool}>
                <path className={"reactor-wire "+(focused===index?"reactor-wire-current":"")}
                  d={"M50 49 Q"+(50+point.x)/2+" "+(15+(point.y+49)/2)+" "+point.x+" "+point.y}
                  fill="none" stroke="url(#reactor-link)" strokeWidth={focused===index?.47:.22}
                  strokeDasharray={focused===index?"1 1.5":"1.3 2"}/>
                <circle cx={point.x} cy={point.y} r={focused===index?1.1:.65} fill={accents[active]}/>
              </g>;
            })}
            <circle cx="50" cy="49" r="21" fill="none" stroke={accents[active]} strokeOpacity=".35" strokeWidth=".22" strokeDasharray="1.5 1.2" className="reactor-ring-svg"/>
            <circle cx="50" cy="49" r="27" fill="none" stroke="#ffffff" strokeOpacity=".15" strokeWidth=".16"/>
          </svg>
          <div className="reactor-core" aria-hidden="true">
            <div className="reactor-core-ring reactor-core-ring-a"/>
            <div className="reactor-core-ring reactor-core-ring-b"/>
            <div className="reactor-core-disc">
              <span>{symbols[active]}</span>
              <small>CD / {codes[active]}</small>
            </div>
          </div>

          {current.tools.map((tool,index)=>{
            const p=positions[index];
            return <button key={tool}
              type="button" className={"reactor-node "+(focused===index?"reactor-node-selected":"")}
              style={{"--node-x":p.x+"%","--node-y":p.y+"%","--node-z":p.z+"px","--node-delay":index*65+"ms"} as CSSProperties}
              onPointerEnter={()=>setFocused(index)}
              onFocus={()=>setFocused(index)}
              onClick={()=>setFocused(index)}
              aria-pressed={focused===index} aria-label={"Focus technology "+tool}>
              <span className="reactor-node-number">{String(index+1).padStart(2,"0")} / {codes[active]}</span>
              <strong>{tool}</strong>
              <span className="reactor-node-glint" aria-hidden="true">↗</span>
            </button>;
          })}
        </div>
        <div className="reactor-bottom">
          <div><span>FOCUSED TECHNOLOGY</span><strong key={selectedTool}>{selectedTool}</strong></div>
          <span className="reactor-interaction-label">{interacting?"INTERACTING":"READY"} <span>●</span></span>
        </div>
      </div>
    </div>
    <div className="reactor-outro">
      <span>SELECT A LAYER OR ANY TECHNOLOGY NODE</span>
      <span>REAL TOOLS. NO SKILL PERCENTAGES.</span>
      <button type="button" onClick={()=>{chooseGroup(0);onLeave();}} aria-label="Reset technology installation"><RotateCcw size={15}/> RESET VIEW</button>
    </div>
  </div>;
}
