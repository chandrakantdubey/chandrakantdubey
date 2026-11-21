import assert from 'node:assert/strict';
import {createGarden,advanceGarden,applyGardenCommand,gardenReplay,restoreGarden,gardenMetrics,GARDEN_AREA} from '../src/experience/entropyEngine.ts';
import {newArchive,executeArchive,sanitizeArchive} from '../src/experience/rootNarrativeEngine.ts';
import {newNegotiation,negotiate,NEGOTIATION_ACTIONS} from '../src/experience/negotiatorEngine.ts';
import {newCoopGame,newSiegeGame,beginPacketGame,advancePacketGame,pairRotateCoop,shieldCoopFault,rotatePacketTile,patchPacketNetwork} from '../src/play/packetEngine.js';
import {siegeOrder,SIEGE_ORDERS} from '../src/play/siegeStrategy.js';
import {estimateCapacity,simulateResilience,BASE_CAPACITY,BASE_RESILIENCE} from '../src/experience/systemsModel.ts';
let cases=0;
function rng(seed){let state=seed>>>0;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;}}
for(let seed=0;seed<24;seed++){
  const rand=rng(seed+11);
  let g=createGarden(seed);
  for(let i=0;i<48;i++){
    const draw=Math.floor(rand()*6);
    if(draw===0)g=applyGardenCommand(g,{type:'climate',climate:{rain:Math.floor(rand()*101),light:Math.floor(rand()*101),wind:Math.floor(rand()*101)}});
    else if(draw===1)g=applyGardenCommand(g,{type:'seed-storm'});
    else if(draw<=4)g=applyGardenCommand(g,{type:'interact',x:Math.floor(rand()*52),y:Math.floor(rand()*32),tool:draw===2?'water':draw===3?'feed':'plant',species:draw===4?Math.floor(rand()*3)+1:undefined});
    g=advanceGarden(g,3);
  }
  assert.equal(g.cells.length,GARDEN_AREA);
  assert.ok(Object.values(gardenMetrics(g)).every(v=>!Number.isNaN(Number(v))||Array.isArray(v)));
  assert.deepEqual(restoreGarden(gardenReplay(g)),g,'garden roundtrip seed '+seed);
  cases++;
  let n=newNegotiation(seed);
  const actions=NEGOTIATION_ACTIONS.map(a=>a.id);
  for(let i=0;i<20;i++)n=negotiate(n,actions[Math.floor(rand()*actions.length)]);
  assert.ok(n.turn<=15);
  cases++;
  let p=beginPacketGame(newSiegeGame(seed),1000);
  for(let time=1;time<=462;time++){
    if(rand()<.12)p=rotatePacketTile(p,Math.floor(rand()*35));
    if(rand()<.08)p=siegeOrder(p,SIEGE_ORDERS[Math.floor(rand()*SIEGE_ORDERS.length)]);
    if(rand()<.02)p=patchPacketNetwork(p);
    p=advancePacketGame(p,1000+520*time);
    assert.ok(p.integrity>=0&&p.integrity<=100);
    assert.ok(p.siege.heat>=0&&p.siege.heat<=100);
    assert.ok(p.siege.energy>=0&&p.siege.energy<=100);
    assert.ok(p.packets.every(x=>x.row>=0&&x.row<5&&x.col>=0&&x.col<7));
    assert.ok(p.packets.length<=16);
  }
  cases++;
  let c=beginPacketGame({...newCoopGame(seed,2)},1000);
  for(let time=1;time<=100;time++){
    if(rand()<.05)c=pairRotateCoop(c,Math.floor(rand()*35));
    if(rand()<.04)c=shieldCoopFault(c);
    if(rand()<.5)c=rotatePacketTile(c,Math.floor(rand()*35));
    c=advancePacketGame(c,1000+520*time);
    assert.ok(c.coop.pairCharges>=0&&c.coop.shieldCharges>=0&&c.coop.pendingShields>=0);
  }
  cases++;
  const system=estimateCapacity({...BASE_CAPACITY,rps:Math.floor(rand()*10_001),regionCount:1+Math.floor(rand()*3),failRegion:rand()>.5,edgeHit:Math.floor(rand()*96)});
  assert.ok(system.availabilityPct>=0&&system.availabilityPct<=100);
  assert.ok(system.servedRps<=system.demandRps+1e-8);
  const resil=simulateResilience({...BASE_RESILIENCE,baseRps:rand()*1200,dependencyCapacity:100+rand()*1000,failureRate:rand()*50});
  assert.equal(resil.ticks.length,60);
  assert.ok(resil.completed>=0);
  cases++;
}
let a=newArchive();const discovery=['anomaly','architecture','recovery','network','mechanism','entropy'];
for(const command of ['help','map','status','link anomaly architecture','link mechanism entropy','link recovery network','decode','link cipher network','link cipher anomaly','resolve contain']){
  a=executeArchive(a,command,discovery).state;
  assert.deepEqual(sanitizeArchive(JSON.parse(JSON.stringify(a))),a);
}
console.log('FUZZ PASS: '+cases+' cross-system seed scenarios plus ROOT replay persistence');
