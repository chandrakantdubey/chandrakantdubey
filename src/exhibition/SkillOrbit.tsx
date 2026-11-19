import { useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { technologyGroups } from "../atelier/content";

const SYMBOLS=["◇","⌘","⌁","✳"];
export default function SkillOrbit() {
  const [active,setActive]=useState(0);
  const current=technologyGroups[active];
  return <div className="stack-theatre">
    <div className="stack-orbit" aria-label="Interactive technology groups">
      <div className="stack-orbit-rings" aria-hidden="true">
        <div className="orbit-ring orbit-one"/><div className="orbit-ring orbit-two"/>
        <div className="orbit-ring orbit-three"/>
        <div className="orbit-core"><span>CD</span><small>TECH</small></div>
        <span className="orbit-node orbit-node-one">TS</span>
        <span className="orbit-node orbit-node-two">AI</span>
        <span className="orbit-node orbit-node-three">API</span>
        <span className="orbit-node orbit-node-four">K8S</span>
      </div>
      <div className="stack-orbit-actions" role="tablist" aria-label="Technology categories">
        {technologyGroups.map((group,i)=><button key={group.title} type="button"
          role="tab" id={"stack-tab-"+i} aria-controls="stack-details"
          aria-selected={active===i} tabIndex={active===i?0:-1}
          onClick={()=>setActive(i)}
          onKeyDown={e=>{
            if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;
            e.preventDefault();
            const next=e.key==="Home"?0:e.key==="End"?3:(i+(e.key==="ArrowRight"?1:3))%4;
            setActive(next);
            document.getElementById("stack-tab-"+next)?.focus();
          }}>
          <span className="stack-orbit-number">0{i+1}</span><strong>{group.title}</strong>
          <span className="stack-orbit-symbol">{SYMBOLS[i]}</span>
        </button>)}
      </div>
    </div>
    <div className="stack-details" id="stack-details" role="tabpanel" aria-labelledby={"stack-tab-"+active}>
      <div className="stack-details-eyebrow"><span>DEPLOYED KNOW-HOW</span><span>0{active+1} / 04</span></div>
      <h3 key={"skill-"+active}>{current.title}<span>↗</span></h3>
      <div className="stack-live-tags" key={active}>
        {current.tools.map((tool,i)=><span key={tool} style={{animationDelay:i*65+"ms"}}>{tool}<ArrowUpRight size={15}/></span>)}
      </div>
      <div className="stack-switch"><button type="button" onClick={()=>setActive((active+3)%4)} aria-label="Previous skill group"><ChevronLeft/></button>
        <span>SELECT A DISCIPLINE TO EXPLORE</span>
        <button type="button" onClick={()=>setActive((active+1)%4)} aria-label="Next skill group"><ChevronRight/></button>
      </div>
    </div>
  </div>;
}
