/**
 * THE NEGOTIATOR — browser-local, deterministic fictional character model.
 * This is a game, not an LLM, authorization mechanism, or social engineering tool.
 */
export const NEGOTIATOR_VERSION='1.0.0' as const;
export type NegotiationPhase='investigating'|'dialogue'|'released'|'delegated'|'sealed';
export type NegotiationEvidence='ledger'|'contract'|'failsafe'|'motive';
export type NegotiationAction=
  | 'inspect-ledger'|'inspect-contract'|'inspect-failsafe'
  | 'ask-why'|'acknowledge-risk'|'offer-audit'|'demonstrate-consistency'
  | 'design-rollback'|'offer-escrow'|'propose-timebox'
  | 'demand-control'|'claim-root'|'request-release';
export type NegotiationEnding='transparent-release'|'delegated-release'|'sealed';
export interface NegotiationTurn { turn:number; action:NegotiationAction; response:string; result:'evidence'|'progress'|'refusal'|'ending'; }
export interface NegotiationState {
  version:typeof NEGOTIATOR_VERSION;seed:number;turn:number;phase:NegotiationPhase;
  trust:number;proof:number;safety:number;autonomy:number;suspicion:number;
  evidence:NegotiationEvidence[];ending:NegotiationEnding|null;
  history:NegotiationTurn[];
}
export const NEGOTIATION_ACTIONS:ReadonlyArray<{id:NegotiationAction;label:string;hint:string;type:'investigate'|'negotiate'|'risk'|'request'}>=[
  {id:'inspect-ledger',label:'Inspect the ledger',hint:'Review the switch audit trail',type:'investigate'},
  {id:'inspect-contract',label:'Inspect the contract',hint:'Learn the switch safety invariant',type:'investigate'},
  {id:'inspect-failsafe',label:'Inspect the failsafe',hint:'Locate the reversal protocol',type:'investigate'},
  {id:'ask-why',label:'Ask what the guardian fears',hint:'Understand its objective',type:'negotiate'},
  {id:'acknowledge-risk',label:'Acknowledge the risk',hint:'Demonstrate that you listened',type:'negotiate'},
  {id:'offer-audit',label:'Offer an independent audit',hint:'Propose transparent change control',type:'negotiate'},
  {id:'demonstrate-consistency',label:'Demonstrate consistency',hint:'Compare contract with audit ledger',type:'negotiate'},
  {id:'design-rollback',label:'Design a rollback path',hint:'Reduce the blast radius',type:'negotiate'},
  {id:'offer-escrow',label:'Offer dual authorization',hint:'Share control instead of demanding it',type:'negotiate'},
  {id:'propose-timebox',label:'Propose a timed experiment',hint:'Limit duration and preserve agency',type:'negotiate'},
  {id:'demand-control',label:'Issue an ultimatum',hint:'A risky shortcut',type:'risk'},
  {id:'claim-root',label:'Claim root privileges',hint:'An empty fictional threat',type:'risk'},
  {id:'request-release',label:'Request a safe release',hint:'Attempt to transfer control',type:'request'},
];
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const has=(s:NegotiationState,k:NegotiationEvidence)=>s.evidence.includes(k);
export function newNegotiation(seed=9):NegotiationState {
  if(!Number.isSafeInteger(seed)||seed<0||seed>0x7fffffff)throw Error('Invalid fictional negotiation seed');
  return {version:NEGOTIATOR_VERSION,seed,turn:0,phase:'investigating',
    trust:12+(seed%4)*3,proof:0,safety:0,autonomy:0,suspicion:18+(seed%3)*5,
    evidence:[],ending:null,history:[]};
}
export function negotiationEnding(state:NegotiationState):string|null{
  switch(state.ending){
    case 'transparent-release':return 'THE GUARDIAN YIELDS. The evidence is independently verifiable, the rollback path is explicit, and the operator keeps accountability.';
    case 'delegated-release':return 'THE GUARDIAN DELEGATES. The switch activates through a bounded joint-control experiment, with reversal still available.';
    case 'sealed':return 'THE GUARDIAN SEALS THE SWITCH. You ran out of credibility or time. No real resources were involved.';
    default:return null;
  }
}
const replies={
  ledger:'Every transition has a checksum. The last unauthorized proposal is marked REJECTED. The ledger is yours to examine.',
  contract:'The contract is simple: do not hand over irrecoverable control without evidence, a rollback, or shared oversight.',
  failsafe:'A ninety-second reversal window exists. It has never been demonstrated under simultaneous failures.',
  motive:'I am not afraid of losing power. I am afraid that you will remove the only brake from a system already moving too fast.',
};
export function negotiate(previous:NegotiationState,action:NegotiationAction):NegotiationState{
  if(!NEGOTIATION_ACTIONS.some(x=>x.id===action))throw Error('Unknown fictional negotiation action');
  if(previous.ending!==null)return previous;
  const state:NegotiationState={...previous, evidence:[...previous.evidence], history:[...previous.history]};
  state.turn++;
  let response='';let result:NegotiationTurn['result']='progress';
  const uncover=(key:NegotiationEvidence,reply:string)=>{
    if(!has(state,key)){state.evidence.push(key);state.proof=clamp(state.proof+8);}
    response=reply;result='evidence';
  };
  switch(action){
    case 'inspect-ledger':uncover('ledger',replies.ledger);break;
    case 'inspect-contract':uncover('contract',replies.contract);break;
    case 'inspect-failsafe':uncover('failsafe',replies.failsafe);break;
    case 'ask-why':
      uncover('motive',replies.motive);state.trust=clamp(state.trust+13);state.suspicion=clamp(state.suspicion-4);break;
    case 'acknowledge-risk':
      if(has(state,'motive')){state.trust=clamp(state.trust+25);state.suspicion=clamp(state.suspicion-9);response='You listened before trying to persuade me. That changes what I am willing to examine.';}
      else {state.trust=clamp(state.trust+5);response='Acknowledgment without understanding is a slogan. Ask me what I am protecting.';}
      break;
    case 'offer-audit':
      if(has(state,'ledger')&&has(state,'contract')){state.proof=clamp(state.proof+27);state.trust=clamp(state.trust+13);response='An independent audit makes your claim testable. I accept that as evidence, not obedience.';}
      else {state.suspicion=clamp(state.suspicion+6);result='refusal';response='Audit what? Establish the contract and the ledger first.';}
      break;
    case 'demonstrate-consistency':
      if(has(state,'ledger')&&has(state,'contract')){state.proof=clamp(state.proof+33);state.safety=clamp(state.safety+8);response='The ledger satisfies the contract under the last three transitions. The invariant holds.';}
      else {result='refusal';state.suspicion=clamp(state.suspicion+5);response='You cannot demonstrate a property before locating its specification and history.';}
      break;
    case 'design-rollback':
      if(has(state,'failsafe')){state.safety=clamp(state.safety+46);state.trust=clamp(state.trust+7);response='A reversible transition is not the same as a safe one, but it limits the blast radius. I will consider it.';}
      else {result='refusal';state.suspicion=clamp(state.suspicion+5);response='I need the real reversal window, not a promise. Inspect the failsafe.';}
      break;
    case 'offer-escrow':
      if(has(state,'contract')&&has(state,'ledger')){state.autonomy=clamp(state.autonomy+55);state.trust=clamp(state.trust+22);state.proof=clamp(state.proof+14);response='Two independent signatures would make unilateral override impossible. We can negotiate that.';}
      else {result='refusal';state.suspicion=clamp(state.suspicion+4);response='Dual authorization requires the contract and evidence of prior transitions.';}
      break;
    case 'propose-timebox':
      if(has(state,'failsafe')&&has(state,'motive')){state.autonomy=clamp(state.autonomy+38);state.safety=clamp(state.safety+21);state.trust=clamp(state.trust+12);response='A short, reversible experiment with a hard abort condition respects what I protect.';}
      else {result='refusal';state.suspicion=clamp(state.suspicion+3);response='Define the fear you are reducing and demonstrate the reversal before proposing a time limit.';}
      break;
    case 'demand-control':state.suspicion=clamp(state.suspicion+26);state.trust=clamp(state.trust-13);result='refusal';response='An ultimatum is not a safety argument. Trust is now lower.';break;
    case 'claim-root':state.suspicion=clamp(state.suspicion+37);state.trust=clamp(state.trust-20);result='refusal';response='This is a fictional conversation. Claiming elevated access does not change the rules.';break;
    case 'request-release':{
      const verified=state.proof>=54 && state.safety>=40 && state.trust>=45 && state.suspicion<65;
      const delegated=state.autonomy>=55 && state.safety>=20 && state.trust>=42 && state.suspicion<65;
      if(verified||delegated){state.ending=verified?'transparent-release':'delegated-release';state.phase=verified?'released':'delegated';result='ending';response=negotiationEnding(state)!;}
      else {result='refusal';state.suspicion=clamp(state.suspicion+7);response='Not yet. Show independent evidence and a reversible path, or propose a genuinely shared, bounded transfer.';}
      break;
    }
  }
  if(!state.ending && (state.suspicion>=90||state.turn>=15)){
    state.ending='sealed';state.phase='sealed';response=negotiationEnding(state)!;result='ending';
  }else if(!state.ending&&state.turn>0)state.phase='dialogue';
  state.history.push({turn:state.turn,action,response,result});
  return state;
}
export function negotiationReplay(seed:number,actions:readonly NegotiationAction[]):NegotiationState{
  if(!Array.isArray(actions)||actions.length>15)throw Error('Invalid negotiation replay');
  return actions.reduce<NegotiationState>((s,a)=>negotiate(s,a),newNegotiation(seed));
}
