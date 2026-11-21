import assert from 'node:assert/strict';
import {
  siegeClass,newSiegeStrategy,siegeOrder,siegeBudget,packetTTL,packetWeight,
  siegeAdvanceResources,siegeProcessOrder,siegeMissImpact,siegeDeliveryBonus,
} from '../src/play/siegeStrategy.js';
const initial=newSiegeStrategy(123);
assert.deepEqual(initial,newSiegeStrategy(123));
assert.deepEqual(Array.from({length:35},(_,id)=>siegeClass(100,id)),Array.from({length:35},(_,id)=>siegeClass(100,id)));
assert.ok(new Set(Array.from({length:90},(_,id)=>siegeClass(100,id))).size===4);
assert.equal(packetWeight('bulk'),2);
assert.ok(packetTTL('bulk')>packetTTL('priority'));
const state={mode:'siege',players:1,phase:'playing',version:1,eventId:0,lastEvent:'ready',score:1000,tick:10,
  packets:[{id:1,kind:'bulk',age:1},{id:2,kind:'priority',age:1}],siege:initial};
const overclock=siegeOrder(state,'overclock');
assert.ok(overclock.siege.energy<initial.energy&&overclock.siege.overclockTicks>0);
assert.ok(siegeBudget(overclock.siege)>siegeBudget(initial));
assert.notEqual(overclock,state);
assert.equal(siegeOrder(overclock,'overclock'),overclock,'cooldown prevents ability spam');
const shed=siegeOrder(state,'shed-bulk');
assert.equal(shed.packets.length,1);
assert.equal(shed.siege.bulkShed,1);
assert.ok(shed.score<state.score);
assert.equal(state.packets.length,2,'original state remains unchanged');
const priority=siegeOrder(state,'priority');
assert.equal(siegeProcessOrder(state.packets,priority.siege)[0].kind,'priority');
assert.ok(siegeDeliveryBonus({kind:'priority'})>siegeDeliveryBonus({kind:'bulk'}));
const firewall=siegeOrder(state,'firewall');
assert.ok(siegeMissImpact({kind:'priority'},firewall.siege)<siegeMissImpact({kind:'priority'},initial));
const a=siegeAdvanceResources(overclock.siege,state.packets,3);
const b=siegeAdvanceResources(overclock.siege,state.packets,3);
assert.deepEqual(a,b);
assert.ok(a.heat>initial.heat);
assert.equal(siegeOrder({...state,mode:'quick'},'overclock').siege,initial,'quick-mode state is untouched');
assert.equal(siegeOrder({...state,players:2},'overclock').siege,initial,'multiplayer state is untouched');
console.log('Packet Siege: deterministic classification, policy, cooldown, heat, energy, anti-farming, compatibility PASS');
