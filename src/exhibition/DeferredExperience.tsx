import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import "./deferred-experience.css";

type ExperienceKind="lab"|"arcade"|"packet"|"experiment";
type Props={id?:string;kind:ExperienceKind;label:string;children:ReactNode};

/** Mount complex experiences shortly before they enter the viewport.
 * The reserved placeholder keeps deep links and page geometry stable.
 */
export default function DeferredExperience({id,kind,label,children}:Props) {
  const node=useRef<HTMLDivElement>(null);
  const [near,setNear]=useState(()=>Boolean(id&&window.location.hash==="#"+id));
  const [mounted,setMounted]=useState(false);
  const onReady=useCallback(()=>setMounted(true),[]);
  useEffect(()=>{
    // Native hash scrolling races with React's async route and lazy chunk.
    // Scroll only once the target experience is mounted, not to an empty
    // placeholder whose height can change when the chunk resolves.
    if(!id||!mounted||window.location.hash!=="#"+id)return;
    const frame=requestAnimationFrame(()=>node.current?.scrollIntoView({behavior:"instant",block:"start"}));
    return()=>cancelAnimationFrame(frame);
  },[id,mounted]);
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
  return <div id={id} ref={node}
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
