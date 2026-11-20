import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

interface PacketResult {
  won:boolean;score:number;integrity:number;delivered:number;cooperative:boolean;
}
const KEY="cd-last-packet-result";
function valid(value:unknown):value is PacketResult {
  if(!value||typeof value!=="object")return false;
  const v=value as Record<string,unknown>;
  return typeof v.won==="boolean"&&typeof v.cooperative==="boolean"&&
    ["score","integrity","delivered"].every(k=>typeof v[k]==="number"&&Number.isFinite(v[k]));
}
export default function VisitorResponse() {
  const [last,setLast]=useState<PacketResult|null>(()=>{
    try{const result=JSON.parse(sessionStorage.getItem(KEY)||"null") as unknown;return valid(result)?result:null;}
    catch{return null;}
  });
  useEffect(()=>{
    const onResult=(event:Event)=>{
      const value=(event as CustomEvent<unknown>).detail;
      if(!valid(value))return;
      setLast(value);
      try{sessionStorage.setItem(KEY,JSON.stringify(value));}catch{/* not required */}
    };
    window.addEventListener("cd:packet-result",onResult);
    return()=>window.removeEventListener("cd:packet-result",onResult);
  },[]);
  if(!last)return null;
  return <div className="visitor-result" role="status">
    <Activity size={17}/>
    <span>{last.won
      ?"YOUR LAST INCIDENT: production survived your leadership."
      :"YOUR LAST INCIDENT: the network has requested better management."}
      <b> {last.score.toLocaleString()} PTS · {last.integrity}% INTEGRITY.</b></span>
    <a href="#final-boss">TRY AGAIN ↗</a>
  </div>;
}
