/**
 * ROOT ACCESS: THE UNDERWORLD / V2
 * A finite, fictional investigation graph. Not a shell, secret checker, or
 * authorization layer. All commands and edges are strictly allowlisted.
 */
export const ROOT_VERSION = '2.0.0' as const;
export type PrimaryArtifact = 'anomaly' | 'recovery' | 'mechanism' | 'entropy' | 'architecture' | 'network';
export type HiddenArtifact = 'cipher' | 'origin';
export type ArchiveArtifact = PrimaryArtifact | HiddenArtifact;
export type Ending = 'contain' | 'understand' | 'erase';
export type ArchivePhase = 'DORMANT' | 'AWAKENED' | 'CORRELATED' | 'BREACHED' | 'RESOLVED';
export type JournalEntry = { step: number; kind: 'discovery' | 'correlation' | 'decryption' | 'resolution'; description: string };
export interface ArchiveState {
  version: typeof ROOT_VERSION;
  correlations: string[];
  hidden: HiddenArtifact[];
  ending: Ending | null;
  journal: JournalEntry[];
}
export interface ArchiveResult {
  state: ArchiveState;
  output: string;
  type: 'info' | 'success' | 'warning';
}
export const ARTIFACTS: Record<ArchiveArtifact,{title:string;route:string;abstract:string;signal:string}> = {
  anomaly:{title:'THE FIRST ECHO',route:'/lab',abstract:'An irregular signal at the edge of the exhibit. All timestamps predate the first visitor.',signal:'00: ORIGIN UNATTRIBUTED'},
  architecture:{title:'THE LIMIT',route:'/engineering',abstract:'Scaling solves some bottlenecks and makes others worse. The signal follows the constraint.',signal:'01: LOAD CANNOT BE WISHED AWAY'},
  recovery:{title:'THE RESPONSE',route:'/lab/disaster',abstract:'An incident is not resolved until the users, not just the graphs, are healthy again.',signal:'02: RECOVERY HAS A COST'},
  network:{title:'THE CROSSING',route:'/play/packet',abstract:'Some paths can be restored. Others demand abandoning a packet to preserve the mesh.',signal:'03: EVERY ROUTE IS A CHOICE'},
  mechanism:{title:'THE MACHINE',route:'/lab/take-five',abstract:'Energy cannot be negotiated with. The gears remember every applied force.',signal:'04: MOTION HAS MEMORY'},
  entropy:{title:'THE GARDEN',route:'/lab/take-five',abstract:'Order demands care. An unmanaged system may bloom—or consume itself.',signal:'05: LIFE IS NOT A LOOP'},
  cipher:{title:'THE GHOST KEY',route:'/access',abstract:'The fragments form a message. The operator was not absent. The operator was fragmented.',signal:'06: THE SYSTEM IS THE SUM OF ITS INTERVENTIONS'},
  origin:{title:'THE OBSERVER',route:'/access',abstract:'The archive was constructed to record decisions, not to grant access. The last decision belongs to the visitor.',signal:'07: NO OPERATOR IS ABOVE THE SYSTEM'},
};
const PRIMARY: PrimaryArtifact[]=['anomaly','architecture','recovery','network','mechanism','entropy'];
const HIDDEN: HiddenArtifact[]=['cipher','origin'];
const ENDINGS:Record<Ending,string> = {
  contain:'ENDING / CONTAINMENT. You isolate the unknown signal and preserve the system. Nothing spectacular happens. That is what reliability often looks like.',
  understand:'ENDING / UNDERSTANDING. You leave the signal visible and document every assumption. The archive remains open for future operators to challenge your interpretation.',
  erase:'ENDING / THE CLEAN SLATE. You intentionally silence the constructed narrative. No data outside this browser is altered. The choice is recorded, and the system remains accountable.',
};
const BASE_LINKS:[ArchiveArtifact,ArchiveArtifact][]=[
  ['anomaly','architecture'],['recovery','network'],['mechanism','entropy'],
  ['architecture','recovery'],
];
const SECRET_LINKS:[ArchiveArtifact,ArchiveArtifact][]=[['cipher','network'],['cipher','anomaly']];
const key=(a:ArchiveArtifact,b:ArchiveArtifact)=>[a,b].sort().join('|');
export const VALID_CORRELATIONS=[...BASE_LINKS,...SECRET_LINKS].map(([a,b])=>key(a,b));

