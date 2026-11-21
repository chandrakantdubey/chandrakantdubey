import assert from 'node:assert/strict';
import * as original from './fixtures/packetEngine.baseline.mjs';
import * as engine from '../src/play/packetEngine.js';
for(let seed of [0,17,2026]) {
  assert.deepEqual(engine.newPacketGame(seed,2), original.newPacketGame(seed,2), 'legacy multiplayer unaffected');
  assert.deepEqual(engine.advancePacketGame(engine.beginPacketGame(engine.newPacketGame(seed,2),1000),1000+520*50),
    original.advancePacketGame(original.beginPacketGame(original.newPacketGame(seed,2),1000),1000+520*50));
}
const init=engine.newCoopGame(12,1);
assert.equal(init.players,1);
assert.deepEqual(init.coop,{pairCharges:2,shieldCharges:2,pendingShields:0,blockedFaults:0});
const started=engine.beginPacketGame({...init,players:2},1000);
const paired=engine.pairRotateCoop(started,2);
assert.equal(paired.coop.pairCharges,1);
assert.equal((started.tiles[2].rotation+1)&3,paired.tiles[2].rotation);
assert.equal((started.tiles[3].rotation+1)&3,paired.tiles[3].rotation);
assert.equal(started.coop.pairCharges,2,'original state unchanged');
assert.equal(engine.pairRotateCoop(started,3),started,'host cannot rotate beyond ingress boundary');
assert.equal(engine.pairRotateCoop(engine.beginPacketGame(engine.newPacketGame(12,2),1000),1).coop,undefined);
let shield=engine.shieldCoopFault(started);
assert.equal(shield.coop.pendingShields,1);
assert.equal(shield.coop.shieldCharges,1);
const notJoined={...started,players:1};
assert.equal(engine.shieldCoopFault(notJoined),notJoined,'no guest before joined');
// Directly connect lanes so the round survives until a deterministic tick-64 fault.
function direct(game){
  const tiles=game.tiles.map(x=>({...x}));
  for(const row of [1,3]) for(let col=0;col<engine.COLS;col++) {
    const tile=tiles[row*engine.COLS+col];
    for(let rot=0;rot<4;rot++) {tile.rotation=rot;const ports=engine.tilePorts(tile);if((ports&2)&&(ports&8))break;}
    assert.ok((engine.tilePorts(tile)&2)&&(engine.tilePorts(tile)&8));
  }
  return {...game,tiles};
}
const base=engine.beginPacketGame(direct(engine.newCoopGame(2026,2)),1000);
const ready=engine.shieldCoopFault(base);
const shielded=engine.advancePacketGame(ready,1000+520*66);
const unshielded=engine.advancePacketGame(base,1000+520*66);
assert.ok(shielded.coop.blockedFaults>=1,'queued shield absorbs the tick-64 router incident');
assert.ok(shielded.incidents<unshielded.incidents,'defense changes actual incident outcome');
assert.equal(shielded.coop.pendingShields,0);
assert.ok(ready.coop.pendingShields===1,'CAS state immutable by engine advancement');
assert.deepEqual(engine.advancePacketGame(ready,1000+520*66),shielded,'identical snapshots produce identical co-op state');
console.log('Co-op V2: authenticated-engine prerequisites, atomic two-router turn, delayed shielding and legacy parity PASS');
