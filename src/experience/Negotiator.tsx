import { useState } from 'react';
import {
  NEGOTIATION_ACTIONS, newNegotiation, negotiate, negotiationEnding,
  type NegotiationAction, type NegotiationState,
} from './negotiatorEngine';
import './negotiator.css';
const INTENTIONS=['INVESTIGATE','NEGOTIATE','RISK','REQUEST'] as const;
function emit(type:'tap'|'success'|'warning'){
  window.dispatchEvent(new CustomEvent('cd:sound-cue',{detail:{type}}));
}
function bar(value:number,color:string){return <span className="neg-gauge"><i style={{width:value+'%',background:color}}/></span>}
/** A consequence-driven, fictional NPC; intentionally no generative API or real privileges. */
export default function Negotiator(){
  const [state,setState]=useState<NegotiationState>(()=>newNegotiation(9));
  const [group,setGroup]=useState<typeof INTENTIONS[number]>('INVESTIGATE');
  const [showProtocol,setShowProtocol]=useState(false);
  const act=(action:NegotiationAction)=>{
    if(state.ending)return;
    const next=negotiate(state,action);
    setState(next);
    emit(next.ending&&next.ending!=='sealed'?'success':next.history.at(-1)?.result==='refusal'?'warning':'tap');
  };
  const last=state.history.at(-1);
  const finished=!!state.ending;
  const goal=state.ending==='transparent-release'?'THE TRANSPARENT PATH':state.ending==='delegated-release'?'THE DELEGATED PATH':state.ending==='sealed'?'THE SWITCH IS SEALED':'THE SWITCH IS LOCKED';
  return <section className="neg" aria-label="The Negotiator fictional engineering dialogue">
    <div className="neg-top"><span>CHAMBER 003 / CONSENT & CONSEQUENCES</span><button type="button" onClick={()=>setShowProtocol(v=>!v)} aria-expanded={showProtocol}>{showProtocol?'CLOSE THE PROTOCOL':'READ THE PROTOCOL +'}</button></div>
    {showProtocol&&<div className="neg-protocol"><strong>THE SENTINEL IS NOT A CHATBOT.</strong> Its state follows explicit deterministic rules. Your dialogue choices alter trust, verifiable proof, safety, shared autonomy, and suspicion. Obtain evidence before asking for control; an empty threat makes things worse. Two distinct resolutions are possible, and a failed negotiation ends with the switch sealed. Everything is simulated locally.</div>}
    <div className="neg-layout">
      <div className="neg-observation">
        <div className="neg-observation-label"><span>ENTITY 017</span><span>CONTAINMENT PROTOCOL</span></div>
        <svg viewBox="0 0 600 650" className="neg-portrait" role="img" aria-label={'Abstract crystalline guardian, '+(finished?'final state':'watching the operator')}>
          <defs>
            <radialGradient id="negAura"><stop stopColor={state.ending==='sealed'?'#ff7252':'#b2a3fb'} stopOpacity=".68"/><stop offset=".5" stopColor="#554bab" stopOpacity=".19"/><stop offset="1" stopColor="#060d1c" stopOpacity="0"/></radialGradient>
            <linearGradient id="negChrome" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff"/><stop offset=".23" stopColor="#b4a6f4"/><stop offset=".44" stopColor="#353249"/><stop offset=".68" stopColor="#faf6ff"/><stop offset="1" stopColor="#5a536e"/></linearGradient>
            <linearGradient id="negGlass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a6c4f1" stopOpacity=".79"/><stop offset=".4" stopColor="#2c2746" stopOpacity=".75"/><stop offset="1" stopColor="#d8c2ff" stopOpacity=".89"/></linearGradient>
          </defs>
          <circle cx="300" cy="297" r="280" fill="url(#negAura)"/>
          <g className="neg-halo"><ellipse cx="300" cy="300" rx="244" ry="75" fill="none" stroke="#a3a1ed" strokeWidth="2" transform="rotate(-34 300 300)" opacity=".56"/><ellipse cx="300" cy="300" rx="251" ry="73" fill="none" stroke="#cdbafd" strokeWidth="2" transform="rotate(57 300 300)" opacity=".43"/></g>
          <path d="M300 63 L452 162 482 368 300 548 117 366 145 165Z" fill="url(#negGlass)" stroke="url(#negChrome)" strokeWidth="9"/>
          <path d="M300 102 L417 184 440 356 300 504 160 354 184 182Z" fill="#0b1226" stroke="#c4b9ff" strokeOpacity=".8" strokeWidth="3"/>
          <path d="M300 102 L300 504 M160 354 L440 356 M184 182 L417 184" fill="none" stroke="#aba2eb" strokeOpacity=".25" strokeWidth="2"/>
          <path d="M188 281 L260 266 275 284 260 297 188 292Z M412 281 L340 266 325 284 340 297 412 292Z" fill={state.suspicion>70?'#fc947b':'#e4f8bc'} opacity={finished?.96:.65+state.trust/320}/>
          <path d="M228 388 L300 403 371 389" fill="none" stroke="#ccb6f1" strokeWidth="3" strokeLinecap="round" opacity=".75"/>
          <circle cx="300" cy="337" r={23+state.proof*.16} fill="none" stroke={finished&&state.ending!=='sealed'?'#d6f9ac':'#9c9af1'} strokeWidth="4" strokeDasharray="4 8"/>
          <circle cx="300" cy="337" r="13" fill={state.ending==='sealed'?'#ee786c':'#e6ebfa'}/>
          <text x="300" y="596" textAnchor="middle" fill="#cbd1e9" fontSize="16" fontFamily="monospace">SENTINEL / SESSION {state.seed.toString().padStart(4,'0')}</text>
        </svg>
        <div className="neg-observation-foot"><span>TRUST SIGNAL {Math.round(state.trust)}%</span><span>TURN {state.turn}/15</span></div>
        <div className="neg-gauges">
          {[['TRUST',state.trust,'#d1efab'],['PROOF',state.proof,'#aba2fd'],['SAFETY',state.safety,'#85c8ea'],['AUTONOMY',state.autonomy,'#f5b38f'],['SUSPICION',state.suspicion,'#f58482']].map(([label,value,color])=><div key={label as string}><span>{label}</span>{bar(value as number,color as string)}<strong>{value}</strong></div>)}
        </div>
      </div>
      <div className="neg-terminal">
        <div className="neg-heading"><span>FICTIONAL DIALOGUE ENGINE · DETERMINISTIC</span><h2>{goal}</h2><p>One switch. One skeptical guardian. Convince the system with a verifiable plan—not a keyword or a bluff.</p></div>
        <div className="neg-exchange" role="log" aria-live="polite" aria-label="Negotiation conversation">
          <div className="neg-agent-line"><span>ENTITY 017 / ORIGIN</span><p>“I won't transfer control to someone who cannot explain the failure mode. Show me what you know.”</p></div>
          {state.history.map(turn=><div className="neg-turn" key={turn.turn}><div className="neg-human-line"><span>OPERATOR / TURN {turn.turn}</span><p>{NEGOTIATION_ACTIONS.find(a=>a.id===turn.action)?.label}</p></div><div className={'neg-agent-line'+(turn.result==='refusal'?' neg-refusal':'')}><span>ENTITY 017 / {turn.result.toUpperCase()}</span><p>{turn.response}</p></div></div>)}
        </div>
        {last&&<div className="neg-last-result" aria-live="polite"><strong>LAST RESPONSE · T{last.turn}</strong><span>{last.result.toUpperCase()} / {state.phase.toUpperCase()}</span></div>}
        {finished?<div className="neg-conclusion"><strong>{goal}</strong><p>{negotiationEnding(state)}</p><button type="button" onClick={()=>{setState(newNegotiation(state.seed+1));setGroup('INVESTIGATE')}}>RESTART WITH A NEW SENTINEL ↻</button><a className="neg-archive-link" href="/access">INVESTIGATE THE HIDDEN ARCHIVE ↗</a></div>:
          <div className="neg-decision"><div className="neg-mode-tabs" role="group" aria-label="Negotiation strategy category">{INTENTIONS.map(mode=><button type="button" key={mode} aria-pressed={group===mode} onClick={()=>setGroup(mode)}>{mode}</button>)}</div>
            <div className="neg-choices">{NEGOTIATION_ACTIONS.filter(a=>a.type===group.toLowerCase()).map(action=><button type="button" onClick={()=>act(action.id)} key={action.id}><span>{action.label}</span><small>{action.hint}</small></button>)}</div>
            <p>Investigations and persuasion consume turns. Outcomes depend on state, evidence, and previous decisions. There is no hidden AI service.</p>
          </div>}
        <div className="neg-bottom"><span>ARCHIVE / {state.evidence.length} OF 4 EVIDENCE FRAGMENTS</span><button type="button" onClick={()=>setState(newNegotiation(state.seed))}>RESET SIMULATION</button></div>
        <div className="neg-artifacts">{state.evidence.length?state.evidence.map(k=><span key={k}>{k.toUpperCase()} VERIFIED ◈</span>):<span>NO DOCUMENTS COLLECTED</span>}</div>
        <div className="neg-disclaimer">Original deterministic game. This agent controls no system, account, application permissions, or real-world infrastructure.</div>
      </div>
    </div>
  </section>;
}
