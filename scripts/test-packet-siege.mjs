import assert from 'node:assert/strict';
import * as original from './fixtures/packetEngine.baseline.mjs';
import * as current from '../src/play/packetEngine.js';
import {siegeOrder} from '../src/play/siegeStrategy.js';
for(const seed of [1,17,2026,1234567]){
  const old=original.beginPacketGame(original.newPacketGame(seed,2),1000);
  const next=current.beginPacketGame(current.newPacketGame(seed,2),1000);
  assert.deepEqual(next,old,'Multiplayer state must remain byte-equivalent to original rules');
  for(const ticks of [3,18,50,90]){
    assert.deepEqual(current.advancePacketGame(next,1000+ticks*520), original.advancePacketGame(old,1000+ticks*520),'Server-authoritative room tick must be unaffected');
  }
  assert.deepEqual(current.beginPacketGame(current.newPacketGame(seed,1),0),original.beginPacketGame(original.newPacketGame(seed,1),0));
}
const start=current.beginPacketGame(current.newSiegeGame(91),1000);
assert.ok(start.siege&&start.mode==='siege');
const action=siegeOrder(start,'overclock');
assert.ok(action.siege.overclockTicks>0);
assert.equal(siegeOrder(start,'invalid'),start);
assert.equal(siegeOrder({...start,players:2},'overclock').siege,start.siege);
let outcome=current.advancePacketGame(action,1000+520*42);
assert.equal(outcome.tick,42);
assert.ok(outcome.siege.heat>=0&&outcome.siege.heat<=100);
assert.ok(outcome.siege.energy>=0&&outcome.siege.energy<=100);
assert.ok(outcome.siege.overclockTicks<=18);
assert.ok(outcome.spawned>0);
assert.ok(outcome.missed>=0&&outcome.integrity>=0&&outcome.integrity<=100);
let a=current.advancePacketGame(action,1000+520*45);
let b=current.advancePacketGame(action,1000+520*45);
assert.deepEqual(a,b,'Absolute-time Siege simulation is deterministic');
// Engineer a fully connected direct route to test packet classes and weighted rewards.
function routeStraight(game){
  const tiles=game.tiles.map(tile=>({...tile}));
  for(const row of [1,3])for(let col=0;col<current.COLS;col++){
    const index=row*current.COLS+col;
    const tile=tiles[index];
    let found=false;
    for(let rot=0;rot<4;rot++){
      tile.rotation=rot;
      const ports=current.tilePorts(tile);
      if((ports&2)&&(ports&8)){found=true;break;}
    }
    assert.ok(found,'all lane routers admit an E/W route');
  }
  return {...game,tiles};
}
const perfect=current.beginPacketGame(routeStraight(current.newSiegeGame(2026)),1000);
const balanced=current.advancePacketGame(perfect,1000+520*75);
const priorityMode=current.advancePacketGame(siegeOrder(perfect,'priority'),1000+520*75);
assert.ok(balanced.delivered>0,'packet classes route through existing tile rules');
assert.ok(priorityMode.delivered>0);
assert.ok(balanced.siege.priorityDelivered>=0);
const conserved=current.advancePacketGame(siegeOrder(perfect,'conserve'),1000+520*75);
assert.notDeepEqual(conserved.siege,balanced.siege,'conserve policy has distinct energy and heat consequences');
assert.notDeepEqual(priorityMode.siege,balanced.siege,'prioritization changes resource state');
assert.equal(current.advancePacketGame(balanced,1000+520*75),balanced,'absolute clock advance is idempotent');
console.log('Packet Siege integration: unchanged quick and two-player rules, class routing, tactics and deterministic clock PASS');
