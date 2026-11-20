/**
 * A deliberately fictional portfolio command line.
 * Commands only change the local page presentation; no eval, shell,
 * network requests, private data, privileged actions or stateful backend.
 */
export type RootEffect="chaos"|"gravity"|"restore"|"exit"|"clear"|null;
export interface RootReply {lines:string[];effect:RootEffect;}
export const ROOT_COMMANDS=[
  "help","whoami","uptime","sudo hire chandrakant",
  "deploy --friday","theme --chaos","gravity --off","restore",
  "secrets","status","clear","exit",
] as const;
export function runRootCommand(raw:string):RootReply {
  const text=raw.trim().replace(/\s+/g," ").toLowerCase();
  switch(text){
    case "":return {lines:[],effect:null};
    case "help": return {lines:[
      "AVAILABLE COMMANDS",
      "whoami · uptime · status · sudo hire chandrakant",
      "deploy --friday · theme --chaos · gravity --off",
      "secrets · restore · clear · exit",
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
      "Nice try. Real secrets belong on the server.",
      "The secret here is that every command is hard-coded.",
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
