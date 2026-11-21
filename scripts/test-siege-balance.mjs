import assert from 'node:assert/strict';
import {
  newSiegeGame,beginPacketGame,rotatePacketTile,patchPacketNetwork,
  advancePacketGame,tilePorts,COLS,
} from '../src/play/packetEngine.js';
import {siegeOrder} from '../src/play/siegeStrategy.js';
function align(game){
  let state=game;
  for(const row of [1,3])for(let col=0;col<COLS;col++){
    const index=row*COLS+col;
    for(let turn=0;turn<4;turn++){
      const mask=tilePorts(state.tiles[index]);
      if((mask&2)&&(mask&8))break;
      state=rotatePacketTile(state,index);
    }
    const mask=tilePorts(state.tiles[index]);
    assert.ok((mask&2)&&(mask&8),'operator keeps both lanes connected');
  }
  return state;
}
function operate(policy){
  let game=beginPacketGame(newSiegeGame(2026),0);
  game=align(game);game=siegeOrder(game,policy);
  for(let tick=1;tick<=462&&game.phase==='playing';tick++){
    game=advancePacketGame(game,tick*520);
    if(game.phase!=='playing')break;
    game=align(game);
    if(game.integrity<=75&&game.patches>0)game=patchPacketNetwork(game);
    if(game.siege.energy>25&&game.siege.heat>69)game=siegeOrder(game,'vent');
    if(game.siege.energy>52&&game.siege.heat<35&&!game.siege.overclockTicks)game=siegeOrder(game,'overclock');
  }
  return game;
}
const balanced=operate('balanced');
const conservative=operate('conserve');
assert.equal(balanced.phase,'won','a skilled operator can beat all five waves');
assert.equal(balanced.tick,462);
assert.ok(balanced.delivered>120,'difficult rounds contain a substantial flow of packets');
assert.ok(balanced.spawned>145,'late-wave packet director increases network traffic');
assert.equal(conservative.phase,'lost','throughput-sacrificing policy has genuine late-wave consequences');
assert.ok(conservative.tick<balanced.tick);
assert.ok(balanced.delivered>conservative.delivered);
assert.deepEqual(operate('balanced'),balanced,'whole-round strategy replay is deterministic');
console.log('Siege balance: five-wave winning path, late-wave burst, strategic policy tradeoff and replay PASS');