export function newArchive():ArchiveState {
  return {version:ROOT_VERSION,correlations:[],hidden:[],ending:null,journal:[]};
}
export function archiveInventory(discovered:readonly PrimaryArtifact[],state:ArchiveState):ArchiveArtifact[] {
  return [...PRIMARY.filter(id=>discovered.includes(id)),...HIDDEN.filter(id=>state.hidden.includes(id))];
}
export function archivePhase(discovered:readonly PrimaryArtifact[],state:ArchiveState):ArchivePhase {
  if(state.ending)return 'RESOLVED';
  if(state.hidden.includes('cipher'))return 'BREACHED';
  if(state.correlations.length>=3)return 'CORRELATED';
  if(discovered.length || state.correlations.length)return 'AWAKENED';
  return 'DORMANT';
}
function record(state:ArchiveState,kind:JournalEntry['kind'],description:string):ArchiveState {
  return {...state,journal:[...state.journal,{step:state.journal.length+1,kind,description}].slice(-64)};
}
function success(state:ArchiveState,output:string):ArchiveResult{return {state,output,type:'success'};}
function info(state:ArchiveState,output:string):ArchiveResult{return {state,output,type:'info'};}
function warn(state:ArchiveState,output:string):ArchiveResult{return {state,output,type:'warning'};}
export function executeArchive(state:ArchiveState, raw:string,discovered:readonly PrimaryArtifact[]):ArchiveResult {
  if(typeof raw!=='string'||raw.length>120)return warn(state,'COMMAND LIMIT / 120 CHARACTERS.');
  const command=raw.trim().toLowerCase().replace(/\s+/g,' ');
  const tokens=command.split(' ');
  const inventory=archiveInventory(discovered,state);
  if(command==='help')return info(state,'COMMANDS: help · status · map · inspect <artifact> · link <artifact> <artifact> · decode · journal · resolve contain|understand|erase · exit · reset');
  if(command==='status')return info(state,`ARCHIVE PHASE: ${archivePhase(discovered,state)}. DISCOVERIES: ${inventory.length}/8. CORRELATIONS: ${state.correlations.length}/6. FINAL DECISION: ${state.ending??'UNMADE'}.`);
  if(command==='map')return info(state,inventory.length?inventory.map(id=>`${id.toUpperCase()}  ::  ${ARTIFACTS[id].signal}`).join('\n'):'THE ARCHIVE IS EMPTY. EXPLORE THE LAB FIRST.');
  if(command==='journal')return info(state,state.journal.length?state.journal.map(j=>`[${String(j.step).padStart(2,'0')}] ${j.kind.toUpperCase()} :: ${j.description}`).join('\n'):'NO CORRELATIONS RECORDED.');
  if(command==='exit')return info(state,'FICTIONAL SESSION CLOSED. NO REAL SHELL SESSION WAS OPEN.');
  if(command==='reset')return success(newArchive(),'ARCHIVE CORRELATIONS AND ENDING RESET. PRIMARY EXPERIENCE DISCOVERIES ARE KEPT.');
  if(tokens[0]==='inspect'&&tokens.length===2){
    const id=tokens[1];
    if(!Object.hasOwn(ARTIFACTS,id))return warn(state,'UNKNOWN ARTIFACT. USE MAP TO LIST EVIDENCE.');
    if(!inventory.includes(id as ArchiveArtifact))return warn(state,'ARTIFACT LOCKED. FIND ITS SOURCE OR CORRELATE ITS PREREQUISITES.');
    const item=ARTIFACTS[id as ArchiveArtifact];
    return info(state,`${item.title}\n${item.abstract}\nSIGNAL: ${item.signal}\nSOURCE: ${item.route}`);
  }
  if(tokens[0]==='link'&&tokens.length===3){
    const a=tokens[1] as ArchiveArtifact,b=tokens[2] as ArchiveArtifact;
    if(a===b||!Object.hasOwn(ARTIFACTS,a)||!Object.hasOwn(ARTIFACTS,b))return warn(state,'CORRELATION REJECTED / UNKNOWN OR IDENTICAL ARTIFACTS.');
    if(!inventory.includes(a)||!inventory.includes(b))return warn(state,'CORRELATION REJECTED / RECOVER BOTH ARTIFACTS FIRST.');
    const edge=key(a,b);
    if(!VALID_CORRELATIONS.includes(edge))return warn(state,'NO CAUSAL LINK ESTABLISHED. TWO SIMILAR SIGNALS ARE NOT PROOF OF A CONNECTION.');
    if(state.correlations.includes(edge))return info(state,'THIS CORRELATION IS ALREADY IN THE JOURNAL.');
    let next=record({...state,correlations:[...state.correlations,edge]},'correlation',`${a.toUpperCase()} ⇄ ${b.toUpperCase()}`);
    if(next.hidden.includes('cipher') && SECRET_LINKS.every(([x,y])=>next.correlations.includes(key(x,y))) && !next.hidden.includes('origin')){
      next=record({...next,hidden:[...next.hidden,'origin']},'discovery','ORIGIN / THE OBSERVER RECONSTRUCTED');
      return success(next,'CORRELATION ACCEPTED. TWO CROSS-LINKED SIGNALS COMPLETE THE ARCHIVE. ORIGIN UNLOCKED.');
    }
    return success(next,`CORRELATION ACCEPTED / ${a.toUpperCase()} ⇄ ${b.toUpperCase()}. ${next.correlations.length}/6 CONNECTIONS.`);
  }
  if(command==='decode'){
    if(state.hidden.includes('cipher'))return info(state,'THE GHOST KEY WAS ALREADY DECODED. INSPECT CIPHER.');
    const count=BASE_LINKS.filter(([a,b])=>state.correlations.includes(key(a,b))).length;
    if(count<3)return warn(state,`DECRYPTION FAILED. ${3-count} MORE INDEPENDENT EVIDENCE CORRELATION${3-count===1?'':'S'} REQUIRED.`);
    const next=record({...state,hidden:[...state.hidden,'cipher']},'decryption','CIPHER / THE GHOST KEY DECODED');
    return success(next,'DECRYPTION COMPLETE. THE GHOST KEY IS NOW READABLE. INSPECT CIPHER; THEN CONNECT IT TO TWO SOURCE ARTIFACTS.');
  }
  if(tokens[0]==='resolve'&&tokens.length===2){
    const ending=tokens[1] as Ending;
    if(!Object.hasOwn(ENDINGS,ending))return warn(state,'UNKNOWN RESOLUTION. CHOOSE: contain, understand, or erase.');
    if(!state.hidden.includes('origin'))return warn(state,'RESOLUTION LOCKED. RECONSTRUCT THE OBSERVER FIRST.');
    if(state.ending)return info(state,ENDINGS[state.ending]);
    const next=record({...state,ending},'resolution','FINAL DECISION / '+ending.toUpperCase());
    return success(next,ENDINGS[ending]);
  }
  return warn(state,'UNKNOWN FICTIONAL COMMAND. TYPE HELP FOR THE ALLOWLIST.');
}
/** Persistence decoder: only valid, known links and documents survive. */
export function sanitizeArchive(value:unknown):ArchiveState {
  if(!value||typeof value!=='object')return newArchive();
  const o=value as Record<string,unknown>;
  if(o.version!==ROOT_VERSION)return newArchive();
  const correlations=Array.isArray(o.correlations)?o.correlations.filter(
    (item):item is string=>typeof item==='string'&&VALID_CORRELATIONS.includes(item)).slice(0,6):[];
  const hidden:HiddenArtifact[]=[];
  const base=BASE_LINKS.filter(([a,b])=>correlations.includes(key(a,b))).length;
  if(base>=3&&Array.isArray(o.hidden)&&o.hidden.includes('cipher'))hidden.push('cipher');
  if(hidden.includes('cipher')&&SECRET_LINKS.every(([a,b])=>correlations.includes(key(a,b)))&&Array.isArray(o.hidden)&&o.hidden.includes('origin'))hidden.push('origin');
  const ending:Ending|null=hidden.includes('origin')&&['contain','understand','erase'].includes(o.ending as string)?o.ending as Ending:null;
  const journal:Array<JournalEntry>=Array.isArray(o.journal)?o.journal.filter(j=>j&&typeof j==='object'&&
    typeof j.description==='string'&&j.description.length<140&&['discovery','correlation','decryption','resolution'].includes(j.kind))
    .slice(0,64).map((j,i)=>({step:i+1,kind:j.kind as JournalEntry['kind'],description:j.description})):[];
  return {version:ROOT_VERSION,correlations:[...new Set(correlations)],hidden,ending,journal};
}
