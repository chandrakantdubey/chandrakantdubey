import { useCallback, useEffect, useState } from "react";
import { parseSignalProgress, recordSignal, type SignalId } from "./signalTrail";

export type SpecimenMode="sealed"|"awakened";
export const SPECIMEN_SESSION_KEY="cd-specimen-state";
export const SIGNAL_SESSION_KEY="cd-signal-trail";

export function readSpecimenMode(value:unknown):SpecimenMode {
  return value==="awakened"?"awakened":"sealed";
}
function readSessionMode():SpecimenMode {
  try{return readSpecimenMode(window.sessionStorage.getItem(SPECIMEN_SESSION_KEY));}
  catch{return "sealed";}
}
function readSessionSignals():SignalId[] {
  try {
    return [...parseSignalProgress(JSON.parse(window.sessionStorage.getItem(SIGNAL_SESSION_KEY)||"[]") as unknown)];
  }catch{return [];}
}

/**
 * A typed, tab-scoped experience state. Important portfolio content is never
 * controlled by this hook; it only enables optional companion material.
 */
export function useSpecimenSession() {
  const [mode,setMode]=useState<SpecimenMode>(readSessionMode);
  const [signals,setSignals]=useState<SignalId[]>(readSessionSignals);
  const awakened=mode==="awakened";
  useEffect(()=>{
    try{window.sessionStorage.setItem(SPECIMEN_SESSION_KEY,mode);}
    catch{/* private browsing or disabled storage */}
  },[mode]);
  useEffect(()=>{
    try{window.sessionStorage.setItem(SIGNAL_SESSION_KEY,JSON.stringify(signals));}
    catch{/* private browsing or disabled storage */}
  },[signals]);
  const setAwakened=useCallback((next:boolean)=>setMode(next?"awakened":"sealed"),[]);
  const discoverSignal=useCallback((id:SignalId)=>setSignals(previous=>
    previous.includes(id)?previous:[...recordSignal(previous,id)]),[]);
  const resetSignals=useCallback(()=>setSignals(previous=>previous.length?[]:previous),[]);
  return {mode,awakened,setAwakened,signals,discoverSignal,resetSignals,unlocked:signals.length===3};
}
