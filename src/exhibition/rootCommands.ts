/**
 * A deliberately fictional portfolio command line.
 * Commands only change the local page presentation; no eval, shell,
 * network requests, private data, privileged actions or stateful backend.
 */
import {
  SIGNAL_IDS,signalReport,signalFile,combinedSignalReport,isSignalId,
  type SignalProgress,
} from "./signalTrail.ts";

export type RootEffect="chaos"|"gravity"|"restore"|"exit"|"clear"|"reset-signals"|null;
export interface RootContext {awakened:boolean;signals:SignalProgress;}
export interface RootReply {lines:string[];effect:RootEffect;}
export const ROOT_COMMANDS=[
  "help","whoami","uptime","sudo hire chandrakant",
  "deploy --friday","theme --chaos","gravity --off","restore",
  "secrets","status","clear","exit","signals","signals --reset","cat /signals/report",
] as const;
export function runRootCommand(raw:string,context:RootContext={awakened:false,signals:[]}):RootReply {
  const text=raw.trim().replace(/\s+/g," ").toLowerCase();
  if(text==="signals")return {lines:context.awakened
    ?signalReport(context.signals)
    :["The signal index is dormant. The ordinary portfolio remains available."],effect:null};
  if(text==="signals --reset")return {lines:["Recovered signal notes cleared for this tab."],effect:"reset-signals"};
  if(text==="ls /signals")return {lines:context.awakened
    ?SIGNAL_IDS.map(id=>id+".note").concat("report")
    :["No active specimen. The archive is still public."],effect:null};
  if(text==="cat /signals/report")return {lines:context.awakened
    ?combinedSignalReport(context.signals)
    :["The signal index is dormant."],effect:null};
  if(text.startsWith("cat /signals/")){
    const id=text.slice("cat /signals/".length).replace(/\.note$/,"");
    if(isSignalId(id))return {lines:context.awakened
      ?signalFile(id,context.signals):["The signal index is dormant."],effect:null};
  }
  switch(text){
    case "":return {lines:[],effect:null};
    case "help": return {lines:[
      "AVAILABLE COMMANDS",
      "whoami · uptime · status · sudo hire chandrakant",
      "deploy --friday · theme --chaos · gravity --off",
      "secrets · signals · ls /signals · cat /signals/report",
      "signals --reset · restore · clear · exit",
      "No backend. No real shell. That's called restraint.",
    ],effect:null};
    case "whoami":return {lines:[
      "You: an unidentified visitor with suspiciously excellent taste.",
      "Host: Chandrakant Dubey, developer of things that sometimes work.",
    ],effect:null};
    case "uptime":return {lines:[
      "PORTFOLIO STATUS: operational, pending your next click.",
      "SLA: 99.9% optimism, 0% legally binding promises.",
    ],effect:null};
    case "status":return {lines:[
      "UI: online | API: not queried | BILLING: aggressively avoided",
      "Safety boundary: browser-only commands. No credentials. No exceptions.",
    ],effect:null};
    case "sudo hire chandrakant":return {lines:[
      "REQUEST RECEIVED: technical interview recommended.",
      "AUTHORIZATION: depends on budget, humans and the calendar.",
      "Next step: use the contact section. Even sudo has limits.",
    ],effect:null};
    case "deploy --friday":return {lines:[
      "ERROR: Production has requested a restraining order.",
      "Recommendation: ship small, keep rollback ready, then go home.",
    ],effect:null};
    case "theme --chaos":return {lines:[
      "CHAOS MODE ENABLED. The CSS has chosen violence.",
      "Type restore to make the pixels behave again.",
    ],effect:"chaos"};
    case "gravity --off":return {lines:[
      "GRAVITY DISABLED FOR DECORATIONS. Reality remains unaffected.",
      "The buttons are still where you left them. Probably.",
    ],effect:"gravity"};
    case "secrets":return {lines:[
      "There are no credentials here.",
      "Look for the three engineering notes, then type signals.",
    ],effect:null};
    case "restore":return {lines:["Visual effects reset. Production survives another day."],effect:"restore"};
    case "clear":return {lines:[],effect:"clear"};
    case "exit":return {lines:["Disconnecting from the imaginary mainframe."],effect:"exit"};
    default:return {lines:[
      "command not found: "+text.slice(0,66).replace(/[<>]/g,""),
      "Type help. Improvising root commands is discouraged.",
    ],effect:null};
  }
}
