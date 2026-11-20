import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import "./deferred-experience.css";

type ExperienceKind="lab"|"arcade"|"packet"|"experiment";
type Props={kind:ExperienceKind;label:string;children:ReactNode};

/** Mount complex experiences shortly before they enter the viewport.
 * The reserved placeholder keeps deep links and page geometry stable.
 */
export default function DeferredExperience({kind,label,children}:Props) {
  const node=useRef<HTMLDivElement>(null);
  const [near,setNear]=useState(false);
  const [mounted,setMounted]=useState(false);
  const onReady=useCallback(()=>setMounted(true),[]);
  useEffect(()=>{
    const element=node.current;
    if(!element)return;
    if(!("IntersectionObserver" in window)){
      setNear(true);
      return;
    }
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){
        setNear(true);
        observer.disconnect();
      }
    },{rootMargin:"1200px 0px",threshold:0});
    observer.observe(element);
    return()=>observer.disconnect();
  },[]);
  return <div ref={node}
    className="deferred-experience"
    data-experience={kind}
    data-loaded={mounted?"true":"false"}
    aria-busy={!mounted}>
    <Suspense fallback={<DeferredFallback label={label}/>}>
      {near?<>{children}<Loaded onReady={onReady}/></>:<DeferredFallback label={label}/>}
    </Suspense>
  </div>;
}
function Loaded({onReady}:{onReady:()=>void}){
  useEffect(()=>onReady(),[onReady]);
  return null;
}
function DeferredFallback({label}:{label:string}){
  return <div className="deferred-fallback" role="status" aria-label={label+" loading"}>
    <span>{label.toUpperCase()} / LOADING</span>
    <div className="deferred-fallback-rule" aria-hidden="true"/>
  </div>;
}
