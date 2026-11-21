/** Fictional discoveries only. No privileges, secrets, or trusted achievements. */
export const DISCOVERIES={
  anomaly:"The first anomaly: entering the engineering lab.",
  recovery:"A verified-in-browser simulated incident recovery.",
  mechanism:"A three-rotor phase mechanism has been aligned.",
  entropy:"A procedural artifact has been exported.",
  architecture:"A modeled architecture exceeded its throughput envelope.",
  network:"A Packet Panic match concluded.",
} as const;
export type Discovery=keyof typeof DISCOVERIES;
const KEY="cd:experience-discoveries:v1";
export function readDiscoveries():Discovery[] {
  try {
    const raw=JSON.parse(localStorage.getItem(KEY)||"[]");
    return Array.isArray(raw)?raw.filter((s):s is Discovery=>typeof s==="string"&&Object.hasOwn(DISCOVERIES,s)).slice(0,6):[];
  } catch { return []; }
}
export function revealDiscovery(id:Discovery) {
  const current=readDiscoveries();
  if (!current.includes(id)) {
    try {localStorage.setItem(KEY,JSON.stringify([...current,id]));}catch { /* Optional progress must never break navigation. */ }
    window.dispatchEvent(new CustomEvent("cd:discovery",{detail:{id}}));
    window.dispatchEvent(new CustomEvent("cd:sound-cue",{detail:{type:"discovery"}}));
  }
}
export function resetDiscoveries() {
  try{localStorage.removeItem(KEY);}catch { /* storage may be blocked */ }
  window.dispatchEvent(new Event("cd:discovery"));
}
export function interpretCommand(raw:string,found:readonly Discovery[]):string {
  const command=raw.trim().toLowerCase().replace(/\s+/g," ");
  if(command==="help")return "COMMANDS: help · status · ls /archive · inspect <id> · link recovery mechanism · whoami · exit";
  if(command==="status")return "ARCHIVE: "+found.length+"/6 artifacts located. SANDBOX: BROWSER ONLY.";
  if(command==="whoami")return "An operator with alarming curiosity. No elevated privileges have been issued.";
  if(command==="ls /archive")return found.length?found.join("\n"):"No artifacts. Explore the lab.";
  if(command.startsWith("inspect ")){
    const id=command.slice(8);
    return Object.hasOwn(DISCOVERIES,id)?found.includes(id as Discovery)?DISCOVERIES[id as Discovery]:"ACCESS DENIED: artifact not discovered.":"Unknown artifact.";
  }
  if(command==="link recovery mechanism"){
    return found.includes("recovery")&&found.includes("mechanism")
      ?"CORRELATION ESTABLISHED. The mechanical and computational systems both respond to intervention. Archive integrity increased."
      :"CORRELATION FAILED. The recovery and mechanism artifacts are both required.";
  }
  if(command==="exit")return "Disconnecting. Nothing was actually connected.";
  return "Unknown fictional command. Type help.";
}
