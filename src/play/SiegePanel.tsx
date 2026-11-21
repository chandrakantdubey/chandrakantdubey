import type { PacketGameState } from './packetEngine.js';
import type { SiegeAction } from './siegeStrategy.js';
import { siegeBudget, PACKET_CLASSES } from './siegeStrategy.js';
import './siege-panel.css';
const TACTICS:ReadonlyArray<{id:SiegeAction;title:string;description:string;cost:number;cooldown?:string}>=[
  {id:'overclock',title:'OVERCLOCK',description:'+3 bandwidth for 18 ticks; rapid heat buildup',cost:24,cooldown:'overclock'},
  {id:'vent',title:'VENT CORE',description:'Drop heat by 44%; takes emergency energy',cost:16,cooldown:'vent'},
  {id:'firewall',title:'FIREWALL',description:'Lower damage from failed packets for 22 ticks',cost:28,cooldown:'firewall'},
  {id:'shed-bulk',title:'SHED BULK',description:'Clear bulk buffers; lose 75 score per dropped packet',cost:8,cooldown:'shed-bulk'},
];
const POLICIES:ReadonlyArray<{id:SiegeAction;title:string;description:string}>=[
  {id:'balanced',title:'BALANCED',description:'Natural packet order and heat'},
  {id:'priority',title:'PRIORITY FIRST',description:'Protect urgent packets; bulk may time out'},
  {id:'conserve',title:'ENERGY SAVER',description:'Less heat, but fewer packet slots per tick'},
];
export default function SiegePanel({game,onOrder}:{game:PacketGameState;onOrder:(action:SiegeAction)=>void}){
  if(game.mode!=='siege'||!game.siege)return null;
  const siege=game.siege;
  const active=game.phase==='playing';
  return <section className="siege-console" aria-label="Five-wave Siege strategy console">
    <div className="siege-heading"><div><span>OPERATIONS TERMINAL / SIEGE V2</span><h3>CONTROL THE PRESSURE.</h3><p>Routing tiles still matters. Now heat, bandwidth, energy, packet class and deliberate load shedding matter too.</p></div>
    <div className="siege-power"><span>CORE TEMPERATURE</span><strong className={siege.heat>80?'siege-red':''}>{Math.round(siege.heat)}%</strong><i><b style={{width:siege.heat+'%',background:siege.heat>80?'#f49e85':'#b5a0fa'}}/></i></div></div>
    <div className="siege-dashboard">
      <div><span>ENERGY RESERVE</span><strong>{Math.round(siege.energy)}%</strong><small>REGENERATES EVERY TICK</small></div>
      <div><span>BANDWIDTH</span><strong>{siegeBudget(siege)}</strong><small>PACKET WORK UNITS / TICK</small></div>
      <div><span>BUFFER</span><strong>{siege.bufferUsed}/16</strong><small>HOLDING CAPACITY</small></div>
      <div><span>PRIORITY DELIVERIES</span><strong>{siege.priorityDelivered}</strong><small>HIGH-VALUE ROUTE SUCCESS</small></div>
    </div>
    <div className="siege-packet-types"><strong>PACKET CLASS INTELLIGENCE</strong>
      <div>{PACKET_CLASSES.map(kind=><span className={'siege-type siege-type-'+kind} key={kind}>{kind.toUpperCase()} <b>{game.packets.filter(p=>p.kind===kind).length}</b></span>)}</div></div>
    <div className="siege-controls"><div className="siege-policies"><h4>THROUGHPUT DISCIPLINE</h4>
      {POLICIES.map(policy=><button type="button" key={policy.id} aria-pressed={siege.policy===policy.id} disabled={!active} onClick={()=>onOrder(policy.id)}>
        <strong>{policy.title}</strong><span>{policy.description}</span></button>)}
    </div><div className="siege-abilities"><h4>TACTICAL ACTIONS</h4>
      <div>{TACTICS.map(action=>{const cooldown=siege.cooldowns[action.id as keyof typeof siege.cooldowns]??0;return <button type="button" key={action.id} onClick={()=>onOrder(action.id)}
        disabled={!active||siege.energy<action.cost||cooldown>0} title={action.description}>
        <span>{action.title}</span><strong>{cooldown?`WAIT ${cooldown} TICKS`:`⚡ ${action.cost} ENERGY`}</strong><small>{action.description}</small>
      </button>})}</div></div></div>
    <div className="siege-foot"><span>LAST COMMAND: {siege.lastTactic.toUpperCase()} · BULK SACRIFICED: {siege.bulkShed} · OVERHEAT TICKS: {siege.overloadedTicks}</span>
      <span>SOLO ONLY / DETERMINISTIC / NO SERVER CHANGES</span></div>
  </section>;
}
